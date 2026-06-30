const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { familyId, startDate, endDate, type = 'expense' } = event

  try {
    let where = {
      familyId,
      type
    }
    if (startDate || endDate) {
      let dateCond = {}
      if (startDate) dateCond = _.gte(startDate)
      if (endDate) dateCond = dateCond ? dateCond.and(_.lte(endDate)) : _.lte(endDate)
      where.date = dateCond
    }

    const categoryMap = {}
    const catRes = await db.collection('categories').where({
      familyId: _.in(['system', familyId]),
      type
    }).get()
    for (const cat of catRes.data) {
      categoryMap[cat._id] = cat
    }

    const statsMap = {}
    let total = 0

    const pageSize = 100
    let skip = 0
    let hasMore = true
    while (hasMore) {
      const txRes = await db.collection('transactions').where(where)
        .skip(skip).limit(pageSize).get()

      for (const tx of txRes.data) {
        total += tx.amount
        const catId = tx.categoryId
        if (!statsMap[catId]) {
          const cat = categoryMap[catId] || { name: '其他', color: '#999' }
          statsMap[catId] = {
            categoryId: catId,
            categoryName: tx.categoryName || cat.name || '其他',
            color: cat.color || '#999',
            amount: 0
          }
        }
        statsMap[catId].amount += tx.amount
      }

      if (txRes.data.length < pageSize) {
        hasMore = false
      } else {
        skip += pageSize
      }
    }

    const categoryStats = Object.values(statsMap).sort((a, b) => b.amount - a.amount)

    return {
      success: true,
      data: {
        total,
        categoryStats
      }
    }
  } catch (err) {
    return {
      success: false,
      message: err.message
    }
  }
}
