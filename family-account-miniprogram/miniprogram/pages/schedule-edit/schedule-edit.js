const { uuid, showToast } = require('../../utils/util.js')
const { getToday } = require('../../utils/format.js')

Page({
  data: {
    isEdit: false,
    id: '',
    title: '',
    type: 'todo',
    typeIndex: 0,
    typeList: ['待办', '账单', '纪念日', '事件'],
    typeValues: ['todo', 'bill', 'anniversary', 'event'],
    typeColors: ['#27AE60', '#E74C3C', '#E9B824', '#3498DB'],
    date: '',
    time: '09:00',
    amount: '',
    remark: '',
    repeatType: 'none',
    repeatIndex: 0,
    repeatList: ['不重复', '每天', '每周', '每月', '每年']
  },

  onLoad(options) {
    const today = getToday()
    this.setData({ date: today })

    if (options.id) {
      this.setData({ id: options.id, isEdit: true })
      this.loadSchedule(options.id)
      wx.setNavigationBarTitle({ title: '编辑日程' })
    } else {
      wx.setNavigationBarTitle({ title: '新增日程' })
    }
  },

  loadSchedule(id) {
    const app = getApp()
    const mockData = app.getMockData()
    const sch = (mockData.schedules || []).find(s => s._id === id)
    if (sch) {
      const typeIndex = this.data.typeValues.indexOf(sch.type)
      this.setData({
        title: sch.title,
        type: sch.type,
        typeIndex: typeIndex > -1 ? typeIndex : 0,
        date: sch.date,
        time: sch.time || '09:00',
        amount: sch.amount ? (sch.amount / 100).toString() : '',
        remark: sch.remark || ''
      })
    }
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value })
  },

  onTypeChange(e) {
    const idx = e.detail.value
    this.setData({
      typeIndex: idx,
      type: this.data.typeValues[idx]
    })
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  onTimeChange(e) {
    this.setData({ time: e.detail.value })
  },

  onAmountInput(e) {
    this.setData({ amount: e.detail.value })
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  onRepeatChange(e) {
    this.setData({
      repeatIndex: e.detail.value,
      repeatType: ['none', 'daily', 'weekly', 'monthly', 'yearly'][e.detail.value]
    })
  },

  save() {
    const { isEdit, id, title, type, date, time, amount, remark, typeColors, typeIndex } = this.data

    if (!title) {
      showToast('请输入标题')
      return
    }

    const amountFen = amount ? Math.round(parseFloat(amount) * 100) : 0

    const app = getApp()
    const mockData = app.getMockData()
    const schedules = mockData.schedules || []

    const color = typeColors[typeIndex]

    if (isEdit) {
      const idx = schedules.findIndex(s => s._id === id)
      if (idx > -1) {
        schedules[idx] = { ...schedules[idx], title, type, date, time, amount: amountFen, remark, color }
      }
    } else {
      schedules.push({
        _id: 'sch_' + uuid().slice(0, 8),
        title,
        type,
        date,
        time,
        amount: amountFen,
        remark,
        color,
        isCompleted: false
      })
    }

    mockData.schedules = schedules
    app.saveMockData(mockData)

    showToast('保存成功', 'success')
    setTimeout(() => {
      wx.navigateBack()
    }, 500)
  },

  deleteSchedule() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条日程吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          const mockData = app.getMockData()
          mockData.schedules = (mockData.schedules || []).filter(s => s._id !== this.data.id)
          app.saveMockData(mockData)
          showToast('已删除', 'success')
          setTimeout(() => {
            wx.navigateBack()
          }, 500)
        }
      }
    })
  }
})
