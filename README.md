# Attendance Management System

A comprehensive attendance management system built with React.js, Node.js, and MySQL.

## Features

- User Authentication (Student, Faculty, Admin)
- QR Code-based Attendance
- Attendance Records Management
- Report Generation
- Role-based Access Control

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd attendance-management-system
```

2. Install dependencies:
```bash
npm run install:all
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=attendance_system
JWT_SECRET=your_jwt_secret_key
```

4. Set up the database:
   - Create a MySQL database named `attendance_system`
   - Run the SQL commands from `schema.sql` to create the tables

5. Start the development servers:
```bash
npm run dev:full
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Default Admin Account

- Email: admin@example.com
- Password: admin123

## Project Structure

```
attendance-management-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js        # Main App component
│   │   └── index.js      # Entry point
├── routes/                # Backend routes
├── config/               # Configuration files
├── server.js             # Backend entry point
└── schema.sql           # Database schema
```

## Available Scripts

- `npm start`: Start the backend server
- `npm run dev`: Start the backend server with nodemon
- `npm run client`: Start the frontend development server
- `npm run dev:full`: Start both frontend and backend servers
- `npm run install:all`: Install dependencies for both frontend and backend

## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/register - User registration

### Attendance
- GET /api/attendance/records - Get attendance records
- POST /api/attendance/submit - Submit attendance
- PUT /api/attendance/records/:id - Update attendance record
- DELETE /api/attendance/records/:id - Delete attendance record
- GET /api/attendance/export - Export attendance records

### Class Management
- GET /api/class/list - Get class list
- POST /api/class/create - Create new class
- GET /api/class/active - Get active class
- PUT /api/class/:id/deactivate - Deactivate class

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 