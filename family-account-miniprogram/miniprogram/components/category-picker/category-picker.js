Component({
  properties: {
    categories: {
      type: Array,
      value: []
    },
    value: {
      type: String,
      value: ''
    }
  },
  data: {},
  methods: {
    selectCategory(e) {
      const cat = e.currentTarget.dataset.cat
      this.triggerEvent('change', { category: cat })
    }
  }
})
