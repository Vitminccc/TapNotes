function callCloud(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        if (res.result && res.result.success === false) {
          reject(new Error(res.result.message || '请求失败'))
        } else {
          resolve(res.result)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

module.exports = {
  callCloud
}
