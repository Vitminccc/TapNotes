const { formatMoney, percent } = require('../../utils/format.js')

Component({
  properties: {
    budget: {
      type: Object,
      value: null
    }
  },
  data: {},
  observers: {
    'budget': function(budget) {
      if (!budget) return
      const totalAmountStr = formatMoney(budget.totalAmount)
      const spentStr = formatMoney(budget.totalSpent || 0)
      const remainingStr = formatMoney(budget.remaining || 0)
      const percentVal = budget.percent || percent(budget.totalSpent || 0, budget.totalAmount)
      this.setData({
        totalAmountStr,
        spentStr,
        remainingStr,
        percentVal
      })
    }
  },
  methods: {
    onTap() {
      this.triggerEvent('tap')
    }
  }
})
