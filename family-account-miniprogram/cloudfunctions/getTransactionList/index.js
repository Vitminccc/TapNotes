const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { familyId, type, categoryId, startDate, endDate, page = 1, pageSize = 50 } = event

  try {
    let targetFamilyId = familyId
    if (!targetFamilyId) {
      const userRes = await db.collection('users').where({ _openid: OPENID }).get()
      if (userRes.data.length === 0) {
        return { success: false, message: '用户不存在' }
      }
      targetFamilyId = userRes.data[0].currentFamilyId
    }

    let where = { familyId: targetFamilyId }
    if (type && type !== 'all') where.type = type
    if (categoryId) where.categoryId = categoryId
    if (startDate) where.date = _.gte(startDate)
    if (endDate) where.date = where.date ? _.and(_.lte(endDate)) : _.lte(endDate)

    const skip = (page - 1) * pageSize
    const res = await db.collection('transactions')
      .where(where)
      .orderBy('date', 'desc')
      .orderBy('time', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const countRes = await db.collection('transactions').where(where).count()

    return {
      success: true,
      data: {
        list: res.data,
        total: countRes.total,
        page,
        pageSize
      }
    }
  } catch (err) {
    return { success: false, message: err.message }
  }
}
