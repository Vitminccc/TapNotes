const { callCloud } = require('./cloud.js')

function login() {
  return callCloud('login').then(res => {
    if (res.success !== false && res.data) {
      const app = getApp()
      app.setUserInfo(res.data)
      return res.data
    }
    throw new Error(res.message || '登录失败')
  })
}

function checkAuth() {
  const app = getApp()
  return !!app.globalData.userInfo
}

function getUserInfo() {
  const app = getApp()
  return app.globalData.userInfo
}

function logout() {
  const app = getApp()
  app.logout()
}

module.exports = {
  login,
  checkAuth,
  getUserInfo,
  logout
}
