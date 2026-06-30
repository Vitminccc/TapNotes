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
    familyMembers: [],
    aiAdvice: null,
    aiLoading: false
  },

  onLoad() {
    this.loadAssetData()
    this.loadUserInfo()
    this.loadAIAdvice()
  },

  onShow() {
    this.loadAssetData()
  },

  loadAIAdvice() {
    this.setData({ aiLoading: true })
    callCloud('getAIAdvice', { type: 'full' }).then(res => {
      this.setData({
        aiAdvice: res.data.advice,
        aiLoading: false
      })
    }).catch(() => {
      this.setData({ aiLoading: false })
    })
  },

  onAIRefresh() {
    this.loadAIAdvice()
  },

  loadAssetData() {
    callCloud('getAssetOverview').then(res => {
      const data = res.data || {}
      const accounts = (data.accounts || []).sort((a, b) => a.sort - b.sort)
      const assets = (data.assets || []).filter(a => a.status === 'holding')
      const totalAssets = data.totalAssets || 0
      const totalProfit = data.totalProfit || 0

      this.setData({
        totalAssets,
        totalAssetsStr: '¥' + (totalAssets / 100).toFixed(2),
        totalProfitStr: (totalProfit >= 0 ? '+' : '') + '¥' + (Math.abs(totalProfit) / 100).toFixed(2),
        totalBalance: data.totalBalance || 0,
        totalInvestValue: data.totalInvestValue || 0,
        totalProfit,
        profitRate: data.profitRate || 0,
        accounts,
        assets
      })
    })
  },

  loadUserInfo() {
    callCloud('getFamilyOverview').then(res => {
      const data = res.data || {}
      this.setData({
        userInfo: data.userInfo,
        familyMembers: data.members || []
      })
    }).catch(() => {
      const app = getApp()
      this.setData({ userInfo: app.globalData.userInfo })
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
