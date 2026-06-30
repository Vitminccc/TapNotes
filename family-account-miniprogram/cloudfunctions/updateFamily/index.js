const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { name, memberNickname } = event

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
    if (name) {
      await db.collection('families').doc(familyId).update({
        data: { name, updatedAt: now }
      })
    }

    if (memberNickname) {
      await db.collection('family_members').doc(memberRes.data[0]._id).update({
        data: { nickname: memberNickname, updatedAt: now }
      })
      await db.collection('users').doc(userRes.data[0]._id).update({
        data: { nickname: memberNickname, updatedAt: now }
      })
    }

    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}
