import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  IconCalendarStats, IconPencilCheck, IconAlertTriangle, IconCheck, IconX, IconBrain, IconTarget, IconArrowUpRight, IconTrendingUp
} from '@tabler/icons-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
  BarChart, Bar, Cell, RadialBarChart, RadialBar, PolarAngleAxis, ReferenceLine
} from 'recharts';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from "../api";
import "./Analytics.css";

function StudentAnalytics() {
  const navigate = useNavigate();
  const [attThreshold, setAttThreshold] = useState(75);
  const [quizThreshold, setQuizThreshold] = useState(80);

  // 🔒 NEW: locked thresholds
  const [locked, setLocked] = useState(null);
  const [confirmStep, setConfirmStep] = useState(false);

  // 🔒 DYNAMIC DATA
  // eslint-disable-next-line no-unused-vars
  const [lastWeek, setLastWeek] = useState({ att: 0, quiz: 0, attTarget: 0, quizTarget: 0 });
  const [currentWeek, setCurrentWeek] = useState({ att: 0, quiz: 0 });
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [suggestions, setSuggestions] = useState([]);
  const [criticalInsight, setCriticalInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledModules, setEnrolledModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [overallBoost, setOverallBoost] = useState({ att: 0, quiz: 0, notes: 0 });
  const [deepDive, setDeepDive] = useState(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState({}); // Tracking AI deployment per week/index

  const [toast, setToast] = useState(null);
  const rawId = localStorage.getItem('userId');
  // Check if it's a valid ID (string that is not "null", "undefined" and has length)
  const studentId = (rawId && rawId !== "null" && rawId !== "undefined") ? rawId : null;
  const currentWeekNum = 5; 
  const currentAcademicWeek = 5;
  const moduleNames = {
    'IT3010': 'IT3010 - Network Design and Modeling',
    'IT3011': 'IT3011 - Database Systems',
    'IT3012': 'IT3012 - Operating Systems',
    'IT3013': 'IT3013 - Data Structures and Algorithms',
    'IT3014': 'IT3014 - Data Science and Analytics'
  };

  const getModuleName = (code) => moduleNames[code] || code;

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

  const getAiIndicator = (type) => {
    switch (type?.toUpperCase()) {
      case 'WARNING': return <span className="ai-pulse-dot warning"></span>;
      case 'ACTION': return <span className="ai-pulse-dot action"></span>;
      default: return <span className="ai-pulse-dot spark"></span>;
    }
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

    // Track Last Week's Criteria (Week 4 in our context)
    // Structure changed: each history item has .attendance.actual
    const prevWeek = weeklyHistory.find(w => w.week === currentWeekNum - 1);
    const lastWeekAttPassed = prevWeek ? prevWeek.attendance.actual >= activeAtt : true;
    
    // Construct detailed message
    let validationFeedback = (lastWeekAttPassed) ? "Passed all criteria last week." : "Missed some targets last week.";
    validationFeedback += "\n\n";

    if (issues.length === 0) {
      validationFeedback += "Current Week: Great work! You are currently meeting all your active targets.";
      showToast("ok", "On Track! 🎉", validationFeedback);
    } else {
      validationFeedback += `Issues:\n- ${issues.join("\n- ")}`;
      showToast("warn", "Action Required ⚠️", validationFeedback);
    }
  };

  // 🔒 2-step lock
  const handleLock = async () => {
    if (locked) {
      // 🔓 Handle Unlock Attempt
      if (locked.unlockCount >= 2) {
        showToast("error", "Unlock Limit Reached", "You have already used your 2 allowed changes for this week's targets. 🔒");
        return;
      }

      if (!confirmStep) {
        setConfirmStep(true);
        showToast("warn", "Unlocking Changes...", `You have ${2 - locked.unlockCount} unlock attempts remaining. Click 'Confirm Unlock' to proceed.`);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/analytics/target`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            student: studentId,
            week: currentWeekNum,
            isLocked: false,
            module: selectedModule
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setLocked(null);
          setConfirmStep(false);
          showToast("ok", "Targets Unlocked 🔓", `You can now adjust your goals. You have ${2 - data.unlockCount} unlocks left for this week.`);
        } else {
          showToast("error", "Error", "Failed to unlock targets.");
        }
      } catch (err) { // eslint-disable-line no-unused-vars
        showToast("error", "Connection Error", "Could not reach backend to unlock.");
      }
      return;
    }
    if (!confirmStep) {
      setConfirmStep(true);
      showToast("warn", "Locking Targets...", "Are you sure? Once locked, you cannot change these goals until next week. Click 'Confirm Lock' to proceed.");
    } else {
      if (!studentId) {
        showToast("error", "Unauthorized", "Please log in again. Your session might have expired.");
        return;
      }
      if (!selectedModule) {
        showToast("error", "Module Missing", "Please select a specific module before locking targets.");
        return;
      }
      try {
        const response = await fetch(`${BASE_URL}/analytics/target`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            student: studentId,
            week: currentWeekNum,
            attendanceTarget: attThreshold,
            quizTarget: quizThreshold,
            isLocked: true,
            module: selectedModule
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setLocked({ att: attThreshold, quiz: quizThreshold, unlockCount: data.unlockCount });
          setConfirmStep(false);
          showToast("ok", "Targets Locked ✅", data.unlockCount > 0 ? `Target updated! (${data.unlockCount}/2 changes used)` : "Your goals are saved! Click Run Live Validation to check progress.");
        } else {
           const errData = await response.json();
           console.error("Target Save Failed. Status:", response.status, "Error:", errData);
           showToast("error", "Error", errData.message || `Backend error: ${response.status}`);
        }
      } catch (err) { // eslint-disable-line no-unused-vars
        showToast("error", "Connection Error", "Could not reach backend to save targets.");
      }
    }
  };

  const showToast = (type, title, msg) => {
    setToast({ type, title, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchAnalytics = async () => {
    if (!studentId) {
      setLoading(false);
      setError("Please log in to view your analytics.");
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15s for better resilience

    try {
      // 0. Fetch User Profile for Modules (First time)
      if (enrolledModules.length === 0) {
        const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          const modules = profileData.enrolledModules && profileData.enrolledModules.length > 0
            ? profileData.enrolledModules
            : ['IT3010', 'IT3011', 'IT3012', 'IT3013', 'IT3014'];
          setEnrolledModules(modules);
          if (!selectedModule && modules.length > 0) {
            setSelectedModule(modules[0]);
          }
        }
      }

      const modQuery = selectedModule !== 'Overall' ? `?module=${selectedModule}` : '';

      // 1. Fetch Summary
      const summaryRes = await fetch(`${BASE_URL}/analytics/summary/${studentId}/${currentWeekNum}${modQuery}`, { 
        signal: controller.signal,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!summaryRes.ok) throw new Error(`Summary API returned ${summaryRes.status}`);
      const summaryData = await summaryRes.json();
      
      // 2. Fetch Detailed Multi-Week History
      const historyRes = await fetch(`${BASE_URL}/analytics/history/${studentId}${modQuery}`, { 
        signal: controller.signal,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!historyRes.ok) throw new Error(`History API returned ${historyRes.status}`);
      const historyData = await historyRes.json();

      // 3. Fetch Deep Dive (ONLY if manually deployed or already exists in state)
      // Removing automatic fetch to respect manual trigger request
      if (selectedModule === 'Overall') {
        // Overall boost calculation (demo-logic or real from summary)
        setOverallBoost({
          att: (summaryData?.lastWeek?.attendance || 0) - (summaryData?.lastWeek?.target?.attendanceTarget || 0),
          quiz: (summaryData?.lastWeek?.quiz || 0) - (summaryData?.lastWeek?.target?.quizTarget || 0),
          notes: 15 // Mocked for overall
        });
      }

      clearTimeout(timeoutId);

      setLastWeek({
        att: summaryData.lastWeek.attendance,
        quiz: summaryData.lastWeek.quiz,
        attTarget: summaryData.lastWeek.target.attendanceTarget,
        quizTarget: summaryData.lastWeek.target.quizTarget
      });
      setCurrentWeek({
        att: summaryData.currentWeek.attendance,
        quiz: summaryData.currentWeek.quiz
      });
      // Chronological descending sort (Most recent week first)
      const sortedHistory = (historyData || []).sort((a, b) => b.week - a.week);
      setWeeklyHistory(sortedHistory);
      setSuggestions(summaryData.suggestions || []);
      setCriticalInsight(summaryData.criticalInsight);
      
      if (summaryData.currentWeek.target && summaryData.currentWeek.target.isLocked) {
        setLocked({
          att: summaryData.currentWeek.target.attendanceTarget,
          quiz: summaryData.currentWeek.target.quizTarget,
          unlockCount: summaryData.currentWeek.target.unlockCount
        });
        setAttThreshold(summaryData.currentWeek.target.attendanceTarget);
        setQuizThreshold(summaryData.currentWeek.target.quizTarget);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      if (err.name === 'AbortError') {
        setError("Request timed out. The server might be busy.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
 
  const handleDeployAiTrace = async (weekNum, idx) => {
    if (isDeploying[idx]) return;
    setIsDeploying(prev => ({ ...prev, [idx]: true }));
    try {
      const response = await fetch(`${BASE_URL}/analytics/generate-ai-insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentId: studentId,
          week: weekNum,
          module: selectedModule,
          role: 'student',
          type: 'performance'
        })
      });
 
      if (response.ok) {
        const newInsight = await response.json();
        setWeeklyHistory(prev => {
          const newHistory = [...prev];
          newHistory[idx].aiInsight = newInsight;
          return newHistory;
        });
        showToast("ok", "Logic Trace Deployed 🚀", `Analysis for Week ${weekNum} is now synced with your performance data.`);
      } else if (response.status === 429) {
        showToast("warn", "AI Quota Exceeded ⏳", "Your daily academic analysis limit has been reached. Please wait 60 seconds or try again tomorrow.");
      } else {
        const err = await response.json();
        showToast("error", "AI Synthesis Failed", err.message || "Logic trace could not be generated at this time.");
      }
    } catch (err) {
      showToast("error", "Connection Error", "Check your internet connection.");
    } finally {
      setIsDeploying(prev => ({ ...prev, [idx]: false }));
    }
  };

  const handleDeployAI = async () => {
    if (!studentId || !locked) {
      showToast("error", "Setup Required", "Please ensure your targets are locked before generating AI analytics.");
      return;
    }

    setIsAiGenerating(true);
    try {
      const response = await fetch(`${BASE_URL}/analytics/generate-ai-insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          role: 'student',
          module: selectedModule,
          studentId,
          week: currentWeekNum
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCriticalInsight(data);
        
        // 🔥 Also fetch Deep Dive now that we have deployed AI
        if (selectedModule !== 'Overall') {
          try {
            const deepDiveRes = await fetch(`${BASE_URL}/analytics/quiz-deep-dive/${selectedModule}`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const deepDiveData = await deepDiveRes.json();
            setDeepDive(deepDiveData);
          } catch (e) { console.error("Deep dive fetch failed", e); }
        }

        showToast("ok", "AI Analytics Deployed", "Your deep pattern analysis is now active for this week.");
        fetchAnalytics();
      } else if (response.status === 429) {
        showToast("warn", "AI Quota Exceeded", "Gemini AI Quota Exceeded. Please wait 60 seconds before retrying.");
      } else {
        const errData = await response.json();
        showToast("error", "AI Failure", errData.message || "Failed to generate AI analytics.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "AI Connection Error", "Could not reach AI services.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const loadDemoData = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLastWeek({ att: 88, quiz: 92, attTarget: 75, quizTarget: 80 });
      setCurrentWeek({ att: 72, quiz: 68 });
      setWeeklyHistory([
        { week: 1, attendance: { actual: 100, target: 75 }, quiz: { actual: 85, target: 80 }, aiInsight: { text: "Perfect start! Keep the momentum.", type: "SPARK", priority: "low" } },
        { week: 2, attendance: { actual: 80, target: 75 }, quiz: { actual: 78, target: 80 }, aiInsight: { text: "Quiz score was slightly low, try focusing on Database Joins.", type: "ACTION", priority: "medium" } },
        { week: 3, attendance: { actual: 100, target: 75 }, quiz: { actual: 95, target: 80 }, aiInsight: { text: "Exceptional performance this week!", type: "SPARK", priority: "medium" } },
        { week: 4, attendance: { actual: 88, target: 75 }, quiz: { actual: 92, target: 80 }, aiInsight: { text: "Solid progress. You are well above targets.", type: "SPARK", priority: "low" } }
      ]);
      setCriticalInsight({ text: "Demo Insight: You're performing better than 85% of peers!", type: "SPARK", priority: "high" });
      setLocked({ att: 85, quiz: 85 });
      setAttThreshold(85);
      setQuizThreshold(85);
      setLoading(false);
      showToast("ok", "Demo Mode Enabled 🔬", "Visualizing dashboard with high-fidelity sample data.");
    }, 600);
  };

  useEffect(() => {
    fetchAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule]);

  if (loading) {
    return (
      <div className="analytics-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
        <p style={{ marginLeft: '12px', fontWeight: 500 }}>Loading your analytics data...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">

      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
          <h1>Performance Intelligence 🧠</h1>
          <p>Analyzing academic trends and goal alignment {selectedModule !== 'Overall' ? `for ${selectedModule}` : 'across all enrollments'}.</p>
        </div>
          
          {/* TOP LEVEL AI INSIGHT (GLOBAL) */}
           {criticalInsight && criticalInsight.weeklyAnalysis ? (
            <div className="ai-insight-card" style={{ 
              maxWidth: '350px', 
              background: 'white', 
              padding: '24px', 
              borderRadius: '20px', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              border: '1px solid #eef2ff',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <IconBrain size={18} /> Performance Intelligence (Week {currentWeekNum})
                </div>
                <button 
                  onClick={() => setCriticalInsight(null)} 
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                >
                  <IconX size={16}/>
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ borderLeft: '3px solid #ef4444', paddingLeft: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', marginBottom: '2px' }}>Identified Problem</div>
                  <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{criticalInsight.weeklyAnalysis.problem}</div>
                </div>

                <div style={{ borderLeft: '3px solid #6366f1', paddingLeft: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', marginBottom: '2px' }}>Data-Backed Reason</div>
                  <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{criticalInsight.weeklyAnalysis.reason}</div>
                </div>

                <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '12px', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', marginBottom: '4px' }}>Live AI Suggestion</div>
                  <div style={{ fontSize: '13px', color: '#065f46', fontWeight: '500', lineHeight: '1.5' }}>{criticalInsight.weeklyAnalysis.suggestion}</div>
                </div>
              </div>

              <div className="ai-glow"></div>
            </div>
          ) : (
            <div className="ai-insight-card" style={{ 
              maxWidth: '350px', 
              background: '#f8fafc', 
              padding: '24px', 
              borderRadius: '20px', 
              border: '2px dashed #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '12px',
              justifyContent: 'center'
            }}>
               <IconBrain size={32} color="#94a3b8" />
               <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>AI Intelligence Offline</div>
               <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Deploy AI Analytics manually to analyze your 1-week performance patterns and save tokens.</p>
                 <button 
                  onClick={handleDeployAI}
                  disabled={isAiGenerating || loading}
                  className="deploy-btn"
                  style={{ 
                    marginTop: '12px',
                    backgroundColor: isAiGenerating ? '#94a3b8' : '#6366f1',
                    color: 'white',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: isAiGenerating ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                  }}
                 >
                   {isAiGenerating ? "Generating Insights..." : `Deploy AI Trace Analysis (${selectedModule})`}
                 </button>
            </div>
          )}
        </div>

        {/* OVERALL PERFORMANCE BOOST CARDS (Hidden if module selected) */}
        {selectedModule === 'Overall' && (
          <div className="overall-boost-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '24px' }}>
            {[
              { label: 'Attendance Boost', val: overallBoost.att, icon: <IconCalendarStats size={20} />, unit: '%', color: '#3b82f6' },
              { label: 'Quiz Mastery', val: overallBoost.quiz, icon: <IconPencilCheck size={20} />, unit: '%', color: '#f59e0b' },
              { label: 'Notes Ability', val: overallBoost.notes, icon: <IconBrain size={20} />, unit: ' Activities', color: '#10b981' }
            ].map((stat, i) => (
              <div key={i} className="boost-card" style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: `${stat.color}15`, color: stat.color, padding: '12px', borderRadius: '12px' }}>{stat.icon}</div>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
                    {stat.val >= 0 ? '+' : ''}{stat.val.toFixed(0)}{stat.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODULE SELECTOR CHIPS */}
        <div className="module-selector-chips" style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>

          {enrolledModules.map(mod => (
            <button 
              key={mod}
              onClick={() => setSelectedModule(mod)}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: 'none',
                background: selectedModule === mod ? '#3b82f6' : '#f1f5f9',
                color: selectedModule === mod ? 'white' : '#64748b',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {getModuleName(mod)}
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="analytics-main-col">

          {/* TARGET SETTING (Upcoming Week) */}
          <div className="overview-card" style={{ marginBottom: '24px' }}>
            <h3 className="overview-card-header">Set Targets (Upcoming Week - {selectedModule})</h3>
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

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', alignSelf: 'flex-end', paddingTop: '10px' }}>
                {locked && (
                  <div style={{ fontSize: '12px', color: locked.unlockCount >= 2 ? '#ef4444' : '#64748b', fontWeight: '600', textAlign: 'right' }}>
                    {locked.unlockCount >= 2 ? '🔒 Changes Exhausted' : `🔓 ${2 - locked.unlockCount} edits remaining`}
                  </div>
                )}
                <button 
                  className="review-btn" 
                  onClick={handleLock} 
                  disabled={!!locked && locked.unlockCount >= 2}
                  style={{ 
                    padding: '10px 24px', 
                    fontSize: '14px', 
                    backgroundColor: (locked && locked.unlockCount >= 2) ? '#e2e8f0' : (confirmStep ? '#f59e0b' : (locked ? '#64748b' : '#6366f1')), 
                    color: (locked && locked.unlockCount >= 2) ? '#94a3b8' : '#fff', 
                    border: 'none', 
                    borderRadius: '20px', 
                    cursor: (locked && locked.unlockCount >= 2) ? 'default' : 'pointer', 
                    fontWeight: 700,
                    boxShadow: (locked && locked.unlockCount >= 2) ? 'none' : '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  {locked ? (confirmStep ? "Confirm Unlock 🔓" : "Unlock Targets") : (confirmStep ? "Confirm Lock 🔒" : "Commit Targets")}
                </button>
              </div>
            </div>
          </div>

          {/* CURRENT WEEK PROGRESS */}
          <motion.div 
            className="overview-card" style={{ marginBottom: '24px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
               <h3 className="overview-card-header" style={{marginBottom: 0}}>Current Week Progress (Week {currentWeekNum}) - {selectedModule}</h3>
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
                  <motion.div 
                    className={`mini-progress-fill ${getAttendanceState(currentWeek.att, activeAtt) === 'ok' ? 'blue' : 'orange'}`} 
                    initial={{ width: 0 }}
                    animate={{ width: `${currentWeek.att}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
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
                  <motion.div 
                    className={`mini-progress-fill ${getQuizState(currentWeek.quiz, activeQuiz) === 'ok' ? 'blue' : 'orange'}`} 
                    initial={{ width: 0 }}
                    animate={{ width: `${currentWeek.quiz}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  ></motion.div>
                </div>
                <div style={{fontSize: 11, color: 'var(--text-secondary)', marginTop: '8px'}}>
                  Active Target: {activeQuiz}%
                </div>
              </div>

              {/* Review and Improvement */}
              <div className="analytics-stat-box weak-topics-box">
                <div className="stat-box-top">
                  <div className="icon light-blue" style={{backgroundColor: '#e3f2fd', color: '#42a5f5'}}><IconAlertTriangle size={14}/></div>
                  <span>Aggregated Review & Mastery</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Notes Taking & Generating Logic</div>
                <ul className="topic-bullet-list" style={{ marginBottom: '16px' }}>
                  <li>Quiz Consistency: {currentWeek.quiz >= activeQuiz ? 'High' : 'Improving'}</li>
                  <li>Analysis Completion: {currentWeek.att >= activeAtt ? 'Synced (100%)' : 'Pending (40%)'}</li>
                </ul>
                <button className="review-btn" onClick={() => navigate('/notes-ai')} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none' }}>
                  Start Integrated Review
                </button>
              </div>
            </div>
          </motion.div>

          {/* PERFORMANCE TRACK & INSIGHTS (Module Specific) */}
          <div className="overview-card" style={{ marginBottom: '24px', position: 'relative' }}>
             
             {/* LOCKED OVERLAY for Manual Trigger */}
             {(!deepDive || deepDive.totalAttempts === 0) && selectedModule !== 'Overall' && (
               <div style={{
                 position: 'absolute',
                 inset: 0,
                 background: 'rgba(255,255,255,0.92)',
                 backdropFilter: 'blur(4px)',
                 zIndex: 10,
                 borderRadius: '16px',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center',
                 padding: '40px',
                 textAlign: 'center'
               }}>
                  <div style={{ 
                    padding: '16px', 
                    borderRadius: '50%', 
                    background: '#f1f5f9', 
                    marginBottom: '20px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
                  }}>
                    <IconBrain size={48} color="#6366f1" />
                  </div>
                  <h3 style={{ marginBottom: '8px', color: '#1e293b' }}>Intelligence Report Locked</h3>
                  <p style={{ maxWidth: '400px', color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                    Deep-dive pattern analysis for <strong>{selectedModule}</strong> requires manual deployment. This saves your daily AI credits and ensures data is synced.
                  </p>
                  <button 
                    onClick={handleDeployAI}
                    disabled={isAiGenerating}
                    style={{ 
                      padding: '12px 32px', 
                      background: 'var(--primary)', 
                      color: 'white', 
                      borderRadius: '12px', 
                      border: 'none', 
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}>
                    {isAiGenerating ? 'Deploying Trace Analysis...' : 'Deploy AI Intelligence now'}
                  </button>
               </div>
             )}

             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="overview-card-header" style={{ marginBottom: 0 }}>
                  {selectedModule === 'Overall' ? 'Overall Weekly Learning Report' : `Weekly Learning Report: ${selectedModule}`}
                </h3>
                <div className="ai-badge"><IconBrain size={14}/> AI Clustered Data</div>
             </div>

             <div className="deep-analysis-section">
                <div className="analysis-grid">
                   {/* Hardest Questions */}
                   <div className="analysis-box">
                      <div className="box-header"><IconAlertTriangle size={18} color="#ef4444" /> <span>Critical: Logic Bottlenecks</span></div>
                      <p className="box-desc">These specific questions have the highest failure rates in your latest quizzes.</p>
                      <ul className="failing-questions-list">
                         {deepDive?.hardestQuestions?.length > 0 ? (
                           deepDive.hardestQuestions.map((q, i) => {
                             const rateVal = q.failureRate !== undefined ? Math.round(q.failureRate) : q.rate;
                             return (
                             <li key={i}>
                               <div className="q-head">
                                  <span className="q-text">{q.text}</span>
                                  <span className="fail-badge">{rateVal}% Failure</span>
                               </div>
                               <div className="fail-bar"><div className="fail-fill" style={{ width: `${rateVal}%` }}></div></div>
                             </li>
                           )})
                         ) : (
                           <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>
                              <IconBrain size={32} style={{ marginBottom: '8px' }} />
                              <p style={{ fontSize: '12px' }}>AI is currently identifying logic patterns for <strong>{selectedModule}</strong>. Complete more Week 5 quizzes to trigger deep analysis.</p>
                           </div>
                         )}
                      </ul>
                   </div>

                   {/* Performance Clusters */}
                   <div className="analysis-box">
                      <div className="box-header"><IconCheck size={18} color="#10b981" /> <span>High Mastery Subtopics</span></div>
                      <p className="box-desc">Modules and topics where you've demonstrated consistency above 90%.</p>
                      <div className="mastery-chips">
                         {deepDive?.bestSubtopic ? (
                           <span className="chip green">{deepDive.bestSubtopic}</span>
                         ) : (
                           <div style={{ fontSize: '12px', opacity: 0.6 }}>No mastery clusters identified yet for {selectedModule}.</div>
                         )}
                      </div>
                   </div>
                </div>

                <div className="actual-vs-target-summary" style={{ marginTop: '24px' }}>
                   <div className="target-summary-header" style={{ marginBottom: '20px' }}>Target Comparison Analysis ({selectedModule})</div>
                   <div style={{ height: '300px', width: '100%' }}>
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart
                         data={[
                           { name: 'Attendance', actual: currentWeek.att, target: activeAtt },
                           { name: 'Quiz Score', actual: currentWeek.quiz, target: activeQuiz }
                         ]}
                         margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                       >
                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
                         <XAxis dataKey="name" />
                         <YAxis unit="%" domain={[0, 100]} />
                         <Tooltip cursor={{fill: '#f1f5f9'}} />
                         <Legend />
                         <Bar dataKey="actual" name="Actual Achievement" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={50} />
                         <Bar dataKey="target" name="Set Target" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={50} />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                </div>
             </div>
          </div>

          <motion.div 
            className="overview-card" style={{ marginBottom: '24px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="overview-card-header">🚀 AI Weekly Logic Trace Analysis ({selectedModule || 'Loading...'})</h3>
            
            {!error && weeklyHistory.length > 0 && (
              <div style={{ height: '400px', width: '100%', marginBottom: '40px', background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[...weeklyHistory].sort((a,b) => a.week - b.week)}>
                    <defs>
                      <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorQuiz" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="week" label={{ value: 'Week', position: 'insideBottom', offset: -5 }} />
                    <YAxis unit="%" domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" height={36} />
                    
                    {/* Visual Threshold Target Lines */}
                    <ReferenceLine y={activeAtt} label={{ position: 'right', value: 'Att Target', fill: '#4f46e5', fontSize: 10, fontWeight: 700 }} stroke="#4f46e5" strokeDasharray="3 3" />
                    <ReferenceLine y={activeQuiz} label={{ position: 'left', value: 'Quiz Target', fill: '#10b981', fontSize: 10, fontWeight: 700 }} stroke="#10b981" strokeDasharray="3 3" />

                    <Area type="monotone" dataKey="attendance.actual" name="Attendance Achievement" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                    <Area type="monotone" dataKey="quiz.actual" name="Quiz Mastery" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorQuiz)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="performance-track-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
               {error && (
                <div style={{ padding: '30px', textAlign: 'center', background: '#fff1f2', borderRadius: '12px', border: '1px solid #fda4af' }}>
                   <IconAlertTriangle size={32} color="#e11d48" style={{ marginBottom: '10px' }} />
                   <div style={{ fontWeight: 'bold', color: '#9f1239' }}>Unable to load performance history</div>
                   <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#be123c' }}>{error}</p>
                   <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button onClick={fetchAnalytics} style={{ padding: '8px 16px', background: '#e11d48', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
                    <button onClick={loadDemoData} style={{ padding: '8px 16px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Try Demo Mode 🔬</button>
                   </div>
                </div>
              )}

              {!error && weeklyHistory.map((week, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="track-row" 
                  style={{ 
                    padding: '20px', 
                    borderRadius: '16px', 
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '18px' }}>Week {week.week}</span>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      background: (week.attendance.actual >= week.attendance.target && week.quiz.actual >= week.quiz.target) ? '#dcfce7' : '#fee2e2',
                      color: (week.attendance.actual >= week.attendance.target && week.quiz.actual >= week.quiz.target) ? '#15803d' : '#991b1b'
                    }}>
                      {(week.attendance.actual >= week.attendance.target && week.quiz.actual >= week.quiz.target) ? 'TARGETS MET' : 'FOCUS NEEDED'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Attendance Comparison */}
                    <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Attendance</div>
                        {week.attendance.actual >= week.attendance.target && <IconCheck size={14} color="#10b981" />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ fontSize: '22px', fontWeight: 'bold', color: week.attendance.actual >= week.attendance.target ? '#4f46e5' : '#f59e0b' }}>
                          {week.attendance.actual.toFixed(0)}%
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>/ target {week.attendance.target}%</span>
                      </div>
                    </div>

                    {/* Quiz Comparison */}
                    <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                         <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Quiz Score</div>
                         {week.quiz.actual >= week.quiz.target && <IconCheck size={14} color="#10b981" />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ fontSize: '22px', fontWeight: 'bold', color: week.quiz.actual >= week.quiz.target ? '#10b981' : '#f59e0b' }}>
                          {week.quiz.actual.toFixed(0)}%
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>/ target {week.quiz.target}%</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestion */}
                  <div className="ai-insight-card" style={{ 
                    padding: '16px', 
                    background: '#eff6ff', 
                    borderRadius: '10px', 
                    borderLeft: `4px solid ${week.aiInsight?.type === 'WARNING' ? '#ef4444' : week.aiInsight?.type === 'ACTION' ? '#f59e0b' : '#3b82f6'}`,
                    fontSize: '13px',
                    color: '#1e40af',
                    lineHeight: '1.6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {getAiIndicator(week.aiInsight?.type)}
                      AI Weekly Logic Trace Analysis
                    </div>
                    
                    {week.aiInsight?.weeklyAnalysis ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ opacity: 0.9 }}><strong>Issue:</strong> {week.aiInsight.weeklyAnalysis.problem}</div>
                        <div style={{ opacity: 0.8, fontSize: '12px', background: 'rgba(255,255,255,0.4)', padding: '8px', borderRadius: '6px' }}>
                          <strong>Reason:</strong> {week.aiInsight.weeklyAnalysis.reason}
                        </div>
                        <div style={{ color: '#10b981', fontWeight: '700' }}>
                          <strong>AI Suggestion:</strong> {week.aiInsight.weeklyAnalysis.suggestion}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ fontStyle: 'italic', opacity: 0.8 }}>{week.aiInsight?.text || "Detailed pattern analysis missing for this week."}</span>
                        {Number(week.week) === currentWeekNum && (
                          <button 
                            onClick={() => handleDeployAiTrace(week.week, idx)}
                            disabled={isDeploying[idx]}
                            className="deploy-btn"
                            style={{
                              width: 'fit-content',
                              padding: '10px 20px',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                            }}
                          >
                            <IconBrain size={16} />
                            {isDeploying[idx] ? "Synthesizing Logic Trace..." : "🚀 Deploy Weekly Logic Trace"}
                          </button>
                        )}
                      </div>
                    )}
                    <div className="ai-glow"></div>
                  </div>
                </motion.div>
              ))}
              {!error && weeklyHistory.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                   <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No historical performance records found for your account.</p>
                </div>
              )}
            </div>
          </motion.div>

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