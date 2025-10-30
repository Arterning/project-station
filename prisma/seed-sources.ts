import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTrendSources() {
  console.log('开始添加订阅源种子数据...');

  // 创建 Hacker News 订阅源
  const hackerNews = await prisma.trendSource.upsert({
    where: { id: 'hacker-news-default' },
    update: {},
    create: {
      id: 'hacker-news-default',
      name: 'Hacker News',
      type: 'HACKER_NEWS',
      rssUrl: 'https://news.ycombinator.com/rss',
      apiUrl: 'https://hacker-news.firebaseio.com/v0',
      icon: '🟠',
      description: '技术创业者社区，分享最新的科技新闻和讨论',
      isActive: true,
    },
  });

  console.log('✓ Hacker News 订阅源已创建');

  // 创建 Reddit Insights 订阅源
  const redditInsights = await prisma.trendSource.upsert({
    where: { id: 'reddit-insights-marketing' },
    update: {},
    create: {
      id: 'reddit-insights-marketing',
      name: 'Reddit Insights - Marketing',
      type: 'REDDIT',
      rssUrl: 'https://www.reddit-insights.com/topic/marketing-opportunities/rss.xml',
      icon: '🔵',
      description: 'Reddit 上的营销机会和热门讨论',
      isActive: true,
    },
  });

  console.log('✓ Reddit Insights 订阅源已创建');

  console.log('\n订阅源种子数据添加完成！');
  console.log(`- Hacker News ID: ${hackerNews.id}`);
  console.log(`- Reddit Insights ID: ${redditInsights.id}`);
}

seedTrendSources()
  .catch((e) => {
    console.error('添加订阅源种子数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
