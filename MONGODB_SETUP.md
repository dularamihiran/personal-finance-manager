# MongoDB Atlas Setup Guide

This guide explains how to set up MongoDB collections for the Personal Finance Manager application.

## Collections Are Created Automatically

Your MongoDB Atlas database will automatically create the following collections when data is first inserted:

### 1. `users` Collection
**Created when:** First user registers
**Structure:**
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed with bcryptjs),
  createdAt: Date
}
```

### 2. `incomes` Collection
**Created when:** First income is added
**Structure:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to users),
  amount: Number,
  source: String,
  date: Date,
  createdAt: Date
}
```

### 3. `expenses` Collection
**Created when:** First expense is added
**Structure:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to users),
  amount: Number,
  category: String, // Enum values listed below
  description: String (optional),
  date: Date,
  createdAt: Date
}
```

## Expense Categories

The following categories are available for expenses:
- Food & Dining
- Transportation
- Housing & Rent
- Utilities
- Healthcare
- Entertainment
- Shopping
- Education
- Savings
- Other

## Indexes (Created Automatically by Mongoose)

The application will automatically create these indexes for better performance:

### Users Collection
- Unique index on `email`
- Unique index on `username`

### Incomes Collection
- Compound index on `userId` and `date` (descending)

### Expenses Collection
- Compound index on `userId` and `date` (descending)
- Compound index on `userId` and `category`

## Manual Setup (Optional)

If you want to manually create collections in MongoDB Atlas:

1. **Open MongoDB Atlas Dashboard**
2. **Go to your cluster** → Browse Collections
3. **Create Database:** `personal-finance`
4. **Add Collections:** `users`, `incomes`, `expenses`

However, this is **not necessary** as Mongoose will create everything automatically when the application runs.

## Verification

To verify your collections exist, you can:

1. **Use the test script:**
   ```bash
   cd backend
   node test-connection.js
   ```

2. **Check MongoDB Atlas Dashboard:**
   - Go to Database → Browse Collections
   - You should see: `users`, `incomes`, `expenses`

3. **View in MongoDB Compass:**
   - Connect using your connection string
   - Browse the `personal-finance` database

## Connection String Format

Your connection string should look like:
```
mongodb+srv://username:password@cluster.xxxxx.mongodb.net/personal-finance?retryWrites=true&w=majority
```

Make sure:
- Replace `username` and `password` with your actual credentials
- The database name is `personal-finance`
- Your IP address is whitelisted in Network Access
