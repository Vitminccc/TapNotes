const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { budgetId, familyId } = event

  try {
    const budgetRes = await db.collection('budgets').doc(budgetId).get()
    const budget = budgetRes.data
    if (!budget) {
      return { success: false, message: '预算不存在' }
    }

    const itemsRes = await db.collection('budget_items').where({
      budgetId
    }).orderBy('sort', 'asc').get()
    const items = itemsRes.data

    const totalSpentRes = await db.collection('transactions').where({
      familyId: budget.familyId,
      type: 'expense',
      date: _.gte(budget.startDate || '1970-01-01').and(_.lte(budget.endDate || '2099-12-31'))
    }).count()

    let totalSpent = 0
    const itemMap = {}
    for (const item of items) {
      itemMap[item.categoryId] = { ...item, spent: 0 }
    }

    const pageSize = 100
    let skip = 0
    let hasMore = true
    while (hasMore) {
      const txRes = await db.collection('transactions').where({
        familyId: budget.familyId,
        type: 'expense',
        date: _.gte(budget.startDate || '1970-01-01').and(_.lte(budget.endDate || '2099-12-31'))
      }).skip(skip).limit(pageSize).get()

      for (const tx of txRes.data) {
        totalSpent += tx.amount
        if (itemMap[tx.categoryId]) {
          itemMap[tx.categoryId].spent += tx.amount
        }
      }

      if (txRes.data.length < pageSize) {
        hasMore = false
      } else {
        skip += pageSize
      }
    }

    const itemsWithSpent = items.map(item => ({
      ...item,
      spent: itemMap[item.categoryId] ? itemMap[item.categoryId].spent : 0
    }))

    const percent = budget.totalAmount > 0 
      ? Math.min(Math.round((totalSpent / budget.totalAmount) * 1000) / 10, 100)
      : 0

    return {
      success: true,
      data: {
        ...budget,
        items: itemsWithSpent,
        totalSpent,
        remaining: budget.totalAmount - totalSpent,
        percent
      }
    }
  } catch (err) {
    return {
      success: false,
      message: err.message
    }
  }
}
