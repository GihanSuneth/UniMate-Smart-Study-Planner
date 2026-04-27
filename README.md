# 🎓 UniMate - Smart Study Planner

UniMate is a comprehensive, AI-powered educational management platform designed to streamline student engagement, attendance tracking, and study optimization. Built with a modern tech stack, it provides a seamless experience for Students, Lecturers, and Administrators.

---

## 🚀 Key Features

### 1. 📝 Notes AI
Leverage the power of **Google Gemini AI** to transform your study materials.
- **Auto-Summarization**: Generate concise summaries of long lecture notes.
- **Key Takeaways**: Automatically extract critical concepts and definitions.
- **Smart Quiz Generation**: Turn your notes into interactive quizzes for better retention.

### 2. 📍 Smart Attendance
A secure and efficient QR-based attendance system.
- **QR Generation**: Lecturers can generate unique session-based QR codes.
- **Real-time Marking**: Students mark attendance by scanning QR codes, which are instantly validated.
- **Analytics**: Historical attendance data visualization for both students and staff.

### 3. 🧠 Quiz Validator
Comprehensive assessment management tool.
- **Dynamic Quizzes**: Create, take, and validate quizzes within the platform.
- **Instant Feedback**: Real-time validation of answers with performance scoring.
- **Progress Tracking**: Detailed history of quiz attempts and improvement metrics.

### 4. 📊 Advanced Analytics
Data-driven insights for all user levels.
- **Student Dashboard**: Track attendance trends, quiz performance, and study progress.
- **Lecturer Dashboard**: Monitor class engagement, average scores, and attendance rates.
- **Admin Panel**: System-wide overview of user activity and resource utilization.

---

## 📂 Project Organization

The project is structured as a monorepo with separate layers for the frontend and backend.

### 🏗️ Backend (`/backend`)
Built with **Node.js** and **Express**, using **MongoDB** for data persistence.

- **`models/`**: Mongoose schemas for `User`, `Attendance`, `Quiz`, `Note`, and `Activity`.
- **`controllers/`**: Business logic for each feature (e.g., `authController`, `attendanceController`).
- **`routes/`**: API endpoints organized by module.
- **`services/`**: External integrations, specifically the **Google Gemini AI** service.
- **`middleware/`**: Authentication checks and request validation.

### 💻 Frontend (`/frontend`)
A high-performance SPA built with **React** and **Vite**.

- **`pages/`**: Main views for different user roles (e.g., `StudentDashboard`, `LecturerNotesAI`, `AdminPanel`).
- **`components/`**: Reusable UI elements like `Sidebar`, `Header`, and `WeeklyReportCard`.
- **`assets/`**: Styles and images.
- **State Management**: Uses React hooks and local storage for authentication state.

### 🧪 E2E Testing (`/playwright-tests`)
Automated testing suite using **Playwright**.
- Module-specific tests for Attendance, Analytics, Quiz Validator, and Notes AI.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Framer Motion (Animations), Recharts (Data Viz), Lucide React (Icons).
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose.
- **AI**: Google Generative AI (Gemini 3 Flash).
- **Testing**: Playwright.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Install all dependencies**:
   Run this from the root directory to install packages for the root, frontend, and backend:
   ```bash
   npm run install-all
   ```

3. **Environment Setup**:
   Create a `.env` file in the `/backend` directory:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_gemini_key
   ```

   Create a `.env` file in the `/frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

### Running the App

Start both the backend and frontend concurrently:
```bash
npm run dev
```

---

## 🧪 Running Tests

To execute the end-to-end Playwright tests:

1. Ensure the app is running.
2. Run tests:
   ```bash
   npm run test:playwright
   ```
3. View report:
   ```bash
   npm run test:playwright:report
   ```

---

## 🛡️ Security
- **JWT Authentication**: Secure login and session management.
- **Password Hashing**: BCrypt for user credential safety.
- **Role-Based Access Control (RBAC)**: Restricted access for Students, Lecturers, and Admins.
