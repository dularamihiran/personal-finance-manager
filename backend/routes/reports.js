const express = require('express')
const Income = require('../models/Income')
const Expense = require('../models/Expense')
const { protect } = require('../middleware/auth')

const router = express.Router()

// @desc    Get financial reports
// @route   GET /api/reports
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let { month, year } = req.query
    
    // Default to current month if not provided
    if (!month || !year) {
      const currentDate = new Date()
      month = month || (currentDate.getMonth() + 1).toString()
      year = year || currentDate.getFullYear().toString()
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

    // Get daily breakdown for the month
    const dailyData = await Promise.all([
      // Daily income
      Income.aggregate([
        {
          $match: {
            userId: req.user._id,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dayOfMonth: '$date' },
            income: { $sum: '$amount' }
          }
        }
      ]),
      // Daily expenses
      Expense.aggregate([
        {
          $match: {
            userId: req.user._id,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dayOfMonth: '$date' },
            expenses: { $sum: '$amount' }
          }
        }
      ])
    ])

    // Combine daily data
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()
    const monthlyData = []

    for (let day = 1; day <= daysInMonth; day++) {
      const incomeEntry = dailyData[0].find(item => item._id === day)
      const expenseEntry = dailyData[1].find(item => item._id === day)
      
      monthlyData.push({
        day,
        income: incomeEntry ? incomeEntry.income : 0,
        expenses: expenseEntry ? expenseEntry.expenses : 0
      })
    }

    // Get category breakdown
    const categoryData = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate }
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

    // Get total income and expenses
    const [totalIncomeResult, totalExpensesResult] = await Promise.all([
      Income.aggregate([
        {
          $match: {
            userId: req.user._id,
            date: { $gte: startDate, $lte: endDate }
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
            date: { $gte: startDate, $lte: endDate }
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

    const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].total : 0
    const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].total : 0

    res.json({
      success: true,
      data: {
        monthlyData,
        categoryData,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        period: {
          month: parseInt(month),
          year: parseInt(year),
          monthName: startDate.toLocaleString('default', { month: 'long', year: 'numeric' })
        }
      }
    })
  } catch (error) {
    console.error('Reports error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while generating reports'
    })
  }
})

// @desc    Get yearly summary report
// @route   GET /api/reports/yearly
// @access  Private
router.get('/yearly', protect, async (req, res) => {
  try {
    const { year } = req.query
    const targetYear = parseInt(year) || new Date().getFullYear()
    
    const startDate = new Date(targetYear, 0, 1)
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59)

    // Get monthly breakdown for the year
    const [monthlyIncome, monthlyExpenses] = await Promise.all([
      Income.aggregate([
        {
          $match: {
            userId: req.user._id,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $month: '$date' },
            total: { $sum: '$amount' }
          }
        },
        {
          $sort: { '_id': 1 }
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
            _id: { $month: '$date' },
            total: { $sum: '$amount' }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ])
    ])

    // Create monthly data array
    const monthlyData = []
    for (let month = 1; month <= 12; month++) {
      const incomeEntry = monthlyIncome.find(item => item._id === month)
      const expenseEntry = monthlyExpenses.find(item => item._id === month)
      
      const monthName = new Date(targetYear, month - 1, 1).toLocaleString('default', { month: 'long' })
      
      monthlyData.push({
        month,
        monthName,
        income: incomeEntry ? incomeEntry.total : 0,
        expenses: expenseEntry ? expenseEntry.total : 0,
        balance: (incomeEntry ? incomeEntry.total : 0) - (expenseEntry ? expenseEntry.total : 0)
      })
    }

    // Get yearly totals
    const totalIncome = monthlyIncome.reduce((sum, item) => sum + item.total, 0)
    const totalExpenses = monthlyExpenses.reduce((sum, item) => sum + item.total, 0)

    res.json({
      success: true,
      data: {
        year: targetYear,
        monthlyData,
        totalIncome,
        totalExpenses,
        totalBalance: totalIncome - totalExpenses,
        averageMonthlyIncome: totalIncome / 12,
        averageMonthlyExpenses: totalExpenses / 12
      }
    })
  } catch (error) {
    console.error('Yearly report error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while generating yearly report'
    })
  }
})

module.exports = router
