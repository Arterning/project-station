import Parser from 'rss-parser';

// RSS解析器实例
const parser = new Parser({
  customFields: {
    item: [
      ['comments', 'comments'], // Hacker News comments URL
      ['point', 'points'], // Hacker News points
    ],
  },
});

// 数据源配置接口
export interface RSSSourceConfig {
  name: string;
  type: 'HACKER_NEWS' | 'REDDIT' | 'PRODUCT_HUNT' | 'GITHUB' | 'OTHER';
  rssUrl: string;
  parseItem: (item: any) => ParsedRSSItem | null;
}

// 解析后的RSS条目
export interface ParsedRSSItem {
  title: string;
  url: string;
  publishedAt: Date;
  score: number;
  commentCount: number;
}

// 计算热度分数（综合评分和评论数）
export function calculateHotScore(score: number, commentCount: number): number {
  // 热度公式：(评分 * 0.6) + (评论数 * 0.4)
  // 可以根据实际情况调整权重
  return score * 0.6 + commentCount * 0.4;
}

// 从Hacker News评论URL中提取评论数
function extractHNCommentCount(commentsUrl: string): number {
  try {
    // Hacker News评论URL格式: https://news.ycombinator.com/item?id=12345
    // 实际评论数需要从页面抓取，这里先返回0，后续可以优化
    return 0;
  } catch {
    return 0;
  }
}

// 从Hacker News points字符串中提取数字
function extractHNPoints(pointsStr: string | undefined): number {
  if (!pointsStr) return 0;
  const match = pointsStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Hacker News数据源配置
export const hackerNewsSource: RSSSourceConfig = {
  name: 'Hacker News',
  type: 'HACKER_NEWS',
  rssUrl: 'https://news.ycombinator.com/rss',
  parseItem: (item: any): ParsedRSSItem | null => {
    try {
      // Hacker News RSS格式:
      // - title: 帖子标题
      // - link: 帖子链接
      // - pubDate: 发布时间
      // - comments: 评论页面链接
      // - 没有直接的points和comment count，需要从页面抓取

      const title = item.title?.trim();
      const url = item.link?.trim();
      const pubDate = item.pubDate || item.isoDate;

      if (!title || !url || !pubDate) {
        return null;
      }

      // 从comments链接提取评论数（简化版本）
      // 实际项目中可以通过API或爬虫获取准确数据
      const commentCount = item.comments ? 1 : 0; // 占位符
      const score = 1; // 占位符，实际需要从API获取

      return {
        title,
        url,
        publishedAt: new Date(pubDate),
        score,
        commentCount,
      };
    } catch (error) {
      console.error('Failed to parse Hacker News item:', error);
      return null;
    }
  },
};

// 从RSS feed获取数据
export async function fetchRSSFeed(
  sourceConfig: RSSSourceConfig,
  limit: number = 50
): Promise<ParsedRSSItem[]> {
  try {
    const feed = await parser.parseURL(sourceConfig.rssUrl);
    const items: ParsedRSSItem[] = [];

    for (const item of feed.items) {
      const parsed = sourceConfig.parseItem(item);
      if (parsed) {
        items.push(parsed);
      }

      // 达到限制数量后停止
      if (items.length >= limit) {
        break;
      }
    }

    return items;
  } catch (error) {
    console.error(`Failed to fetch RSS feed from ${sourceConfig.name}:`, error);
    throw new Error(`RSS feed fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Hacker News API获取详细数据（包括真实的分数和评论数）
export async function fetchHackerNewsTop(limit: number = 50): Promise<ParsedRSSItem[]> {
  try {
    // Hacker News Official API
    const topStoriesRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topStoryIds: number[] = await topStoriesRes.json();

    // 只获取前N个故事
    const storyIds = topStoryIds.slice(0, limit);

    // 并发获取故事详情
    const stories = await Promise.all(
      storyIds.map(async (id) => {
        try {
          const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          return await res.json();
        } catch {
          return null;
        }
      })
    );

    // 过滤并转换数据
    const items: ParsedRSSItem[] = stories
      .filter((story) => story && story.type === 'story' && story.url)
      .map((story) => ({
        title: story.title,
        url: story.url,
        publishedAt: new Date(story.time * 1000), // Unix timestamp to Date
        score: story.score || 0,
        commentCount: story.descendants || 0, // descendants = total comment count
      }));

    return items;
  } catch (error) {
    console.error('Failed to fetch Hacker News top stories:', error);
    throw new Error(`Hacker News API fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Reddit RSS源配置
export const redditInsightsSource: RSSSourceConfig = {
  name: 'Reddit Insights',
  type: 'REDDIT',
  rssUrl: 'https://www.reddit-insights.com/topic/marketing-opportunities/rss.xml',
  parseItem: (item: any): ParsedRSSItem | null => {
    try {
      const title = item.title?.trim();
      const url = item.link?.trim();
      const pubDate = item.pubDate || item.isoDate;

      if (!title || !url || !pubDate) {
        return null;
      }

      // Reddit RSS通常包含描述中的元数据
      // 这里做简化处理，实际可能需要解析描述获取分数和评论数
      const score = 10; // 默认分数
      const commentCount = 0; // 默认评论数

      return {
        title,
        url,
        publishedAt: new Date(pubDate),
        score,
        commentCount,
      };
    } catch (error) {
      console.error('Failed to parse Reddit Insights item:', error);
      return null;
    }
  },
};

// 统一获取风向标数据的函数
export async function fetchTrendData(
  sourceType: 'HACKER_NEWS' | 'REDDIT' | 'PRODUCT_HUNT' | 'GITHUB' | 'OTHER',
  limit: number = 50,
  rssUrl?: string
): Promise<ParsedRSSItem[]> {
  switch (sourceType) {
    case 'HACKER_NEWS':
      // 使用官方API获取更准确的数据
      return await fetchHackerNewsTop(limit);

    case 'REDDIT':
      // 使用RSS解析Reddit数据
      const redditConfig = {
        ...redditInsightsSource,
        ...(rssUrl && { rssUrl }),
      };
      return await fetchRSSFeed(redditConfig, limit);

    // 后续可以扩展其他数据源
    case 'PRODUCT_HUNT':
    case 'GITHUB':
    case 'OTHER':
      throw new Error(`Source type ${sourceType} is not yet implemented`);

    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }
}
