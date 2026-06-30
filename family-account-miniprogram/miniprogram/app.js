App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'family-account-xxx',
        traceUser: true
      })
    }

    this.globalData = {
      userInfo: null,
      currentFamilyId: '',
      currentFamily: null,
      categories: [],
      accounts: [],
      useMock: false
    }

    this.checkLogin()
  },

  checkLogin() {
    const stored = wx.getStorageSync('userInfo')
    if (stored) {
      this.globalData.userInfo = stored
      this.globalData.currentFamilyId = stored.currentFamilyId || ''
    }
  },

  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    this.globalData.currentFamilyId = userInfo.currentFamilyId || ''
    wx.setStorageSync('userInfo', userInfo)
  },

  logout() {
    this.globalData.userInfo = null
    this.globalData.currentFamilyId = ''
    wx.removeStorageSync('userInfo')
  }
})
