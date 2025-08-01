const express = require('express')
const { body, validationResult } = require('express-validator')
const Income = require('../models/Income')
const { protect } = require('../middleware/auth')

const router = express.Router()

// @desc    Add income
// @route   POST /api/income
// @access  Private
router.post('/', protect, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('source').trim().isLength({ min: 1, max: 100 }).withMessage('Source is required and must be less than 100 characters'),
  body('date').isISO8601().withMessage('Please provide a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      })
    }

    const { amount, source, date } = req.body

    const income = await Income.create({
      userId: req.user._id,
      amount,
      source,
      date: new Date(date)
    })

    res.status(201).json({
      success: true,
      message: 'Income added successfully',
      data: income
    })
  } catch (error) {
    console.error('Add income error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while adding income'
    })
  }
})

// @desc    Get all incomes for user
// @route   GET /api/income
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { month, year, limit = 50 } = req.query
    
    let query = { userId: req.user._id }
    
    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)
      query.date = { $gte: startDate, $lte: endDate }
    }

    const incomes = await Income.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))

    const total = await Income.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    res.json({
      success: true,
      data: incomes,
      total: total.length > 0 ? total[0].total : 0,
      count: incomes.length
    })
  } catch (error) {
    console.error('Get incomes error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching incomes'
    })
  }
})

// @desc    Get single income
// @route   GET /api/income/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      })
    }

    res.json({
      success: true,
      data: income
    })
  } catch (error) {
    console.error('Get income error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching income'
    })
  }
})

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
router.put('/:id', protect, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('source').trim().isLength({ min: 1, max: 100 }).withMessage('Source is required and must be less than 100 characters'),
  body('date').isISO8601().withMessage('Please provide a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      })
    }

    const { amount, source, date } = req.body

    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { amount, source, date: new Date(date) },
      { new: true, runValidators: true }
    )

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      })
    }

    res.json({
      success: true,
      message: 'Income updated successfully',
      data: income
    })
  } catch (error) {
    console.error('Update income error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating income'
    })
  }
})

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      })
    }

    res.json({
      success: true,
      message: 'Income deleted successfully'
    })
  } catch (error) {
    console.error('Delete income error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting income'
    })
  }
})

module.exports = router
