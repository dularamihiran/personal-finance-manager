# Personal Finance Manager

A full-stack web application to help users manage their monthly income and expenses with interactive dashboards and financial reports.

## 🚀 Features

- **User Authentication**: Secure registration and login system
- **Income Management**: Add, view, edit, and delete income entries
- **Expense Tracking**: Categorized expense management with multiple categories
- **Dashboard**: Interactive dashboard with financial summaries and charts
- **Reports**: Monthly and yearly financial reports with visualizations
- **Responsive Design**: Bootstrap-based responsive UI
- **Real-time Charts**: Interactive charts using Chart.js

## 🛠️ Tech Stack

### Frontend
- React.js 18
- JavaScript (ES6+)
- Bootstrap 5 & React Bootstrap
- Chart.js & React Chart.js 2
- React Router DOM
- Axios for API calls
- Vite for build tooling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- express-validator for input validation
- CORS enabled

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd personal-finance-manager
```

### 2. Install root dependencies
```bash
npm run install-deps
```

This will install dependencies for both frontend and backend.

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/personal-finance
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod
```

### 5. Run the application

**Development mode (runs both frontend and backend):**
```bash
npm run dev
```

**Run backend only:**
```bash
npm run server
```

**Run frontend only:**
```bash
npm run client
```

**Production build:**
```bash
npm run build
npm start
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Income Management
- `GET /api/income` - Get all incomes
- `POST /api/income` - Add new income
- `GET /api/income/:id` - Get single income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### Expense Management
- `GET /api/expense` - Get all expenses
- `POST /api/expense` - Add new expense
- `GET /api/expense/:id` - Get single expense
- `PUT /api/expense/:id` - Update expense
- `DELETE /api/expense/:id` - Delete expense

### Dashboard
- `GET /api/dashboard/summary` - Get financial summary
- `GET /api/dashboard/recent-transactions` - Get recent transactions
- `GET /api/dashboard/expense-categories` - Get expense categories breakdown

### Reports
- `GET /api/reports` - Get monthly reports
- `GET /api/reports/yearly` - Get yearly reports

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/change-password` - Change password

## 📊 Database Schema

### Users Collection
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  createdAt: Date
}
```

### Incomes Collection
```javascript
{
  userId: ObjectId,
  amount: Number,
  source: String,
  date: Date,
  createdAt: Date
}
```

### Expenses Collection
```javascript
{
  userId: ObjectId,
  amount: Number,
  category: String,
  description: String,
  date: Date,
  createdAt: Date
}
```

## 🎨 Available Expense Categories

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

## 🔒 Security Features

- JWT-based authentication
- Password hashing using bcryptjs
- Input validation and sanitization
- Protected API routes
- CORS configuration
- Environment variables for sensitive data

## 📱 Application Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── IncomeForm.jsx
│   │   ├── ExpenseForm.jsx
│   │   ├── Reports.jsx
│   │   ├── Profile.jsx
│   │   └── Navbar.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

### Backend Structure
```
backend/
├── models/
│   ├── User.js
│   ├── Income.js
│   └── Expense.js
├── routes/
│   ├── auth.js
│   ├── income.js
│   ├── expense.js
│   ├── dashboard.js
│   ├── reports.js
│   └── user.js
├── middleware/
│   └── auth.js
├── server.js
├── package.json
└── .env
```

## 🚀 Deployment

### Development
The application runs on:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production
For production deployment:
1. Build the frontend: `npm run build`
2. Set `NODE_ENV=production` in your environment
3. Configure your production MongoDB URI
4. Use a strong JWT secret
5. Deploy to your preferred hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Development Notes

- The application uses JWT tokens stored in localStorage for authentication
- All monetary values are stored as numbers in the database
- Dates are stored as JavaScript Date objects
- The frontend includes error handling and loading states
- Input validation is implemented both on frontend and backend
- Charts are rendered using Chart.js for better performance

## 🔧 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**: Ensure MongoDB is running and the connection string is correct
2. **CORS Errors**: Check that the backend CORS configuration includes your frontend URL
3. **JWT Verification Failed**: Ensure the JWT_SECRET is set and consistent
4. **Port Already in Use**: Change the PORT in the .env file if 5000 is occupied

### Development Tips:

- Use browser developer tools to debug frontend issues
- Check backend console logs for API errors
- Verify MongoDB connections using MongoDB Compass
- Test API endpoints using tools like Postman or Thunder Client
