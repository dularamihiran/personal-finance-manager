import React from 'react'
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

function Navbar({ user, logout }) {
  return (
    <BSNavbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <BSNavbar.Brand href="/" className="fw-bold text-success">
          💰 Personal Finance Manager
        </BSNavbar.Brand>
        
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/dashboard">
              <Nav.Link>Dashboard</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/add-income">
              <Nav.Link>Add Income</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/add-expense">
              <Nav.Link>Add Expense</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/reports">
              <Nav.Link>Reports</Nav.Link>
            </LinkContainer>
          </Nav>
          
          <Nav>
            <LinkContainer to="/profile">
              <Nav.Link>Welcome, {user?.username}</Nav.Link>
            </LinkContainer>
            <Button variant="outline-danger" size="sm" onClick={logout}>
              Logout
            </Button>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default Navbar
