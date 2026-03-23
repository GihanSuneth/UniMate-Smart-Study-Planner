import React from 'react';
import { useNavigate } from 'react-router-dom';
import mascot1 from '../images/action-figure-1.png';
import mascot2 from '../images/action-figure-2.png';
import mascot3 from '../images/action-figure-3.png';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="landing-page">
      <div className="landing-header">
        <h1>Welcome to <span className="highlight">UniMate</span></h1>
        <p>The Smart Study Planner. Select your role to get started.</p>
      </div>

      <div className="roles-container">
        {/* Student Role */}
        <div className="role-card" onClick={() => handleRoleSelect('student')}>
          <div className="role-mascot-wrapper bg-student">
            <img src={mascot1} alt="Student Mascot" className="role-mascot" />
          </div>
          <div className="role-content">
            <h2>Student</h2>
            <p>Access notes, take quizzes, view schedules, and track your attendance.</p>
            <button className="btn-role btn-student">Login as Student</button>
          </div>
        </div>

        {/* Teacher Role */}
        <div className="role-card" onClick={() => handleRoleSelect('teacher')}>
          <div className="role-mascot-wrapper bg-teacher">
            <img src={mascot2} alt="Teacher Mascot" className="role-mascot" />
          </div>
          <div className="role-content">
            <h2>Teacher</h2>
            <p>Generate QR attendance, manage classes, validate quizzes, and review analytics.</p>
            <button className="btn-role btn-teacher">Login as Teacher</button>
          </div>
        </div>

        {/* Admin Role */}
        <div className="role-card" onClick={() => handleRoleSelect('admin')}>
          <div className="role-mascot-wrapper bg-admin">
            <img src={mascot3} alt="Admin Mascot" className="role-mascot mascot-large" />
          </div>
          <div className="role-content">
            <h2>System Admin</h2>
            <p>Assign user roles, audit overall attendance, and oversee system health.</p>
            <button className="btn-role btn-admin">Login as Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
