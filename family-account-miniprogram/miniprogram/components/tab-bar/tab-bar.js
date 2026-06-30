Component({
  data: {
    selected: 0,
    color: '#999999',
    selectedColor: '#0F3460',
    list: [
      { pagePath: '/pages/index/index', text: '记账', icon: '📝', activeIcon: '📝' },
      { pagePath: '/pages/expense/expense', text: '支出', icon: '📊', activeIcon: '📊' },
      { pagePath: '/pages/budget/budget', text: '预算', icon: '🎯', activeIcon: '🎯' },
      { pagePath: '/pages/schedule/schedule', text: '日程', icon: '📅', activeIcon: '📅' },
      { pagePath: '/pages/finance/finance', text: '理财', icon: '💰', activeIcon: '💰' }
    ]
  },
  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index
      const url = this.data.list[index].pagePath
      wx.switchTab({ url })
      this.setData({ selected: index })
    },
    setIndex(index) {
      this.setData({ selected: index })
    }
  }
})
