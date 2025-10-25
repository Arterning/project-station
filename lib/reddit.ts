import Snoowrap from 'snoowrap'

// Reddit API 客户端
export function getRedditClient() {
  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
    throw new Error('Reddit API credentials are not configured')
  }

  return new Snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT || 'VenturePulse/1.0.0',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    // 使用应用模式（不需要用户登录）
    grantType: Snoowrap.grantType.CLIENT_CREDENTIALS,
  })
}

export interface RedditSearchResult {
  id: string
  title: string
  selftext: string
  author: string
  subreddit: string
  score: number
  num_comments: number
  url: string
  created_utc: number
  permalink: string
}

// 搜索 Reddit 帖子
export async function searchReddit(
  keywords: string[],
  options: {
    limit?: number
    sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments'
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  } = {}
): Promise<RedditSearchResult[]> {
  const reddit = getRedditClient()

  const {
    limit = 20,
    sort = 'relevance',
    time = 'month'
  } = options

  try {
    // 构建搜索查询
    const query = keywords.join(' ')

    // 搜索所有 subreddit
    const results = await reddit.search({
      query,
      sort,
      time,
      limit,
    })

    // 转换结果
    return results.map((post: any) => ({
      id: post.id,
      title: post.title,
      selftext: post.selftext || '',
      author: post.author.name,
      subreddit: post.subreddit.display_name,
      score: post.score,
      num_comments: post.num_comments,
      url: `https://reddit.com${post.permalink}`,
      created_utc: post.created_utc,
      permalink: post.permalink,
    }))
  } catch (error: any) {
    console.error('Reddit search failed:', error)
    throw new Error(`Reddit search failed: ${error.message}`)
  }
}

// 获取特定 subreddit 的相关帖子
export async function searchSubreddits(
  keywords: string[],
  subreddits: string[] = ['Entrepreneur', 'startups', 'SaaS', 'technology', 'business'],
  options: {
    limit?: number
    sort?: 'relevance' | 'hot' | 'top' | 'new'
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  } = {}
): Promise<RedditSearchResult[]> {
  const reddit = getRedditClient()

  const {
    limit = 10,
    sort = 'relevance',
    time = 'month'
  } = options

  try {
    const query = keywords.join(' ')
    const allResults: RedditSearchResult[] = []

    // 在每个 subreddit 中搜索
    for (const subreddit of subreddits) {
      try {
        const results = await reddit.getSubreddit(subreddit).search({
          query,
          sort,
          time,
          limit,
        })

        const posts = results.map((post: any) => ({
          id: post.id,
          title: post.title,
          selftext: post.selftext || '',
          author: post.author.name,
          subreddit: post.subreddit.display_name,
          score: post.score,
          num_comments: post.num_comments,
          url: `https://reddit.com${post.permalink}`,
          created_utc: post.created_utc,
          permalink: post.permalink,
        }))

        allResults.push(...posts)
      } catch (err) {
        console.error(`Failed to search r/${subreddit}:`, err)
      }
    }

    // 按评分排序并去重
    const uniquePosts = Array.from(
      new Map(allResults.map(post => [post.id, post])).values()
    )

    return uniquePosts.sort((a, b) => b.score - a.score).slice(0, limit * 2)
  } catch (error: any) {
    console.error('Subreddit search failed:', error)
    throw new Error(`Subreddit search failed: ${error.message}`)
  }
}
