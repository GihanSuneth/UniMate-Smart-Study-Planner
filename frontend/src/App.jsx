import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NotesAI from './pages/NotesAI';
import Attendance from './pages/Attendance';
import QuizValidator from './pages/QuizValidator';
import Analytics from './pages/Analytics';
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
            {(role === 'student' || role === 'teacher') && <Route path="/" element={<Dashboard />} />}
            {role === 'admin' && <Route path="/admin" element={<AdminPanel />} />}
            {role === 'admin' && <Route path="/" element={<Navigate to="/admin" />} />}
            
            {(role === 'student' || role === 'teacher') && <Route path="/notes-ai" element={<NotesAI />} />}
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/quiz-validator" element={<QuizValidator />} />
            <Route path="/analytics" element={<Analytics />} />
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
