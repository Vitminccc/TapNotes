const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { budget, items } = event

  try {
    const userRes = await db.collection('users').where({ _openid: OPENID }).get()
    if (userRes.data.length === 0) {
      return { success: false, message: '用户不存在' }
    }
    const familyId = userRes.data[0].currentFamilyId

    const memberRes = await db.collection('family_members').where({
      familyId, openid: OPENID
    }).get()
    if (memberRes.data.length === 0) {
      return { success: false, message: '无权限操作' }
    }

    const now = new Date()
    const year = now.getFullYear()

    const existingRes = await db.collection('budgets').where({ familyId }).get()

    let budgetId
    if (existingRes.data.length > 0) {
      budgetId = existingRes.data[0]._id
      await db.collection('budgets').doc(budgetId).update({
        data: {
          name: budget.name,
          type: budget.type,
          totalAmount: budget.totalAmount,
          startDate: budget.startDate || `${year}-01-01`,
          endDate: budget.endDate || `${year}-12-31`,
          updatedAt: now
        }
      })
      await db.collection('budget_items').where({ budgetId }).remove()
    } else {
      const addRes = await db.collection('budgets').add({
        data: {
          familyId,
          name: budget.name,
          type: budget.type,
          totalAmount: budget.totalAmount,
          startDate: budget.startDate || `${year}-01-01`,
          endDate: budget.endDate || `${year}-12-31`,
          createdAt: now,
          updatedAt: now
        }
      })
      budgetId = addRes._id
    }

    for (const item of items) {
      await db.collection('budget_items').add({
        data: {
          budgetId,
          familyId,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          amount: item.amount,
          iconText: item.iconText || '',
          color: item.color || '#999',
          bgColor: item.bgColor || '#F0F0F0',
          sort: item.sort,
          createdAt: now
        }
      })
    }

    return { success: true, data: { budgetId } }
  } catch (err) {
    return { success: false, message: err.message }
  }
}
