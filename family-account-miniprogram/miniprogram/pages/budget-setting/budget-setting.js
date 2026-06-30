const { callCloud } = require('../../utils/cloud.js')
const { formatMoney } = require('../../utils/format.js')

Page({
  data: {
    isEdit: false,
    budgetName: '装修总预算',
    totalAmount: '',
    totalAmountFen: 0,
    budgetType: 'project',
    items: [],
    categories: []
  },

  onLoad() {
    this.loadCategories()
    this.loadBudget()
  },

  loadCategories() {
    const app = getApp()
    const mockData = app.getMockData()
    this.setData({
      categories: (mockData.categories || []).filter(c => c.type === 'expense')
    })
  },

  loadBudget() {
    callCloud('getBudgetDetail').then(res => {
      if (res.data) {
        const budget = res.data
        this.setData({
          isEdit: true,
          budgetName: budget.name || '',
          totalAmount: (budget.totalAmount / 100).toString(),
          totalAmountFen: budget.totalAmount,
          budgetType: budget.type || 'project',
          items: (budget.items || []).sort((a, b) => a.sort - b.sort)
        })
      } else {
        this.initDefaultItems()
      }
    })
  },

  initDefaultItems() {
    const defaultItems = [
      { categoryName: '设计与施工', amount: '180000', amountFen: 18000000, iconText: '施', color: '#0F3460', bgColor: '#E8EDF5', sort: 1 },
      { categoryName: '主材', amount: '70000', amountFen: 7000000, iconText: '材', color: '#D4895A', bgColor: '#FBE8D9', sort: 2 },
      { categoryName: '家具软装', amount: '30000', amountFen: 3000000, iconText: '家', color: '#9B7AB0', bgColor: '#EFE4F1', sort: 3 },
      { categoryName: '家电', amount: '65000', amountFen: 6500000, iconText: '电', color: '#5E8BA0', bgColor: '#DDE8ED', sort: 4 },
      { categoryName: '其他', amount: '5000', amountFen: 500000, iconText: '其', color: '#7F7F7F', bgColor: '#E0E0E0', sort: 5 }
    ]
    this.setData({ 
      items: defaultItems,
      budgetName: '装修总预算'
    })
    this.calcTotal()
  },

  onNameInput(e) {
    this.setData({ budgetName: e.detail.value })
  },

  onTotalInput(e) {
    const val = e.detail.value
    const fen = Math.round(parseFloat(val || 0) * 100)
    this.setData({ 
      totalAmount: val,
      totalAmountFen: fen
    })
  },

  onItemAmountInput(e) {
    const index = e.currentTarget.dataset.index
    const val = e.detail.value
    const fen = Math.round(parseFloat(val || 0) * 100)
    const items = [...this.data.items]
    items[index].amount = val
    items[index].amountFen = fen
    this.setData({ items })
    this.calcTotal()
  },

  calcTotal() {
    const total = this.data.items.reduce((sum, item) => sum + (item.amountFen || 0), 0)
    this.setData({
      totalAmountFen: total,
      totalAmount: (total / 100).toString()
    })
  },

  addItem() {
    const items = [...this.data.items]
    items.push({
      categoryName: '新分类',
      amount: '0',
      amountFen: 0,
      iconText: '新',
      color: '#999999',
      bgColor: '#F0F0F0',
      sort: items.length + 1
    })
    this.setData({ items })
  },

  removeItem(e) {
    const index = e.currentTarget.dataset.index
    const items = [...this.data.items]
    items.splice(index, 1)
    this.setData({ items })
    this.calcTotal()
  },

  save() {
    const { budgetName, totalAmountFen, budgetType, items } = this.data

    if (!budgetName) {
      wx.showToast({ title: '请输入预算名称', icon: 'none' })
      return
    }
    if (totalAmountFen <= 0) {
      wx.showToast({ title: '请设置预算金额', icon: 'none' })
      return
    }

    const budgetItems = items.map((item, idx) => ({
      categoryId: 'cat_' + idx,
      categoryName: item.categoryName,
      amount: item.amountFen,
      iconText: item.iconText,
      color: item.color,
      bgColor: item.bgColor,
      sort: idx + 1
    }))

    wx.showLoading({ title: '保存中...' })
    callCloud('setBudget', {
      budget: {
        name: budgetName,
        type: budgetType,
        totalAmount: totalAmountFen
      },
      items: budgetItems
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: err.message || '保存失败', icon: 'none' })
    })
  }
})
