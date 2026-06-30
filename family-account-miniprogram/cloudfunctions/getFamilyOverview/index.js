const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  try {
    const userRes = await db.collection('users').where({ _openid: OPENID }).get()
    if (userRes.data.length === 0) {
      return { success: false, message: '用户不存在' }
    }
    const familyId = userRes.data[0].currentFamilyId

    const familyRes = await db.collection('families').doc(familyId).get()
    const family = familyRes.data

    const memberRes = await db.collection('family_members').where({ familyId }).get()
    const members = memberRes.data

    return {
      success: true,
      data: {
        family,
        members,
        userInfo: userRes.data[0]
      }
    }
  } catch (err) {
    return { success: false, message: err.message }
  }
}
