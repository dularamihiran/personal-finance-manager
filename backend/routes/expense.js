const express = require('express')
const { body, validationResult } = require('express-validator')
const Expense = require('../models/Expense')
const { protect } = require('../middleware/auth')

const router = express.Router()

// @desc    Add expense
// @route   POST /api/expense
// @access  Private
router.post('/', protect, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').isIn([
    'Food & Dining',
    'Transportation',
    'Housing & Rent',
    'Utilities',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Education',
    'Savings',
    'Other'
  ]).withMessage('Please select a valid category'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('description').optional().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      })
    }

    const { amount, category, description, date } = req.body

    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      category,
      description: description || '',
      date: new Date(date)
    })

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: expense
    })
  } catch (error) {
    console.error('Add expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while adding expense'
    })
  }
})

// @desc    Get all expenses for user
// @route   GET /api/expense
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { month, year, category, limit = 50 } = req.query
    
    let query = { userId: req.user._id }
    
    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)
      query.date = { $gte: startDate, $lte: endDate }
    }

    // Filter by category if provided
    if (category) {
      query.category = category
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))

    const total = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    res.json({
      success: true,
      data: expenses,
      total: total.length > 0 ? total[0].total : 0,
      count: expenses.length
    })
  } catch (error) {
    console.error('Get expenses error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses'
    })
  }
})

// @desc    Get single expense
// @route   GET /api/expense/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      })
    }

    res.json({
      success: true,
      data: expense
    })
  } catch (error) {
    console.error('Get expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense'
    })
  }
})

// @desc    Update expense
// @route   PUT /api/expense/:id
// @access  Private
router.put('/:id', protect, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').isIn([
    'Food & Dining',
    'Transportation',
    'Housing & Rent',
    'Utilities',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Education',
    'Savings',
    'Other'
  ]).withMessage('Please select a valid category'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('description').optional().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      })
    }

    const { amount, category, description, date } = req.body

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { amount, category, description: description || '', date: new Date(date) },
      { new: true, runValidators: true }
    )

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      })
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    })
  } catch (error) {
    console.error('Update expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating expense'
    })
  }
})

// @desc    Delete expense
// @route   DELETE /api/expense/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      })
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    })
  } catch (error) {
    console.error('Delete expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting expense'
    })
  }
})

module.exports = router
