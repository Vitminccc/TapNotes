const { formatMoney, formatDate } = require('../../utils/format.js')

Component({
  properties: {
    transaction: {
      type: Object,
      value: null
    },
    showDate: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  observers: {
    'transaction': function(tx) {
      if (!tx) return
      const amountStr = formatMoney(tx.amount)
      const dateStr = formatDate(tx.date, 'MM-DD')
      const isExpense = tx.type === 'expense'
      const prefix = isExpense ? '-' : (tx.type === 'income' ? '+' : '')
      const category = tx.categoryName || '其他'
      const icon = tx.icon || tx.categoryIcon || '📝'
      const color = tx.color || (isExpense ? '#E74C3C' : '#27AE60')
      this.setData({
        amountStr: prefix + amountStr,
        dateStr,
        isExpense,
        category,
        icon,
        color
      })
    }
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { transaction: this.data.transaction })
    }
  }
})
