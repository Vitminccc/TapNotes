const { uuid, showToast } = require('../../utils/util.js')

Page({
  data: {
    isEdit: false,
    id: '',
    name: '',
    type: 'debit',
    typeIndex: 0,
    typeList: ['现金', '储蓄卡', '信用卡', '支付宝', '微信钱包', '投资账户', '其他'],
    typeValues: ['cash', 'debit', 'credit', 'alipay', 'wechat', 'invest', 'other'],
    balance: '',
    color: '#0F3460',
    icon: '💳',
    iconList: ['💳', '💵', '📱', '💬', '🏦', '📊', '💰', '💎'],
    colorList: ['#0F3460', '#E74C3C', '#27AE60', '#3498DB', '#9B59B6', '#F39C12', '#1ABC9C', '#E9B824']
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id, isEdit: true })
      this.loadAccount(options.id)
      wx.setNavigationBarTitle({ title: '编辑账户' })
    } else {
      wx.setNavigationBarTitle({ title: '新增账户' })
    }
  },

  loadAccount(id) {
    const app = getApp()
    const mockData = app.getMockData()
    const acc = (mockData.accounts || []).find(a => a._id === id)
    if (acc) {
      const typeIndex = this.data.typeValues.indexOf(acc.type)
      this.setData({
        name: acc.name,
        type: acc.type,
        typeIndex: typeIndex > -1 ? typeIndex : 0,
        balance: (acc.balance / 100).toString(),
        color: acc.color,
        icon: acc.icon
      })
    }
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onBalanceInput(e) {
    this.setData({ balance: e.detail.value })
  },

  onTypeChange(e) {
    const idx = e.detail.value
    this.setData({
      typeIndex: idx,
      type: this.data.typeValues[idx]
    })
  },

  selectIcon(e) {
    const icon = e.currentTarget.dataset.icon
    this.setData({ icon })
  },

  selectColor(e) {
    const color = e.currentTarget.dataset.color
    this.setData({ color })
  },

  save() {
    const { isEdit, id, name, type, balance, color, icon } = this.data

    if (!name) {
      showToast('请输入账户名称')
      return
    }

    const balanceFen = Math.round(parseFloat(balance || 0) * 100)

    const app = getApp()
    const mockData = app.getMockData()
    const accounts = mockData.accounts || []

    if (isEdit) {
      const idx = accounts.findIndex(a => a._id === id)
      if (idx > -1) {
        accounts[idx] = { ...accounts[idx], name, type, balance: balanceFen, color, icon }
      }
    } else {
      accounts.push({
        _id: 'acc_' + uuid().slice(0, 8),
        name,
        type,
        balance: balanceFen,
        color,
        icon,
        sort: accounts.length + 1
      })
    }

    mockData.accounts = accounts
    app.saveMockData(mockData)

    showToast('保存成功', 'success')
    setTimeout(() => {
      wx.navigateBack()
    }, 500)
  },

  deleteAccount() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个账户吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          const mockData = app.getMockData()
          mockData.accounts = (mockData.accounts || []).filter(a => a._id !== this.data.id)
          app.saveMockData(mockData)
          showToast('已删除', 'success')
          setTimeout(() => {
            wx.navigateBack()
          }, 500)
        }
      }
    })
  }
})
