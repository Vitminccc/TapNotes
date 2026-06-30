const { callCloud } = require('../../utils/cloud.js')
const { showToast, showModal } = require('../../utils/util.js')

Page({
  data: {
    family: null,
    members: [],
    inviteCode: ''
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    callCloud('getFamilyOverview').then(res => {
      const data = res.data || {}
      this.setData({
        family: data.family,
        members: data.members || [],
        inviteCode: 'FAM' + Math.random().toString(36).substring(2, 8).toUpperCase()
      })
    }).catch(err => {
      showToast(err.message || '加载失败', 'none')
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
        callCloud('removeFamilyMember', { memberId: member._id }).then(() => {
          this.loadData()
          showToast('已移除', 'success')
        }).catch(err => {
          showToast(err.message || '操作失败', 'none')
        })
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
          callCloud('updateFamily', { name: res.content }).then(() => {
            this.loadData()
            showToast('已修改', 'success')
          }).catch(err => {
            showToast(err.message || '修改失败', 'none')
          })
        }
      }
    })
  }
})
