const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

async function checkFamilyPermission(openid, familyId) {
  const memberRes = await db.collection('family_members').where({
    familyId,
    openid
  }).get()
  return memberRes.data.length > 0
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { 
    type, amount, categoryId, accountId, toAccountId,
    date, time, remark, images, project, familyId
  } = event

  try {
    if (!familyId) {
      const userRes = await db.collection('users').where({ _openid: OPENID }).get()
      if (userRes.data.length === 0) {
        return { success: false, message: '用户不存在' }
      }
    }

    const hasPerm = await checkFamilyPermission(OPENID, familyId)
    if (!hasPerm) {
      return { success: false, message: '无权限操作此家庭' }
    }

    const accRes = await db.collection('accounts').doc(accountId).get()
    const account = accRes.data
    if (!account || account.familyId !== familyId) {
      return { success: false, message: '账户不存在' }
    }

    const now = new Date()
    const transaction = {
      familyId,
      type,
      amount: Math.abs(amount),
      categoryId: categoryId || '',
      accountId,
      toAccountId: toAccountId || '',
      date: date || now.toISOString().split('T')[0],
      time: time || '',
      remark: remark || '',
      images: images || [],
      project: project || '',
      isReimbursable: false,
      createdAt: now,
      updatedAt: now
    }

    const addRes = await db.collection('transactions').add({
      data: transaction
    })

    if (type === 'expense') {
      await db.collection('accounts').doc(accountId).update({
        data: { balance: _.inc(-Math.abs(amount)), updatedAt: now }
      })
    } else if (type === 'income') {
      await db.collection('accounts').doc(accountId).update({
        data: { balance: _.inc(Math.abs(amount)), updatedAt: now }
      })
    } else if (type === 'transfer') {
      await db.collection('accounts').doc(accountId).update({
        data: { balance: _.inc(-Math.abs(amount)), updatedAt: now }
      })
      if (toAccountId) {
        await db.collection('accounts').doc(toAccountId).update({
          data: { balance: _.inc(Math.abs(amount)), updatedAt: now }
        })
      }
    }

    return {
      success: true,
      data: { _id: addRes._id, ...transaction }
    }
  } catch (err) {
    return {
      success: false,
      message: err.message
    }
  }
}
