const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id, title, type, date, time, amount, remark, color, isEdit } = event

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
    const amountFen = amount ? Math.round(amount * 100) : 0

    if (isEdit && id) {
      await db.collection('schedules').doc(id).update({
        data: { title, type, date, time, amount: amountFen, remark, color, updatedAt: now }
      })
      return { success: true, data: { _id: id } }
    } else {
      const addRes = await db.collection('schedules').add({
        data: {
          familyId,
          title,
          type,
          date,
          time,
          amount: amountFen,
          remark,
          color,
          isCompleted: false,
          createdAt: now,
          updatedAt: now
        }
      })
      return { success: true, data: { _id: addRes._id } }
    }
  } catch (err) {
    return { success: false, message: err.message }
  }
}
