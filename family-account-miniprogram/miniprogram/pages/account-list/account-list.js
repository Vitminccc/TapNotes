const { callCloud } = require('../../utils/cloud.js')
const { formatMoney } = require('../../utils/format.js')

Page({
  data: {
    accounts: [],
    totalBalance: 0
  },

  onLoad() {
    this.loadAccounts()
  },

  onShow() {
    this.loadAccounts()
  },

  loadAccounts() {
    callCloud('getAccounts').then(res => {
      const accounts = (res.data || []).sort((a, b) => a.sort - b.sort)
      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
      this.setData({ accounts, totalBalance })
    })
  },

  goToAdd() {
    wx.navigateTo({
      url: '/pages/account-edit/account-edit'
    })
  },

  goToEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/account-edit/account-edit?id=' + id
    })
  }
})
