Component({
  properties: {
    mode: {
      type: String,
      value: 'full'
    },
    advice: {
      type: Object,
      value: null
    },
    loading: {
      type: Boolean,
      value: false
    }
  },
  data: {
    activeTab: 0,
    tabs: [
      { key: 'consumption', label: '消费', icon: '📊' },
      { key: 'budget', label: '预算', icon: '🎯' },
      { key: 'investment', label: '理财', icon: '📈' },
      { key: 'bills', label: '账单', icon: '📅' }
    ]
  },
  methods: {
    switchTab(e) {
      const idx = e.currentTarget.dataset.idx
      this.setData({ activeTab: idx })
    },
    refresh() {
      this.triggerEvent('refresh')
    },
    goToFinance() {
      wx.switchTab({
        url: '/pages/finance/finance'
      })
    }
  }
})
