import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

function Dashboard({ user }) {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  })
  const [recentTransactions, setRecentTransactions] = useState([])
  const [expenseCategories, setExpenseCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [summaryRes, transactionsRes, categoriesRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/dashboard/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/dashboard/recent-transactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/dashboard/expense-categories`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const summaryData = await summaryRes.json()
      const transactionsData = await transactionsRes.json()
      const categoriesData = await categoriesRes.json()

      if (summaryData.success) setSummary(summaryData.data)
      if (transactionsData.success) setRecentTransactions(transactionsData.data)
      if (categoriesData.success) setExpenseCategories(categoriesData.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = {
    labels: expenseCategories.map(cat => cat._id),
    datasets: [
      {
        data: expenseCategories.map(cat => cat.total),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }
    ]
  }

  const monthlyData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [summary.totalIncome, summary.totalExpenses],
        backgroundColor: ['#28a745', '#dc3545'],
        borderColor: ['#28a745', '#dc3545'],
        borderWidth: 1
      }
    ]
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1>Welcome back, {user.username}!</h1>
          <p className="text-muted">Here's your financial overview for this month</p>
        </Col>
      </Row>

      <Row className="dashboard-cards mb-4">
        <Col md={4}>
          <Card className="summary-card income-card">
            <Card.Body>
              <h5>Total Income</h5>
              <div className="summary-amount">${summary.totalIncome.toFixed(2)}</div>
              <small className="text-muted">This month</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card expense-card">
            <Card.Body>
              <h5>Total Expenses</h5>
              <div className="summary-amount">${summary.totalExpenses.toFixed(2)}</div>
              <small className="text-muted">This month</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card balance-card">
            <Card.Body>
              <h5>Balance</h5>
              <div className={`summary-amount ${summary.balance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
                ${summary.balance.toFixed(2)}
              </div>
              <small className="text-muted">Remaining</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="chart-container">
            <Card.Body>
              <h5>Monthly Overview</h5>
              <div style={{ height: '300px', width: '100%' }}>
                <Bar 
                  data={monthlyData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="chart-container">
            <Card.Body>
              <h5>Expense Categories</h5>
              <div style={{ height: '300px', width: '100%' }}>
                {expenseCategories.length > 0 ? (
                  <Doughnut 
                    data={chartData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }} 
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <p className="text-muted text-center">No expenses recorded yet</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card style={{ height: '500px' }}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Recent Transactions</h5>
              <div>
                <Button variant="success" size="sm" href="/add-income" className="me-2">
                  Add Income
                </Button>
                <Button variant="danger" size="sm" href="/add-expense">
                  Add Expense
                </Button>
              </div>
            </Card.Header>
            <Card.Body style={{ overflow: 'auto', height: 'calc(100% - 70px)' }}>
              {recentTransactions.length > 0 ? (
                <Table responsive>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction, index) => (
                      <tr key={index}>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>{transaction.source || transaction.category}</td>
                        <td>
                          <span className={`badge ${transaction.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={transaction.type === 'income' ? 'income-amount' : 'expense-amount'}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <p className="text-muted text-center">No transactions yet. Start by adding some income or expenses!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Dashboard
