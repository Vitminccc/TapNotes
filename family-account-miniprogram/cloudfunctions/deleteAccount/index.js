const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id } = event

  try {
    const accRes = await db.collection('accounts').doc(id).get()
    const acc = accRes.data

    const memberRes = await db.collection('family_members').where({
      familyId: acc.familyId,
      openid: OPENID
    }).get()
    if (memberRes.data.length === 0) {
      return { success: false, message: '无权限操作' }
    }

    await db.collection('accounts').doc(id).remove()
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}
