import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  IconCalendarStats, IconPencilCheck, IconAlertTriangle, IconCheck, IconX 
} from '@tabler/icons-react';
import "./Analytics.css";

function StudentAnalytics() {
  const navigate = useNavigate();
  const [attThreshold, setAttThreshold] = useState(75);
  const [quizThreshold, setQuizThreshold] = useState(80);

  // 🔒 NEW: locked thresholds
  const [locked, setLocked] = useState(null);
  const [confirmStep, setConfirmStep] = useState(false);

  // MOCK DATA: Last Week
  const lastWeek = {
    att: 85,
    quiz: 70,
    attTarget: 80,
    quizTarget: 75
  };

  // MOCK DATA: Current Week
  const currentWeek = {
    att: 88,
    quiz: 74,
  };

  const [toast, setToast] = useState(null);

  // ✅ USE CURRENT LOCKED VALUES IF AVAILABLE for current week validation
  const activeAtt = locked ? locked.att : attThreshold;
  const activeQuiz = locked ? locked.quiz : quizThreshold;

  const getAttendanceState = (val, target) => {
    return val >= target ? "ok" : "error";
  };

  const getQuizState = (val, target) => {
    if (val >= target) return "ok";
    if (val >= target - 10) return "warn";
    return "error";
  };

  const runValidation = () => {
    // 🚨 REQUIRE LOCK FIRST
    if (!locked) {
      showToast("error", "No Targets Set", "Please set and lock your targets for the week first 🔒");
      return;
    }

    const issues = [];
    if (currentWeek.att < activeAtt)
      issues.push(`Attendance (${currentWeek.att}%) is below your target (${activeAtt}%)`);
    if (currentWeek.quiz < activeQuiz)
      issues.push(`Quiz performance (${currentWeek.quiz}%) is below your target (${activeQuiz}%)`);

    // Track Last Week's Criteria
    const lastWeekAttPassed = lastWeek.att >= lastWeek.attTarget;
    const lastWeekQuizPassed = lastWeek.quiz >= lastWeek.quizTarget;
    const lastWeekStatus = (lastWeekAttPassed && lastWeekQuizPassed) ? "Passed all criteria last week." : "Missed some targets last week.";

    // Calculate Deviation from Last Week's performance
    const attDev = activeAtt - lastWeek.att;
    const quizDev = activeQuiz - lastWeek.quiz;
    const deviationStr = `Deviations: Attendance Target is ${attDev > 0 ? '+' : ''}${attDev}% vs last week, Quiz Target is ${quizDev > 0 ? '+' : ''}${quizDev}% vs last week.`;

    // Construct detailed message using newline characters formatting
    let validationFeedback = `${lastWeekStatus}\n${deviationStr}\n\n`;

    if (issues.length === 0) {
      validationFeedback += "Current Week: Great work! You are currently meeting all your active targets.";
      showToast("ok", "On Track! 🎉", validationFeedback);
    } else {
      validationFeedback += `Issues:\n- ${issues.join("\n- ")}`;
      showToast("warn", "Action Required ⚠️", validationFeedback);
    }
  };

  // 🔒 2-step lock
  const handleLock = () => {
    if (locked) {
      setLocked(null);
      setConfirmStep(false);
      showToast("ok", "Unlocked", "Targets unlocked. You can set new goals for the upcoming week 🔓");
      return;
    }
    if (!confirmStep) {
      setConfirmStep(true);
      showToast("warn", "Confirm Targets", "Click again to confirm and lock your targets for the week");
    } else {
      setLocked({ att: attThreshold, quiz: quizThreshold });
      setConfirmStep(false);
      showToast("ok", "Targets Locked ✅", "Your goals are set! Click Run Live Validation to check your current progress.");
    }
  };

  const showToast = (type, title, msg) => {
    setToast({ type, title, msg });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    setTimeout(() => {
      showToast("ok", "Dashboard Ready", "Review your prior performance and set your upcoming goals.");
    }, 800);
  }, []);

  return (
    <div className="analytics-page">

      {/* HEADER */}
      <div className="page-header">
        <h1>Welcome Back, Student 👋</h1>
        <p>Track your academic progress and set achievable goals.</p>
      </div>

      <div className="analytics-dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="analytics-main-col">

          {/* HISTORICAL PERFORMANCE (Last Week) */}
          <div className="overview-card" style={{ marginBottom: '24px', backgroundColor: '#fafbfc' }}>
            <h3 className="overview-card-header" style={{ color: '#444' }}>Last Week's Performance</h3>
            
            <div className="overview-stats-grid">
              
              {/* Last Week Attendance */}
              <div className="analytics-stat-box">
                <div className="stat-box-top">
                  <div className={`icon ${getAttendanceState(lastWeek.att, lastWeek.attTarget) === 'ok' ? 'blue' : 'orange'}`}><IconCalendarStats size={14}/></div>
                  <span>Attendance</span>
                </div>
                <div className="stat-box-value">
                  <h2>{lastWeek.att}%</h2>
                  <span className={`trend ${getAttendanceState(lastWeek.att, lastWeek.attTarget) === 'ok' ? 'up' : 'down'}`}>
                    {lastWeek.att >= lastWeek.attTarget ? "Target Hit ✓" : "Target Missed ⛔"} 
                  </span>
                </div>
                <div style={{fontSize: 12, color: 'var(--text-secondary)'}}>
                  Your Target: {lastWeek.attTarget}%
                </div>
              </div>

              {/* Last Week Quiz */}
              <div className="analytics-stat-box">
                <div className="stat-box-top">
                  <div className={`icon ${getQuizState(lastWeek.quiz, lastWeek.quizTarget) === 'ok' ? 'blue' : 'orange'}`}><IconPencilCheck size={14}/></div>
                  <span>Quiz Performance</span>
                </div>
                <div className="stat-box-value">
                  <h2>{lastWeek.quiz}%</h2>
                  <span className={`trend ${getQuizState(lastWeek.quiz, lastWeek.quizTarget) === 'ok' ? 'up' : 'down'}`}>
                    {lastWeek.quiz >= lastWeek.quizTarget ? "Target Hit ✓" : "Target Missed ⛔"}
                  </span>
                </div>
                <div style={{fontSize: 12, color: 'var(--text-secondary)'}}>
                  Your Target: {lastWeek.quizTarget}%
                </div>
              </div>

              {/* Last Week Status Summary */}
              <div className="analytics-stat-box weak-topics-box" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div className="stat-box-value" style={{ marginBottom: 8, justifyContent: 'center' }}>
                  {(lastWeek.att >= lastWeek.attTarget && lastWeek.quiz >= lastWeek.quizTarget) ? 
                    <><IconCheck color="var(--success)" size={32} /> <h2 style={{color: 'var(--success)'}}>Great Job!</h2></> :
                    <><IconAlertTriangle color="var(--warning)" size={32} /> <h2 style={{color: 'var(--warning)'}}>Needs Work</h2></>
                  }
                </div>
                <p style={{fontSize: 13, color: 'var(--text-secondary)', margin: 0}}>
                  Review your past performance before locking new targets.
                </p>
              </div>

            </div>
          </div>

          {/* TARGET SETTING (Upcoming Week) */}
          <div className="overview-card" style={{ marginBottom: '24px' }}>
            <h3 className="overview-card-header">Set Targets (Upcoming Week)</h3>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  Attendance Target: {attThreshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={attThreshold}
                  disabled={!!locked}
                  onChange={(e) => setAttThreshold(+e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  Quiz Score Target: {quizThreshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={quizThreshold}
                  disabled={!!locked}
                  onChange={(e) => setQuizThreshold(+e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-end', paddingTop: '10px' }}>
                <button className="review-btn" onClick={handleLock} style={{ padding: '10px 20px', fontSize: '14px', backgroundColor: locked ? '#f44336' : confirmStep ? '#ff9800' : '#01b574', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 600 }}>
                  {locked ? "Unlock Targets 🔓" : confirmStep ? "Confirm Lock 🔒" : "Lock Targets"}
                </button>
              </div>
            </div>
          </div>

          {/* CURRENT WEEK PROGRESS */}
          <div className="overview-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
               <h3 className="overview-card-header" style={{marginBottom: 0}}>Current Week Progress</h3>
               <button className="review-btn" onClick={runValidation} style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 600 }}>
                 Run Live Validation
               </button>
            </div>

            <div className="overview-stats-grid">

              {/* Attendance */}
              <div className="analytics-stat-box">
                <div className="stat-box-top">
                  <div className={`icon ${getAttendanceState(currentWeek.att, activeAtt) === 'ok' ? 'blue' : 'orange'}`}><IconCalendarStats size={14}/></div>
                  <span>Current Attendance</span>
                </div>
                <div className="stat-box-value">
                  <h2>{currentWeek.att}%</h2>
                  <span className={`trend ${getAttendanceState(currentWeek.att, activeAtt) === 'ok' ? 'up' : 'down'}`}>
                    {currentWeek.att >= activeAtt ? "On Track ✓" : "Falling Behind ⛔"}
                  </span>
                </div>
                <div className="mini-progress-track">
                  <div className={`mini-progress-fill ${getAttendanceState(currentWeek.att, activeAtt) === 'ok' ? 'blue' : 'orange'}`} style={{width: `${currentWeek.att}%`}}></div>
                </div>
                <div style={{fontSize: 11, color: 'var(--text-secondary)', marginTop: '8px'}}>
                  Active Target: {activeAtt}%
                </div>
              </div>

              {/* Quiz */}
              <div className="analytics-stat-box">
                <div className="stat-box-top">
                  <div className={`icon ${getQuizState(currentWeek.quiz, activeQuiz) === 'ok' ? 'blue' : 'orange'}`}><IconPencilCheck size={14}/></div>
                  <span>Current Quiz Avg</span>
                </div>
                <div className="stat-box-value">
                  <h2>{currentWeek.quiz}%</h2>
                  <span className={`trend ${getQuizState(currentWeek.quiz, activeQuiz) === 'ok' ? 'up' : 'down'}`}>
                     {currentWeek.quiz >= activeQuiz ? "On Track ✓" : `${activeQuiz - currentWeek.quiz}% below goal`}
                  </span>
                </div>
                <div className="mini-progress-track">
                  <div className={`mini-progress-fill ${getQuizState(currentWeek.quiz, activeQuiz) === 'ok' ? 'blue' : 'orange'}`} style={{width: `${currentWeek.quiz}%`}}></div>
                </div>
                <div style={{fontSize: 11, color: 'var(--text-secondary)', marginTop: '8px'}}>
                  Active Target: {activeQuiz}%
                </div>
              </div>

              {/* Weak Topics */}
              <div className="analytics-stat-box weak-topics-box">
                <div className="stat-box-top">
                  <div className="icon light-blue" style={{backgroundColor: '#e3f2fd', color: '#42a5f5'}}><IconAlertTriangle size={14}/></div>
                  <span>Current Weak Topics</span>
                </div>
                <ul className="topic-bullet-list">
                  <li>Database Joins</li>
                  <li>API Authentication</li>
                </ul>
                <button className="review-btn" onClick={() => navigate('/quiz-validator')}>
                  Start Review
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* TOAST (POPS UP AT THE TOP NOW) */}
      {toast && (
        <div className={`toast ${toast.type}`} style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          minWidth: '350px',
          padding: '16px 20px',
          backgroundColor: toast.type === 'error' ? '#ffeeee' : toast.type === 'warn' ? '#fff4e5' : '#e6f4ea',
          borderLeft: `5px solid ${toast.type === 'error' ? '#f44336' : toast.type === 'warn' ? '#ff9800' : '#4caf50'}`,
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'slideDown 0.3s ease-out forwards'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            {toast.type === 'error' && <IconAlertTriangle size={18} color="#f44336" />}
            {toast.type === 'warn' && <IconAlertTriangle size={18} color="#ff9800" />}
            {toast.type === 'ok' && <IconCheck size={18} color="#4caf50" />}
            <strong style={{ color: '#333', fontSize: '15px' }}>{toast.title}</strong>
          </div>
          <div style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{toast.msg}</div>
        </div>
      )}
      
      {/* Dynamic Keyframes for Toast Animation */}
      <style>{`
        @keyframes slideDown {
          from { top: -50px; opacity: 0; }
          to { top: 24px; opacity: 1; }
        }
      `}</style>

    </div>
  );
}

export default StudentAnalytics;