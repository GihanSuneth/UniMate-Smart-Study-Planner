import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import StudentNotesAI from './pages/StudentNotesAI';
import LecturerNotesAI from './pages/LecturerNotesAI';
import StudentAttendance from './pages/StudentAttendance';
import LecturerAttendance from './pages/LecturerAttendance';
import StudentQuizValidator from './pages/StudentQuizValidator';
import LecturerQuizValidator from './pages/LecturerQuizValidator';
import StudentAnalytics from './pages/StudentAnalytics';
import LecturerAnalytics from './pages/LecturerAnalytics';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import './index.css';

function AppLayout() {
  const [role, setRole] = useState(localStorage.getItem('userRole') || null);

  useEffect(() => {
    const handleAuthChange = () => {
      setRole(localStorage.getItem('userRole'));
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  if (!role) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Sidebar role={role} />
      <main className="main-content">
        <Header />
        <section className="content-area">
          <Routes>
            {/* Student Routes */}
            {role === 'student' && <Route path="/" element={<StudentDashboard />} />}
            {role === 'student' && <Route path="/notes-ai" element={<StudentNotesAI />} />}
            {role === 'student' && <Route path="/attendance" element={<StudentAttendance />} />}
            {role === 'student' && <Route path="/quiz-validator" element={<StudentQuizValidator />} />}
            {role === 'student' && <Route path="/analytics" element={<StudentAnalytics />} />}

            {/* Lecturer Routes */}
            {role === 'Lecturer' && <Route path="/" element={<LecturerDashboard />} />}
            {role === 'Lecturer' && <Route path="/notes-ai" element={<LecturerNotesAI />} />}
            {role === 'Lecturer' && <Route path="/attendance" element={<LecturerAttendance />} />}
            {role === 'Lecturer' && <Route path="/quiz-validator" element={<LecturerQuizValidator />} />}
            {role === 'Lecturer' && <Route path="/analytics" element={<LecturerAnalytics />} />}

            {/* Admin Routes */}
            {role === 'admin' && <Route path="/admin" element={<AdminPanel />} />}
            {role === 'admin' && <Route path="/" element={<Navigate to="/admin" />} />}
            {role === 'admin' && <Route path="/attendance" element={<LecturerAttendance />} />}
            {role === 'admin' && <Route path="/quiz-validator" element={<LecturerQuizValidator />} />}
            {role === 'admin' && <Route path="/analytics" element={<LecturerAnalytics />} />}
            
            {/* Shared Routes */}
            <Route path="/settings" element={<Settings />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
