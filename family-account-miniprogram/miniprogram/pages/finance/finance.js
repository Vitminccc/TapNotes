const { callCloud } = require('../../utils/cloud.js')
const { formatMoney } = require('../../utils/format.js')

Page({
  data: {
    totalAssets: 0,
    totalBalance: 0,
    totalInvestValue: 0,
    totalProfit: 0,
    profitRate: 0,
    accounts: [],
    assets: [],
    showAssetDetail: false,
    userInfo: null,
    familyMembers: []
  },

  onLoad() {
    this.loadAssetData()
    this.loadUserInfo()
  },

  onShow() {
    this.loadAssetData()
  },

  loadAssetData() {
    callCloud('getAssetOverview').then(res => {
      const data = res.data || {}
      const accounts = (data.accounts || []).sort((a, b) => a.sort - b.sort)
      const assets = (data.assets || []).filter(a => a.status === 'holding')
      
      this.setData({
        totalAssets: data.totalAssets || 0,
        totalBalance: data.totalBalance || 0,
        totalInvestValue: data.totalInvestValue || 0,
        totalProfit: data.totalProfit || 0,
        profitRate: data.profitRate || 0,
        accounts,
        assets
      })
    })
  },

  loadUserInfo() {
    const app = getApp()
    const mockData = app.getMockData()
    this.setData({
      userInfo: mockData.userInfo,
      familyMembers: mockData.familyMembers || []
    })
  },

  toggleAssetDetail() {
    this.setData({ showAssetDetail: !this.data.showAssetDetail })
  },

  goToAccountList() {
    wx.navigateTo({
      url: '/pages/account-list/account-list'
    })
  },

  goToFamily() {
    wx.navigateTo({
      url: '/pages/family/family'
    })
  },

  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
  },

  goToBudgetSetting() {
    wx.navigateTo({
      url: '/pages/budget-setting/budget-setting'
    })
  },

  exportData() {
    wx.showToast({
      title: '数据导出功能开发中',
      icon: 'none'
    })
  },

  onPullDownRefresh() {
    this.loadAssetData()
    wx.stopPullDownRefresh()
  }
})
