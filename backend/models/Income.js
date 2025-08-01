const mongoose = require('mongoose')

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  source: {
    type: String,
    required: [true, 'Please provide income source'],
    trim: true,
    maxlength: [100, 'Source cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Index for efficient queries
incomeSchema.index({ userId: 1, date: -1 })

module.exports = mongoose.model('Income', incomeSchema)
