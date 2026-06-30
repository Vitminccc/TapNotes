const { formatMoney, percent } = require('../../utils/format.js')

Component({
  properties: {
    item: {
      type: Object,
      value: null
    }
  },
  data: {},
  observers: {
    'item': function(item) {
      if (!item) return
      const spentStr = formatMoney(item.spent || 0)
      const amountStr = formatMoney(item.amount)
      const remaining = item.amount - (item.spent || 0)
      const remainingStr = formatMoney(Math.abs(remaining))
      const percentVal = percent(item.spent || 0, item.amount)
      const isOver = remaining < 0
      this.setData({
        spentStr,
        amountStr,
        remainingStr,
        percentVal,
        isOver
      })
    }
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { item: this.data.item })
    }
  }
})
