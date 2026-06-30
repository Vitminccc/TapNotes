const { getMonthDays, getFirstDayOfMonth, formatDate, isSameDay } = require('../../utils/format.js')

Component({
  properties: {
    year: {
      type: Number,
      value: new Date().getFullYear()
    },
    month: {
      type: Number,
      value: new Date().getMonth() + 1
    },
    selectedDate: {
      type: String,
      value: ''
    },
    markDates: {
      type: Array,
      value: []
    }
  },
  data: {
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    days: [],
    today: ''
  },
  lifetimes: {
    attached() {
      this.initCalendar()
    }
  },
  observers: {
    'year, month, markDates, selectedDate': function() {
      this.initCalendar()
    }
  },
  methods: {
    initCalendar() {
      const { year, month, markDates, selectedDate } = this.data
      const totalDays = getMonthDays(year, month)
      const firstDay = getFirstDayOfMonth(year, month)
      const today = formatDate(new Date(), 'YYYY-MM-DD')

      const days = []
      for (let i = 0; i < firstDay; i++) {
        days.push({ day: '', empty: true })
      }
      for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        const hasMark = markDates.some(m => isSameDay(m, dateStr))
        const isSelected = isSameDay(selectedDate, dateStr)
        const isToday = isSameDay(today, dateStr)
        days.push({
          day: d,
          date: dateStr,
          empty: false,
          hasMark,
          isSelected,
          isToday
        })
      }

      this.setData({ days, today })
    },
    selectDay(e) {
      const item = e.currentTarget.dataset.item
      if (item.empty) return
      this.triggerEvent('select', { date: item.date })
    },
    prevMonth() {
      let { year, month } = this.data
      month--
      if (month < 1) {
        month = 12
        year--
      }
      this.triggerEvent('monthchange', { year, month })
    },
    nextMonth() {
      let { year, month } = this.data
      month++
      if (month > 12) {
        month = 1
        year++
      }
      this.triggerEvent('monthchange', { year, month })
    }
  }
})
