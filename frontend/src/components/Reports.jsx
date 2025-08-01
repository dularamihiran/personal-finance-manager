import React, { useState, useEffect } from 'react'
import { Container, Card, Table, Row, Col, Form, Button } from 'react-bootstrap'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

function Reports({ user }) {
  const [reportData, setReportData] = useState({
    monthlyData: [],
    categoryData: [],
    totalIncome: 0,
    totalExpenses: 0
  })
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [selectedMonth])

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/reports?month=${selectedMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        setReportData(data.data)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = {
    labels: reportData.monthlyData.map(item => `Day ${item.day}`),
    datasets: [
      {
        label: 'Income',
        data: reportData.monthlyData.map(item => item.income || 0),
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.1
      },
      {
        label: 'Expenses',
        data: reportData.monthlyData.map(item => item.expenses || 0),
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        tension: 0.1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Daily Income vs Expenses'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value
          }
        }
      }
    }
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
          <h1>📊 Financial Reports</h1>
          <p className="text-muted">Analyze your financial trends and patterns</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Select Month</Form.Label>
            <Form.Control
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-end">
          <Button variant="primary" onClick={fetchReportData}>
            Generate Report
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="summary-card">
            <Card.Body className="text-center">
              <h5>Total Income</h5>
              <div className="summary-amount text-success">
                ${reportData.totalIncome.toFixed(2)}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="summary-card">
            <Card.Body className="text-center">
              <h5>Total Expenses</h5>
              <div className="summary-amount text-danger">
                ${reportData.totalExpenses.toFixed(2)}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Line data={chartData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>Expense Breakdown by Category</h5>
            </Card.Header>
            <Card.Body>
              {reportData.categoryData.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.categoryData.map((category, index) => (
                      <tr key={index}>
                        <td>{category._id}</td>
                        <td>${category.total.toFixed(2)}</td>
                        <td>
                          {((category.total / reportData.totalExpenses) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center">No expense data for this period</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Reports
