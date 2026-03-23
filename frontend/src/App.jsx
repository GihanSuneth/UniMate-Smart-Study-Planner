import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NotesAI from './pages/NotesAI';
import Attendance from './pages/Attendance';
import QuizValidator from './pages/QuizValidator';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import './index.css';

function AppLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <section className="content-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notes-ai" element={<NotesAI />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/quiz-validator" element={<QuizValidator />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminPanel />} />
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
