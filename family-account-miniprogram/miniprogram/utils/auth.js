const { callCloud } = require('./cloud.js')

function login() {
  return callCloud('login')
}

function checkAuth() {
  const app = getApp()
  return !!app.globalData.userInfo
}

function getUserInfo() {
  const app = getApp()
  return app.globalData.userInfo
}

module.exports = {
  login,
  checkAuth,
  getUserInfo
}
