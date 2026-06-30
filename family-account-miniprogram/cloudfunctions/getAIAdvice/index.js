const cloud = require('wx-server-sdk')
const { callLLM } = require('./llmService.js')
const { gatherFinancialData, buildUserPrompt, SYSTEM_PROMPT } = require('./dataCollector.js')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * AI财务顾问云函数
 * 采集家庭财务数据，调用大模型生成分析建议
 */
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { familyId, type = 'full' } = event

  try {
    let targetFamilyId = familyId

    if (!targetFamilyId) {
      const userRes = await db.collection('users').where({ _openid: OPENID }).get()
      if (userRes.data.length === 0) {
        return { success: false, message: '用户不存在' }
      }
      targetFamilyId = userRes.data[0].currentFamilyId
    }

    if (!targetFamilyId) {
      return { success: false, message: '未找到当前家庭' }
    }

    const memberRes = await db.collection('family_members').where({
      familyId: targetFamilyId,
      openid: OPENID
    }).get()

    if (memberRes.data.length === 0) {
      return { success: false, message: '无权限查看此家庭数据' }
    }

    const financialData = await gatherFinancialData(targetFamilyId)
    const userPrompt = buildUserPrompt(financialData)

    const llmResponse = await callLLM(SYSTEM_PROMPT, userPrompt)

    let advice
    try {
      const jsonStr = llmResponse.replace(/```json\n?/g, '').replace(/```/g, '').trim()
      advice = JSON.parse(jsonStr)
    } catch (parseErr) {
      advice = {
        consumption: { summary: '消费分析', suggestions: [llmResponse.substring(0, 200)] },
        budget: { summary: '', suggestions: [] },
        investment: { summary: '', suggestions: [] },
        bills: { summary: '', suggestions: [] }
      }
    }

    await db.collection('ai_advice_logs').add({
      data: {
        familyId: targetFamilyId,
        openid: OPENID,
        adviceType: type,
        financialSnapshot: {
          monthExpense: financialData.summary.monthExpense,
          monthIncome: financialData.summary.monthIncome,
          balance: financialData.summary.balance
        },
        advice,
        createdAt: new Date()
      }
    })

    return {
      success: true,
      data: {
        advice,
        financialData: {
          period: financialData.period,
          summary: financialData.summary
        }
      }
    }
  } catch (err) {
    return {
      success: false,
      message: err.message
    }
  }
}
