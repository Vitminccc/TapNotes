const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id, name, type, balance, color, icon, isEdit } = event

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
    const balanceFen = Math.round(balance * 100)

    if (isEdit && id) {
      await db.collection('accounts').doc(id).update({
        data: { name, type, balance: balanceFen, color, icon, updatedAt: now }
      })
      return { success: true, data: { _id: id } }
    } else {
      const countRes = await db.collection('accounts').where({ familyId }).count()
      const addRes = await db.collection('accounts').add({
        data: {
          familyId,
          name,
          type,
          balance: balanceFen,
          color,
          icon,
          sort: countRes.total + 1,
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
