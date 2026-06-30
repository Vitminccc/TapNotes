const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id } = event

  try {
    const txRes = await db.collection('transactions').doc(id).get()
    const tx = txRes.data

    const memberRes = await db.collection('family_members').where({
      familyId: tx.familyId,
      openid: OPENID
    }).get()
    if (memberRes.data.length === 0) {
      return { success: false, message: '无权限操作' }
    }

    await db.collection('transactions').doc(id).remove()

    if (tx.type === 'expense') {
      await db.collection('accounts').doc(tx.accountId).update({
        data: { balance: _.inc(tx.amount), updatedAt: new Date() }
      })
    } else if (tx.type === 'income') {
      await db.collection('accounts').doc(tx.accountId).update({
        data: { balance: _.inc(-tx.amount), updatedAt: new Date() }
      })
    } else if (tx.type === 'transfer') {
      await db.collection('accounts').doc(tx.accountId).update({
        data: { balance: _.inc(tx.amount), updatedAt: new Date() }
      })
      if (tx.toAccountId) {
        await db.collection('accounts').doc(tx.toAccountId).update({
          data: { balance: _.inc(-tx.amount), updatedAt: new Date() }
        })
      }
    }

    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}
