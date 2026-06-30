const { callCloud } = require('../../utils/cloud.js')
const { formatMoney, getToday } = require('../../utils/format.js')
const { uuid } = require('../../utils/util.js')

Page({
  data: {
    type: 'expense',
    amount: '0',
    amountFen: 0,
    categories: [],
    selectedCategory: null,
    date: '',
    remark: '',
    accounts: [],
    selectedAccount: null,
    toAccount: null,
    numKeys: ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'del'],
    project: ''
  },

  onLoad(options) {
    const type = options.type || 'expense'
    const project = options.project || ''
    this.setData({ 
      type, 
      date: getToday(),
      project
    })
    this.loadCategories()
    this.loadAccounts()
  },

  loadCategories() {
    const app = getApp()
    const mockData = app.getMockData()
    const cats = (mockData.categories || []).filter(c => c.type === this.data.type)
    this.setData({
      categories: cats,
      selectedCategory: cats[0] || null
    })
  },

  loadAccounts() {
    const app = getApp()
    const mockData = app.getMockData()
    this.setData({
      accounts: mockData.accounts || [],
      selectedAccount: (mockData.accounts || [])[0] || null
    })
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ type, amount: '0', amountFen: 0 })
    this.loadCategories()
  },

  selectCategory(e) {
    const cat = e.currentTarget.dataset.cat
    this.setData({ selectedCategory: cat })
  },

  selectAccount(e) {
    const acc = e.currentTarget.dataset.acc
    this.setData({ selectedAccount: acc })
  },

  tapNum(e) {
    const key = e.currentTarget.dataset.key
    let amount = this.data.amount

    if (key === 'del') {
      if (amount.length > 1) {
        amount = amount.slice(0, -1)
      } else {
        amount = '0'
      }
    } else if (key === '.') {
      if (!amount.includes('.')) return
      amount += '.'
    } else {
      if (amount === '0') {
        amount = key
      } else {
        if (amount.includes('.')) {
          const parts = amount.split('.')
          if (parts[1].length >= 2) return
        }
        amount += key
      }
    }

    const amountFen = Math.round(parseFloat(amount || 0) * 100)
    this.setData({ amount, amountFen })
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  save() {
    const { type, amountFen, selectedCategory, date, remark, selectedAccount, project } = this.data

    if (amountFen <= 0) {
      wx.showToast({ title: '请输入金额', icon: 'none' })
      return
    }
    if (!selectedCategory) {
      wx.showToast({ title: '请选择分类', icon: 'none' })
      return
    }
    if (!selectedAccount) {
      wx.showToast({ title: '请选择账户', icon: 'none' })
      return
    }

    const tx = {
      type,
      amount: amountFen,
      categoryId: selectedCategory._id,
      categoryName: selectedCategory.name,
      accountId: selectedAccount._id,
      accountName: selectedAccount.name,
      date,
      remark,
      project,
      icon: selectedCategory.icon,
      color: selectedCategory.color
    }

    wx.showLoading({ title: '保存中...' })
    callCloud('addTransaction', tx).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: err.message || '保存失败', icon: 'none' })
    })
  }
})
