const { showToast, showModal, uuid } = require('../../utils/util.js')

Page({
  data: {
    family: null,
    members: [],
    inviteCode: ''
  },

  onLoad() {
    this.loadData()
  },

  loadData() {
    const app = getApp()
    const mockData = app.getMockData()
    this.setData({
      family: mockData.currentFamily,
      members: mockData.familyMembers || [],
      inviteCode: 'FAM' + Math.random().toString(36).substring(2, 8).toUpperCase()
    })
  },

  copyInviteCode() {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => {
        showToast('邀请码已复制', 'success')
      }
    })
  },

  removeMember(e) {
    const member = e.currentTarget.dataset.member
    if (member.role === 'owner') {
      showToast('不能移除创建者')
      return
    }
    showModal('确认移除', `确定要移除成员 ${member.nickname} 吗？`).then(confirm => {
      if (confirm) {
        const app = getApp()
        const mockData = app.getMockData()
        mockData.familyMembers = (mockData.familyMembers || []).filter(m => m._id !== member._id)
        app.saveMockData(mockData)
        this.loadData()
        showToast('已移除', 'success')
      }
    })
  },

  onFamilyNameTap() {
    wx.showModal({
      title: '修改家庭名称',
      editable: true,
      placeholderText: '请输入家庭名称',
      content: this.data.family ? this.data.family.name : '',
      success: (res) => {
        if (res.confirm && res.content) {
          const app = getApp()
          const mockData = app.getMockData()
          if (mockData.currentFamily) {
            mockData.currentFamily.name = res.content
          }
          app.saveMockData(mockData)
          this.loadData()
          showToast('已修改', 'success')
        }
      }
    })
  }
})
