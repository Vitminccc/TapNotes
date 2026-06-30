function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function debounce(fn, delay = 300) {
  let timer = null
  return function() {
    const args = arguments
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

function throttle(fn, delay = 300) {
  let last = 0
  return function() {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn.apply(this, arguments)
    }
  }
}

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  const result = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = deepClone(obj[key])
    }
  }
  return result
}

function showToast(title, icon = 'none') {
  wx.showToast({
    title,
    icon,
    duration: 2000
  })
}

function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  })
}

function hideLoading() {
  wx.hideLoading()
}

function showModal(title, content, options = {}) {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      confirmColor: options.confirmColor || '#0F3460',
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

function groupBy(list, key) {
  const map = {}
  list.forEach(item => {
    const k = typeof key === 'function' ? key(item) : item[key]
    if (!map[k]) map[k] = []
    map[k].push(item)
  })
  return map
}

module.exports = {
  uuid,
  debounce,
  throttle,
  deepClone,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  groupBy
}
