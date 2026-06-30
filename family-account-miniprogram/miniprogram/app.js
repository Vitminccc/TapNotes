App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'family-account-xxx',
        traceUser: true
      })
    }

    this.globalData = {
      userInfo: null,
      currentFamilyId: '',
      currentFamily: null,
      categories: [],
      accounts: [],
      useMock: true
    }

    this.initMockData()
  },

  initMockData() {
    const mockData = {
      userInfo: {
        _id: 'user_001',
        nickname: '小明',
        avatarUrl: ''
      },
      currentFamilyId: 'family_001',
      currentFamily: {
        _id: 'family_001',
        name: '我的新家',
        type: 'decoration',
        ownerOpenid: 'user_001'
      },
      categories: [
        { _id: 'cat_001', name: '设计与施工', type: 'expense', icon: '施', color: '#0F3460', bgColor: '#E8EDF5', isSystem: true, sort: 1 },
        { _id: 'cat_002', name: '主材', type: 'expense', icon: '材', color: '#D4895A', bgColor: '#FBE8D9', isSystem: true, sort: 2 },
        { _id: 'cat_003', name: '家具软装', type: 'expense', icon: '家', color: '#9B7AB0', bgColor: '#EFE4F1', isSystem: true, sort: 3 },
        { _id: 'cat_004', name: '家电', type: 'expense', icon: '电', color: '#5E8BA0', bgColor: '#DDE8ED', isSystem: true, sort: 4 },
        { _id: 'cat_005', name: '其他', type: 'expense', icon: '其', color: '#7F7F7F', bgColor: '#E0E0E0', isSystem: true, sort: 5 },
        { _id: 'cat_006', name: '餐饮', type: 'expense', icon: '🍜', color: '#E74C3C', bgColor: '#FDEDEC', isSystem: true, sort: 6 },
        { _id: 'cat_007', name: '交通', type: 'expense', icon: '🚗', color: '#3498DB', bgColor: '#EBF5FB', isSystem: true, sort: 7 },
        { _id: 'cat_008', name: '购物', type: 'expense', icon: '🛒', color: '#9B59B6', bgColor: '#F5EEF8', isSystem: true, sort: 8 },
        { _id: 'cat_101', name: '工资', type: 'income', icon: '💰', color: '#27AE60', bgColor: '#EAFAF1', isSystem: true, sort: 1 },
        { _id: 'cat_102', name: '理财', type: 'income', icon: '📈', color: '#27AE60', bgColor: '#EAFAF1', isSystem: true, sort: 2 },
        { _id: 'cat_103', name: '红包', type: 'income', icon: '🧧', color: '#E74C3C', bgColor: '#FDEDEC', isSystem: true, sort: 3 }
      ],
      accounts: [
        { _id: 'acc_001', name: '招商银行', type: 'debit', balance: 15000000, icon: '💳', color: '#E74C3C', sort: 1 },
        { _id: 'acc_002', name: '支付宝', type: 'alipay', balance: 500000, icon: '📱', color: '#1677FF', sort: 2 },
        { _id: 'acc_003', name: '微信钱包', type: 'wechat', balance: 200000, icon: '💬', color: '#07C160', sort: 3 },
        { _id: 'acc_004', name: '现金', type: 'cash', balance: 50000, icon: '💵', color: '#27AE60', sort: 4 },
        { _id: 'acc_005', name: '信用卡', type: 'credit', balance: -300000, creditLimit: 5000000, icon: '💎', color: '#9B59B6', sort: 5 }
      ],
      transactions: [
        { _id: 'tx_001', type: 'expense', amount: 3040000, categoryId: 'cat_001', categoryName: '设计与施工', accountId: 'acc_001', accountName: '招商银行', date: '2026-06-28', time: '10:30', remark: '装修公司中期款', project: '装修' },
        { _id: 'tx_002', type: 'expense', amount: 580000, categoryId: 'cat_002', categoryName: '主材', accountId: 'acc_001', accountName: '招商银行', date: '2026-06-25', time: '14:20', remark: '瓷砖采购', project: '装修' },
        { _id: 'tx_003', type: 'expense', amount: 230000, categoryId: 'cat_002', categoryName: '主材', accountId: 'acc_002', accountName: '支付宝', date: '2026-06-22', time: '09:15', remark: '木地板定金', project: '装修' },
        { _id: 'tx_004', type: 'expense', amount: 2890000, categoryId: 'cat_004', categoryName: '家电', accountId: 'acc_001', accountName: '招商银行', date: '2026-06-20', time: '16:00', remark: '家电套装', project: '装修' },
        { _id: 'tx_005', type: 'expense', amount: 617200, categoryId: 'cat_005', categoryName: '其他', accountId: 'acc_003', accountName: '微信钱包', date: '2026-06-18', time: '11:30', remark: '杂项支出', project: '装修' },
        { _id: 'tx_006', type: 'expense', amount: 125600, categoryId: 'cat_006', categoryName: '餐饮', accountId: 'acc_002', accountName: '支付宝', date: '2026-06-30', time: '12:30', remark: '午餐', project: '日常' },
        { _id: 'tx_007', type: 'expense', amount: 3500, categoryId: 'cat_007', categoryName: '交通', accountId: 'acc_003', accountName: '微信钱包', date: '2026-06-30', time: '08:30', remark: '地铁', project: '日常' },
        { _id: 'tx_008', type: 'income', amount: 1500000, categoryId: 'cat_101', categoryName: '工资', accountId: 'acc_001', accountName: '招商银行', date: '2026-06-25', time: '10:00', remark: '6月工资', project: '日常' },
        { _id: 'tx_009', type: 'expense', amount: 89000, categoryId: 'cat_008', categoryName: '购物', accountId: 'acc_002', accountName: '支付宝', date: '2026-06-28', time: '20:00', remark: '日用品', project: '日常' },
        { _id: 'tx_010', type: 'expense', amount: 156000, categoryId: 'cat_001', categoryName: '设计与施工', accountId: 'acc_001', accountName: '招商银行', date: '2026-06-15', time: '09:00', remark: '设计费首付', project: '装修' }
      ],
      budget: {
        _id: 'budget_001',
        familyId: 'family_001',
        name: '装修总预算',
        type: 'project',
        totalAmount: 35000000,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        items: [
          { _id: 'bi_001', categoryId: 'cat_001', categoryName: '设计与施工', amount: 18000000, iconText: '施', color: '#0F3460', bgColor: '#E8EDF5', spent: 16300000, sort: 1 },
          { _id: 'bi_002', categoryId: 'cat_002', categoryName: '主材', amount: 7000000, iconText: '材', color: '#D4895A', bgColor: '#FBE8D9', spent: 810000, sort: 2 },
          { _id: 'bi_003', categoryId: 'cat_003', categoryName: '家具软装', amount: 3000000, iconText: '家', color: '#9B7AB0', bgColor: '#EFE4F1', spent: 0, sort: 3 },
          { _id: 'bi_004', categoryId: 'cat_004', categoryName: '家电', amount: 6500000, iconText: '电', color: '#5E8BA0', bgColor: '#DDE8ED', spent: 2890000, sort: 4 },
          { _id: 'bi_005', categoryId: 'cat_005', categoryName: '其他', amount: 500000, iconText: '其', color: '#7F7F7F', bgColor: '#E0E0E0', spent: 617200, sort: 5 }
        ]
      },
      schedules: [
        { _id: 'sch_001', title: '信用卡还款', type: 'bill', date: '2026-07-05', time: '10:00', amount: 300000, isCompleted: false, color: '#E74C3C' },
        { _id: 'sch_002', title: '水电缴费', type: 'bill', date: '2026-07-10', time: '09:00', amount: 20000, isCompleted: false, color: '#3498DB' },
        { _id: 'sch_003', title: '装修验收', type: 'todo', date: '2026-07-15', time: '14:00', isCompleted: false, color: '#27AE60' },
        { _id: 'sch_004', title: '妈妈生日', type: 'anniversary', date: '2026-07-20', isCompleted: false, color: '#E9B824' },
        { _id: 'sch_005', title: '房贷还款', type: 'bill', date: '2026-07-01', time: '08:00', amount: 800000, isCompleted: true, color: '#E74C3C' },
        { _id: 'sch_006', title: '买家具', type: 'todo', date: '2026-07-08', time: '10:00', isCompleted: false, color: '#9B59B6' }
      ],
      assets: [
        { _id: 'ast_001', name: '沪深300指数基金', type: 'fund', cost: 5000000, currentValue: 5230000, profit: 230000, profitRate: 4.6, status: 'holding' },
        { _id: 'ast_002', name: '某某股票', type: 'stock', cost: 3000000, currentValue: 2850000, profit: -150000, profitRate: -5.0, status: 'holding' },
        { _id: 'ast_003', name: '一年定期存款', type: 'deposit', cost: 10000000, currentValue: 10250000, profit: 250000, profitRate: 2.5, status: 'holding' }
      ],
      familyMembers: [
        { _id: 'fm_001', familyId: 'family_001', openid: 'user_001', nickname: '小明', role: 'owner', color: '#0F3460' },
        { _id: 'fm_002', familyId: 'family_001', openid: 'user_002', nickname: '小红', role: 'admin', color: '#E9B824' }
      ]
    }

    wx.setStorageSync('mockData', mockData)
    this.globalData.mockData = mockData
  },

  getMockData() {
    return wx.getStorageSync('mockData') || this.globalData.mockData
  },

  saveMockData(data) {
    wx.setStorageSync('mockData', data)
    this.globalData.mockData = data
  }
})
