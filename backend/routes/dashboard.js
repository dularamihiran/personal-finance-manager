const express = require('express')
const Income = require('../models/Income')
const Expense = require('../models/Expense')
const { protect } = require('../middleware/auth')

const router = express.Router()

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

    // Get current month's income and expenses
    const [incomeResult, expenseResult] = await Promise.all([
      Income.aggregate([
        {
          $match: {
            userId: req.user._id,
            date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      Expense.aggregate([
        {
          $match: {
            userId: req.user._id,
            date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
    ])

    const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0
    const totalExpenses = expenseResult.length > 0 ? expenseResult[0].total : 0
    const balance = totalIncome - totalExpenses

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance,
        month: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
      }
    })
  } catch (error) {
    console.error('Dashboard summary error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard summary'
    })
  }
})

// @desc    Get recent transactions
// @route   GET /api/dashboard/recent-transactions
// @access  Private
router.get('/recent-transactions', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10

    // Get recent incomes and expenses
    const [recentIncomes, recentExpenses] = await Promise.all([
      Income.find({ userId: req.user._id })
        .sort({ date: -1 })
        .limit(limit)
        .lean(),
      Expense.find({ userId: req.user._id })
        .sort({ date: -1 })
        .limit(limit)
        .lean()
    ])

    // Add type field and combine
    const incomeTransactions = recentIncomes.map(income => ({
      ...income,
      type: 'income'
    }))

    const expenseTransactions = recentExpenses.map(expense => ({
      ...expense,
      type: 'expense'
    }))

    // Combine and sort by date
    const allTransactions = [...incomeTransactions, ...expenseTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)

    res.json({
      success: true,
      data: allTransactions
    })
  } catch (error) {
    console.error('Recent transactions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent transactions'
    })
  }
})

// @desc    Get expense categories breakdown
// @route   GET /api/dashboard/expense-categories
// @access  Private
router.get('/expense-categories', protect, async (req, res) => {
  try {
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ])

    res.json({
      success: true,
      data: categoryBreakdown
    })
  } catch (error) {
    console.error('Expense categories error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense categories'
    })
  }
})

// @desc    Get monthly trend data
// @route   GET /api/dashboard/monthly-trend
// @access  Private
router.get('/monthly-trend', protect, async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months + 1)
    startDate.setDate(1)

    const [incomeData, expenseData] = await Promise.all([
      Income.aggregate([
        {
          $match: {
            userId: req.user._id,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            total: { $sum: '$amount' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]),
      Expense.aggregate([
        {
          $match: {
            userId: req.user._id,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            total: { $sum: '$amount' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ])
    ])

    // Create month labels
    const monthlyTrend = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const year = current.getFullYear()
      const month = current.getMonth() + 1
      
      const incomeEntry = incomeData.find(item => 
        item._id.year === year && item._id.month === month
      )
      const expenseEntry = expenseData.find(item => 
        item._id.year === year && item._id.month === month
      )
      
      monthlyTrend.push({
        year,
        month,
        monthName: current.toLocaleString('default', { month: 'short', year: 'numeric' }),
        income: incomeEntry ? incomeEntry.total : 0,
        expenses: expenseEntry ? expenseEntry.total : 0,
        balance: (incomeEntry ? incomeEntry.total : 0) - (expenseEntry ? expenseEntry.total : 0)
      })
      
      current.setMonth(current.getMonth() + 1)
    }

    res.json({
      success: true,
      data: monthlyTrend
    })
  } catch (error) {
    console.error('Monthly trend error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching monthly trend'
    })
  }
})

module.exports = router
