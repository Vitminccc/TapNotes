const { callCloud } = require('../../utils/cloud.js')
const { formatDate, formatMoney, getToday } = require('../../utils/format.js')

Page({
  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    selectedDate: '',
    schedules: [],
    markDates: [],
    todaySchedules: [],
    typeMap: {
      todo: { label: '待办', color: '#27AE60' },
      bill: { label: '账单', color: '#E74C3C' },
      anniversary: { label: '纪念日', color: '#E9B824' },
      event: { label: '事件', color: '#3498DB' }
    }
  },

  onLoad() {
    const today = getToday()
    this.setData({ selectedDate: today })
    this.loadSchedules()
  },

  onShow() {
    this.loadSchedules()
  },

  loadSchedules() {
    const { year, month } = this.data
    const monthStr = `${year}-${String(month).padStart(2, '0')}`

    callCloud('getScheduleList', { month: monthStr }).then(res => {
      const list = res.data || []
      const markDates = [...new Set(list.map(s => s.date))]
      const todaySchedules = list.filter(s => s.date === this.data.selectedDate)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''))

      this.setData({
        schedules: list,
        markDates,
        todaySchedules
      })
    })
  },

  onSelectDate(e) {
    const date = e.detail.date
    const todaySchedules = this.data.schedules
      .filter(s => s.date === date)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    this.setData({
      selectedDate: date,
      todaySchedules
    })
  },

  onMonthChange(e) {
    this.setData({
      year: e.detail.year,
      month: e.detail.month
    })
    this.loadSchedules()
  },

  goToAdd() {
    wx.navigateTo({
      url: '/pages/schedule-edit/schedule-edit'
    })
  },

  toggleComplete(e) {
    const item = e.currentTarget.dataset.item
    const newStatus = !item.isCompleted

    callCloud('updateSchedule', {
      id: item._id,
      isCompleted: newStatus
    }).then(() => {
      this.loadSchedules()
      wx.showToast({
        title: newStatus ? '已完成' : '已取消完成',
        icon: 'success'
      })
    }).catch(err => {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' })
    })
  },

  onScheduleTap(e) {
    const item = e.currentTarget.dataset.item
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      itemColor: '#0F3460',
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.navigateTo({
            url: '/pages/schedule-edit/schedule-edit?id=' + item._id
          })
        } else if (res.tapIndex === 1) {
          this.deleteSchedule(item._id)
        }
      }
    })
  },

  deleteSchedule(id) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条日程吗？',
      success: (res) => {
        if (res.confirm) {
          callCloud('deleteSchedule', { id }).then(() => {
            this.loadSchedules()
            wx.showToast({ title: '已删除', icon: 'success' })
          }).catch(err => {
            wx.showToast({ title: err.message || '删除失败', icon: 'none' })
          })
        }
      }
    })
  },

  onPullDownRefresh() {
    this.loadSchedules()
    wx.stopPullDownRefresh()
  }
})
