const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const incomeRoutes = require('./routes/income')
const expenseRoutes = require('./routes/expense')
const dashboardRoutes = require('./routes/dashboard')
const reportRoutes = require('./routes/reports')
const userRoutes = require('./routes/user')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// ✅ API Routes
app.use('/api/auth', authRoutes)
app.use('/api/income', incomeRoutes)
app.use('/api/expense', expenseRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/user', userRoutes)

// ✅ Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Backend is running!' })
})

// ✅ MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-finance'
    await mongoose.connect(mongoURI)
    console.log('✅ MongoDB Connected Successfully')
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message)
    process.exit(1)
  }
}
connectDB()

// ✅ Serve static files in production (only needed if frontend is built and served from backend)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'))
  })
}

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Something went wrong!' })
})

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ✅ Start Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Personal Finance Manager API is ready!`)
})
