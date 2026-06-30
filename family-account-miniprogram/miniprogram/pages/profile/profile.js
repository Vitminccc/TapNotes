const { showToast, showModal } = require('../../utils/util.js')

Page({
  data: {
    userInfo: null,
    settings: [
      { icon: '🔔', name: '消息通知', desc: '账单提醒、预算预警' },
      { icon: '🎨', name: '主题设置', desc: '浅色/深色模式' },
      { icon: '🔒', name: '隐私设置', desc: '数据隐私与安全' },
      { icon: '💾', name: '数据备份', desc: '云端备份与恢复' },
      { icon: '📤', name: '数据导出', desc: '导出Excel/CSV' },
      { icon: 'ℹ️', name: '关于我们', desc: '版本信息、帮助反馈' }
    ]
  },

  onLoad() {
    const app = getApp()
    const mockData = app.getMockData()
    this.setData({ userInfo: mockData.userInfo })
  },

  onSettingTap(e) {
    const index = e.currentTarget.dataset.index
    showToast('功能开发中', 'none')
  },

  onEditProfile() {
    showToast('功能开发中', 'none')
  },

  onClearData() {
    showModal('确认清空', '确定要清空所有本地数据吗？此操作不可恢复。').then(confirm => {
      if (confirm) {
        const app = getApp()
        wx.clearStorageSync()
        app.initMockData()
        showToast('已重置', 'success')
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 1000)
      }
    })
  }
})
