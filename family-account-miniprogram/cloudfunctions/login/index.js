const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  try {
    const userRes = await db.collection('users').where({
      _openid: OPENID
    }).get()

    let user
    if (userRes.data.length > 0) {
      user = userRes.data[0]
    } else {
      const newUser = {
        _openid: OPENID,
        nickname: '微信用户',
        avatarUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const addRes = await db.collection('users').add({
        data: newUser
      })
      user = { _id: addRes._id, ...newUser }

      const defaultFamily = {
        name: '我的家庭',
        type: 'daily',
        ownerOpenid: OPENID,
        currency: 'CNY',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const familyRes = await db.collection('families').add({
        data: defaultFamily
      })

      await db.collection('family_members').add({
        data: {
          familyId: familyRes._id,
          openid: OPENID,
          nickname: '微信用户',
          avatarUrl: '',
          role: 'owner',
          color: '#0F3460',
          joinedAt: new Date()
        }
      })

      const defaultAccounts = [
        { name: '现金', type: 'cash', balance: 0, icon: '💵', color: '#27AE60', sort: 1 },
        { name: '微信钱包', type: 'wechat', balance: 0, icon: '💬', color: '#07C160', sort: 2 },
        { name: '支付宝', type: 'alipay', balance: 0, icon: '📱', color: '#1677FF', sort: 3 },
        { name: '储蓄卡', type: 'debit', balance: 0, icon: '💳', color: '#0F3460', sort: 4 }
      ]
      for (const acc of defaultAccounts) {
        await db.collection('accounts').add({
          data: {
            familyId: familyRes._id,
            ...acc,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      }

      const expenseCategories = [
        { name: '餐饮', type: 'expense', icon: '🍜', color: '#E74C3C', bgColor: '#FDEDEC', sort: 1 },
        { name: '交通', type: 'expense', icon: '🚗', color: '#3498DB', bgColor: '#EBF5FB', sort: 2 },
        { name: '购物', type: 'expense', icon: '🛒', color: '#9B59B6', bgColor: '#F5EEF8', sort: 3 },
        { name: '娱乐', type: 'expense', icon: '🎮', color: '#F39C12', bgColor: '#FEF5E7', sort: 4 },
        { name: '医疗', type: 'expense', icon: '💊', color: '#27AE60', bgColor: '#EAFAF1', sort: 5 },
        { name: '教育', type: 'expense', icon: '📚', color: '#3498DB', bgColor: '#EBF5FB', sort: 6 },
        { name: '住房', type: 'expense', icon: '🏠', color: '#9B59B6', bgColor: '#F5EEF8', sort: 7 },
        { name: '通讯', type: 'expense', icon: '📞', color: '#1ABC9C', bgColor: '#E8F8F5', sort: 8 },
        { name: '其他', type: 'expense', icon: '📦', color: '#95A5A6', bgColor: '#F4F6F6', sort: 9 }
      ]
      for (const cat of expenseCategories) {
        await db.collection('categories').add({
          data: {
            familyId: 'system',
            ...cat,
            isSystem: true,
            createdAt: new Date()
          }
        })
      }

      const incomeCategories = [
        { name: '工资', type: 'income', icon: '💰', color: '#27AE60', bgColor: '#EAFAF1', sort: 1 },
        { name: '奖金', type: 'income', icon: '🎁', color: '#F39C12', bgColor: '#FEF5E7', sort: 2 },
        { name: '理财', type: 'income', icon: '📈', color: '#27AE60', bgColor: '#EAFAF1', sort: 3 },
        { name: '红包', type: 'income', icon: '🧧', color: '#E74C3C', bgColor: '#FDEDEC', sort: 4 },
        { name: '其他', type: 'income', icon: '💵', color: '#95A5A6', bgColor: '#F4F6F6', sort: 5 }
      ]
      for (const cat of incomeCategories) {
        await db.collection('categories').add({
          data: {
            familyId: 'system',
            ...cat,
            isSystem: true,
            createdAt: new Date()
          }
        })
      }

      user.currentFamilyId = familyRes._id
      await db.collection('users').doc(addRes._id).update({
        data: { currentFamilyId: familyRes._id, updatedAt: new Date() }
      })
    }

    return {
      success: true,
      data: user
    }
  } catch (err) {
    return {
      success: false,
      message: err.message
    }
  }
}
