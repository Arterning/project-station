/**
 * 风向标功能测试脚本
 *
 * 运行方式：pnpm tsx scripts/test-trends.ts
 *
 * 测试内容：
 * 1. 测试 Hacker News API 数据获取
 * 2. 测试热度计算
 * 3. 显示 Top 10 热门帖子
 */

import { fetchHackerNewsTop, calculateHotScore } from '../lib/rss';

async function testTrends() {
  console.log('🚀 开始测试风向标功能...\n');

  try {
    console.log('📡 正在从 Hacker News API 获取 Top 10 热门帖子...');
    const trends = await fetchHackerNewsTop(10);

    console.log(`✅ 成功获取 ${trends.length} 条数据\n`);

    console.log('🔥 Top 10 热门帖子：\n');
    console.log('─'.repeat(100));

    trends.forEach((trend, index) => {
      const hotScore = calculateHotScore(trend.score, trend.commentCount);

      console.log(`\n#${index + 1}`);
      console.log(`📰 标题: ${trend.title}`);
      console.log(`🔗 链接: ${trend.url}`);
      console.log(`⭐ 评分: ${trend.score}`);
      console.log(`💬 评论: ${trend.commentCount}`);
      console.log(`🔥 热度: ${hotScore.toFixed(1)}`);
      console.log(`📅 发布: ${trend.publishedAt.toLocaleString('zh-CN')}`);
    });

    console.log('\n' + '─'.repeat(100));
    console.log('\n✅ 测试完成！');

    // 统计信息
    const totalScore = trends.reduce((sum, t) => sum + t.score, 0);
    const totalComments = trends.reduce((sum, t) => sum + t.commentCount, 0);
    const avgScore = totalScore / trends.length;
    const avgComments = totalComments / trends.length;

    console.log('\n📊 统计信息：');
    console.log(`- 平均评分: ${avgScore.toFixed(1)}`);
    console.log(`- 平均评论数: ${avgComments.toFixed(1)}`);
    console.log(`- 最高评分: ${Math.max(...trends.map(t => t.score))}`);
    console.log(`- 最多评论: ${Math.max(...trends.map(t => t.commentCount))}`);

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testTrends();
