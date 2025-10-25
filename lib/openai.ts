import OpenAI from 'openai'

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured')
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// 从项目描述中提取搜索关键词
export async function extractKeywords(
  projectName: string,
  projectIdea: string,
  targetMarket?: string
): Promise<string[]> {
  const openai = getOpenAIClient()

  try {
    const prompt = `You are a market research expert. Extract 5-8 relevant search keywords from the following project description that would be useful for finding related discussions on Reddit. The keywords should help find:
- People discussing similar problems
- Potential users talking about their needs
- Market validation discussions
- Competitor mentions

Project Name: ${projectName}
Project Description: ${projectIdea}
${targetMarket ? `Target Market: ${targetMarket}` : ''}

Return ONLY a JSON array of keywords, no other text. Example: ["keyword1", "keyword2", "keyword3"]

Focus on:
1. Core problem/solution keywords
2. Target audience terms
3. Industry-specific terms
4. Pain points mentioned
5. Alternative product names if applicable

Keywords:`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts search keywords from project descriptions. Always respond with valid JSON arrays only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // 解析 JSON 响应
    try {
      const keywords = JSON.parse(content)
      if (Array.isArray(keywords)) {
        return keywords.slice(0, 8) // 最多返回8个关键词
      }
    } catch (e) {
      // 如果 JSON 解析失败，尝试从文本中提取
      const matches = content.match(/"([^"]+)"/g)
      if (matches) {
        return matches.map(m => m.replace(/"/g, '')).slice(0, 8)
      }
    }

    throw new Error('Failed to parse keywords from response')
  } catch (error: any) {
    console.error('Keyword extraction failed:', error)
    // 返回基础关键词作为备选
    const fallbackKeywords = [
      projectName,
      ...projectIdea.split(' ').slice(0, 4)
    ].filter(k => k.length > 3)

    return fallbackKeywords.slice(0, 5)
  }
}

// 分析 Reddit 数据并生成可行性总结
export async function analyzeRedditData(
  projectIdea: string,
  redditPosts: Array<{
    title: string
    content: string
    score: number
    num_comments: number
    subreddit: string
  }>
): Promise<{
  score: number
  summary: string
}> {
  const openai = getOpenAIClient()

  try {
    const postsContext = redditPosts.slice(0, 10).map((post, i) => `
Post ${i + 1} (r/${post.subreddit}, Score: ${post.score}, Comments: ${post.num_comments}):
Title: ${post.title}
Content: ${post.content.slice(0, 300)}...
`).join('\n')

    const prompt = `You are a startup advisor analyzing market validation data from Reddit.

Project Idea: ${projectIdea}

Reddit Posts Found:
${postsContext}

Based on these Reddit discussions, provide:
1. A feasibility score (0-100) where:
   - 80-100: Strong market validation, clear demand
   - 60-79: Moderate validation, some interest
   - 40-59: Limited validation, uncertain demand
   - 0-39: Weak validation, little interest

2. A brief summary (2-3 sentences) covering:
   - Key insights from the discussions
   - Market demand signals
   - Potential concerns or opportunities

Respond in JSON format:
{
  "score": <number>,
  "summary": "<string>"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a startup advisor providing market validation analysis. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content)

    return {
      score: Math.max(0, Math.min(100, result.score)),
      summary: result.summary
    }
  } catch (error: any) {
    console.error('Reddit data analysis failed:', error)
    return {
      score: 50,
      summary: '基于收集到的数据，项目具有一定的市场潜力，但需要更多验证。'
    }
  }
}
