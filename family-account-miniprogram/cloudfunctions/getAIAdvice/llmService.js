/**
 * LLM 服务适配器
 * 支持 DeepSeek、通义千问、智谱AI 三种服务商
 * 通过环境变量 LLM_PROVIDER 选择服务商（deepseek / qwen / zhipu）
 * API Key 通过环境变量 LLM_API_KEY 配置
 */
const axios = require('axios')

const PROVIDERS = {
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    headerBuilder: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  },
  qwen: {
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-plus',
    headerBuilder: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  },
  zhipu: {
    url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-flash',
    headerBuilder: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  }
}

/**
 * 调用 LLM 获取财务建议
 * @param {string} systemPrompt - 系统提示词
 * @param {string} userPrompt - 用户数据提示词
 * @returns {Promise<string>} LLM 返回的文本内容
 */
async function callLLM(systemPrompt, userPrompt) {
  const provider = process.env.LLM_PROVIDER || 'deepseek'
  const apiKey = process.env.LLM_API_KEY || ''

  if (!apiKey) {
    throw new Error('未配置 LLM_API_KEY 环境变量')
  }

  const config = PROVIDERS[provider]
  if (!config) {
    throw new Error(`不支持的服务商: ${provider}，可选: deepseek / qwen / zhipu`)
  }

  const response = await axios.post(config.url, {
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2000
  }, {
    headers: config.headerBuilder(apiKey),
    timeout: 30000
  })

  const content = response.data.choices[0].message.content
  return content
}

module.exports = { callLLM }
