const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { familyId, month } = event

  try {
    let where = { familyId }
    if (month) {
      where.date = _.gte(month + '-01').and(_.lte(month + '-31'))
    }

    const res = await db.collection('schedules').where(where)
      .orderBy('date', 'asc')
      .orderBy('time', 'asc')
      .limit(200)
      .get()

    return {
      success: true,
      data: res.data
    }
  } catch (err) {
    return {
      success: false,
      message: err.message
    }
  }
}
