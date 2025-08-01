<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Personal Finance Manager - Copilot Instructions

This is a full-stack Personal Finance Manager application built with React.js, Node.js/Express, and MongoDB.

## Project Structure
- **Frontend**: React.js application with Bootstrap styling, using Vite as build tool
- **Backend**: Node.js/Express API server with MongoDB database
- **Authentication**: JWT-based authentication system
- **Database**: MongoDB with Mongoose ODM

## Key Technologies
- React.js 18 with functional components and hooks
- Bootstrap 5 and React Bootstrap for styling
- Chart.js and React Chart.js 2 for data visualization
- Express.js with middleware (CORS, express-validator)
- MongoDB with Mongoose for data modeling
- JWT for authentication and bcryptjs for password hashing

## Code Conventions
- Use functional components with React hooks
- Implement proper error handling on both frontend and backend
- Use async/await for asynchronous operations
- Follow RESTful API conventions for backend routes
- Use proper HTTP status codes and consistent response format
- Implement input validation on both client and server side
- Use Bootstrap classes for styling and responsive design

## Database Models
- **User**: username, email, password (hashed), createdAt
- **Income**: userId, amount, source, date, createdAt
- **Expense**: userId, amount, category, description, date, createdAt

## Authentication Flow
- JWT tokens stored in localStorage
- Protected routes using middleware
- Token verification on page refresh

## API Response Format
```json
{
  "success": boolean,
  "message": string,
  "data": object/array
}
```

## When implementing new features:
1. Add proper input validation
2. Include error handling and loading states
3. Follow the existing code structure and naming conventions
4. Update both frontend and backend as needed
5. Consider responsive design for mobile devices
6. Add appropriate user feedback (success/error messages)
