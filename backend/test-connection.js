const mongoose = require('mongoose')
require('dotenv').config()

const testConnection = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...')
    console.log('Connection string:', process.env.MONGODB_URI ? 'Found' : 'Missing')
    
    await mongoose.connect(process.env.MONGODB_URI)
    
    console.log('✅ Successfully connected to MongoDB Atlas!')
    console.log('📊 Database name:', mongoose.connection.name)
    console.log('🌐 Connection host:', mongoose.connection.host)
    
    // List existing collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('📋 Existing collections:', collections.map(c => c.name))
    
    if (collections.length === 0) {
      console.log('ℹ️  No collections found - this is normal! Collections will be created automatically when data is inserted.')
    }
    
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB Atlas')
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:')
    console.error('Error message:', error.message)
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Check your username and password in the connection string')
    }
    
    if (error.message.includes('network')) {
      console.log('\n💡 Check your internet connection and IP whitelist in MongoDB Atlas')
    }
    
    process.exit(1)
  }
}

testConnection()
