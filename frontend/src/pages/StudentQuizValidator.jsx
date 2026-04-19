import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IconCheck, 
  IconChevronDown, 
  IconBulb, 
  IconArrowRight, 
  IconListNumbers, 
  IconClock, 
  IconTrophy, 
  IconRotateClockwise,
  IconArrowLeft,
  IconCalendar,
  IconBrain,
  IconX
} from '@tabler/icons-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { API_ENDPOINTS, BASE_URL } from '../api';
import './QuizValidator.css';

function StudentQuizValidator() {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pastAttempts, setPastAttempts] = useState([]);
  const [justifications, setJustifications] = useState({});
  const [isJustifying, setIsJustifying] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});

  const modules = ['Programming Applications', 'Database Systems', 'Operating Systems', 'Software Engineering'];

  const [selectedWeek, setSelectedWeek] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    if (selectedModule) {
      fetchQuizzes();
      fetchPastAttempts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, selectedYear, selectedWeek]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const url = `${API_ENDPOINTS.QUIZZES}?module=${selectedModule}&academicYear=${selectedYear}&week=${selectedWeek}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastAttempts = async () => {
    try {
      const url = `${API_ENDPOINTS.QUIZZES}/attempts/history?module=${selectedModule}&academicYear=${selectedYear}&week=${selectedWeek}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPastAttempts(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchJustification = async (qIdx, qText, correctOptText) => {
    setIsJustifying({ ...isJustifying, [qIdx]: true });
    try {
      const response = await fetch(`${BASE_URL}/analytics/justify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ questionText: qText, correctAnswer: correctOptText })
      });
      const data = await response.json();
      setJustifications({ ...justifications, [qIdx]: data.explanation });
    } catch (err) {
      console.error(err);
    } finally {
      setIsJustifying({ ...isJustifying, [qIdx]: false });
    }
  };

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setResult(null);
    setCurrentAnswers({});
  };

  const viewJustification = async (attempt) => {
    if (!attempt.quiz || !attempt.quiz._id) return;
    try {
      const response = await fetch(`${API_ENDPOINTS.QUIZZES}/${attempt.quiz._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const fullQuiz = await response.json();
        setActiveQuiz(fullQuiz);
        setResult(attempt);
        const dummyAnswers = {};
        const reveals = {};
        fullQuiz.questions.forEach((q, qIdx) => {
          reveals[qIdx] = true;
          const res = attempt.questionResults && attempt.questionResults.find(qr => qr.questionText === q.text);
          if (res && res.isCorrect) {
            dummyAnswers[qIdx] = q.options.findIndex(o => o.isCorrect);
          } else {
            // Find what student might have picked or default to a wrong one
            dummyAnswers[qIdx] = q.options.findIndex(o => !o.isCorrect);
            if (dummyAnswers[qIdx] === -1) dummyAnswers[qIdx] = 0;
          }
        });
        setCurrentAnswers(dummyAnswers);
        setRevealedAnswers(reveals);
        window.scrollTo(0, 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOptionSelect = (qIdx, oIdx) => {
    setCurrentAnswers({
      ...currentAnswers,
      [qIdx]: oIdx
    });
  };

  const handleSubmit = async () => {
    if (Object.keys(currentAnswers).length < activeQuiz.questions.length) {
      if (!window.confirm("You haven't answered all questions. Submit anyway?")) return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.QUIZZES}/${activeQuiz._id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          answers: activeQuiz.questions.map((_, i) => ({
            questionIndex: i,
            selectedOptionIndex: currentAnswers[i] !== undefined ? currentAnswers[i] : -1
          })),
          week: activeQuiz.week || 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToQuizzes = () => {
    setActiveQuiz(null);
    setResult(null);
    setCurrentAnswers({});
  };

  if (activeQuiz) {
    if (result) {
      return (
        <motion.div 
          className="quiz-validator-page"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="page-header">
            <h1>Quiz Results</h1>
            <p>Well done on completing the quiz for {activeQuiz.module}!</p>
          </div>
          
          <div className="quiz-main-card">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '40px', borderBottom: '1px solid #f1f5f9' }}>
               <div style={{ width: '240px', height: '200px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      innerRadius="80%" 
                      outerRadius="100%" 
                      data={[{ value: result.score, fill: result.score >= 70 ? '#10b981' : result.score >= 40 ? '#f59e0b' : '#ef4444' }]} 
                      startAngle={225} 
                      endAngle={-45}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar background dataKey="value" cornerRadius={30} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b' }}>{result.score}%</div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Your Grade</div>
                  </div>
               </div>
               
               <div style={{ display: 'flex', gap: '40px', marginTop: '10px' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{result.correctCount || 0} / {result.totalQuestions || activeQuiz.questions.length}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Correct Answers</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{Math.round(result.score / 10)} / 10</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Mastery Grade</div>
                  </div>
               </div>
            </div>

            <div style={{ width: '100%', maxWidth: '800px', margin: '40px auto 0' }}>
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <IconListNumbers size={20} color="var(--primary)" /> Detailed Question Review
              </h3>
              {activeQuiz.questions.map((q, qIdx) => {
                const userChoice = currentAnswers[qIdx];
                const isCorrect = q.options[userChoice]?.isCorrect;
                const isRevealed = revealedAnswers[qIdx];

                return (
                  <motion.div 
                    key={qIdx} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * qIdx }}
                    style={{ marginBottom: '24px', padding: '24px', borderRadius: '16px', backgroundColor: '#f8fafc', border: `1px solid ${isRevealed ? (isCorrect ? '#dcfce7' : '#fee2e2') : '#e2e8f0'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: '#64748b' }}>QUESTION {qIdx + 1}</span>
                      {isRevealed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isCorrect ? '#059669' : '#dc2626', background: isCorrect ? '#dcfce7' : '#fee2e2', padding: '4px 12px', borderRadius: '20px', fontWeight: '800', fontSize: '11px' }}>
                          {isCorrect ? <IconCheck size={14}/> : <IconX size={14}/>} {isCorrect ? 'CORRECT' : 'INCORRECT'}
                        </div>
                      )}
                    </div>
                    <p style={{ margin: '12px 0', fontWeight: '600', fontSize: '16px', color: '#1e293b' }}>{q.text}</p>
                    <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ padding: '12px', borderRadius: '8px', background: isRevealed ? (isCorrect ? '#f0fdf4' : '#fef2f2') : '#f1f5f9', border: `1px solid ${isRevealed ? (isCorrect ? '#bbf7d0' : '#fecaca') : '#cbd5e1'}` }}>
                        <span style={{ fontWeight: '600' }}>Your Answer:</span> {q.options[userChoice]?.text || <span style={{ fontStyle: 'italic' }}>No Answer Provided</span>}
                      </div>
                      
                      {isRevealed ? (
                        <>
                          {!isCorrect && (
                            <div style={{ padding: '12px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                              <span style={{ fontWeight: '600', color: '#15803d' }}>Correct Answer:</span> {q.options.find(o => o.isCorrect)?.text}
                            </div>
                          )}
                          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0' }}>
                            <button 
                              onClick={() => fetchJustification(qIdx, q.text, q.options.find(o => o.isCorrect)?.text)}
                              disabled={isJustifying[qIdx]}
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: 0 }}
                            >
                              <IconBrain size={16} /> {isJustifying[qIdx] ? 'AI is analyzing...' : (justifications[qIdx] ? 'Regenerate AI Logic' : 'Why is this correct? (AI Logic)')}
                            </button>
                            <AnimatePresence>
                              {justifications[qIdx] && (
                                <motion.div 
                                   initial={{ opacity: 0, height: 0 }}
                                   animate={{ opacity: 1, height: 'auto' }}
                                   style={{ marginTop: '12px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '12px', fontSize: '13px', color: '#1e40af', lineHeight: '1.6', borderLeft: '4px solid #3b82f6' }}
                                >
                                  <div style={{ fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>AI Intelligence Report</div>
                                  {justifications[qIdx]}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </>
                      ) : (
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                          <button 
                            onClick={() => setRevealedAnswers({ ...revealedAnswers, [qIdx]: true })}
                            style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Reveal Answer & AI Logic
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '40px', justifyContent: 'center' }}>
              <button 
                onClick={backToQuizzes}
                style={{ padding: '14px 28px', borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                Back to Portal
              </button>
              <button 
                onClick={() => navigate('/analytics')}
                style={{ padding: '14px 28px', borderRadius: '12px', border: 'none', backgroundColor: '#4f46e5', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)', transition: '0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                View Analytics & Goals
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        className="quiz-validator-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>{activeQuiz.title}</h1>
            <p>{activeQuiz.module} • {activeQuiz.questionCount} Questions</p>
          </div>
          <button onClick={backToQuizzes} style={{ background: 'none', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600' }}>Exit Quiz</button>
        </div>

        <div className="quiz-main-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {activeQuiz.questions.map((q, qIdx) => (
              <motion.div 
                key={qIdx} 
                className="question-block" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * qIdx }}
                style={{ borderBottom: qIdx === activeQuiz.questions.length - 1 ? 'none' : '1px solid var(--border-color)', paddingBottom: '32px' }}
              >
                <h3 className="question-number">Question {qIdx + 1}</h3>
                <p className="question-text" style={{ fontSize: '16px', fontWeight: '500' }}>{q.text}</p>
                
                <div className="options-container">
                  {q.options.map((opt, oIdx) => (
                    <motion.div 
                      key={oIdx} 
                      className={`option-row ${currentAnswers[qIdx] === oIdx ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(qIdx, oIdx)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      style={currentAnswers[qIdx] === oIdx ? { backgroundColor: '#eef2ff', borderColor: '#6366f1', borderWidth: '2px' } : {}}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + oIdx)})</span>
                      <span className="option-text">{opt.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: '40px', padding: '32px', borderTop: '2px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
            <button 
              className="submit-btn" 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              style={{ width: '300px', height: '56px', fontSize: '16px', fontWeight: '700', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' }}
            >
              {isSubmitting ? 'Submitting...' : 'Finish and Submit'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="quiz-validator-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <h1>Student Quiz Portal</h1>
        <p>Challenge yourself with module-specific quizzes to test your knowledge.</p>
      </div>

      <div className="quiz-main-card">
        <div className="topic-selector-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '16px 24px', backgroundColor: '#fcfdfe', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="selector-label" style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>Module</span>
            <select 
              className="dropdown" 
              style={{ width: '220px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              value={selectedModule} 
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              <option value="">Select Module</option>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="selector-label" style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>Academic Year</span>
            <select 
              className="dropdown" 
              style={{ width: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="All">All Years</option>
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="selector-label" style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>Academic Week</span>
            <select 
              className="dropdown" 
              style={{ width: '120px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              value={selectedWeek} 
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              <option value="All">All Weeks</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
          </div>
        </div>

        {!selectedModule ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            <IconListNumbers size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>Please select a module to view available quizzes.</p>
          </div>
        ) : loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No quizzes available for this module yet. Check back later!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginTop: '16px' }}>
            {quizzes.map((quiz, idx) => {
              const isPastDeadline = quiz.deadline && new Date() > new Date(quiz.deadline);
              const isCurrentWeek = quiz.week === 8; // Restrict to Week 8 as per requirement
              const isLocked = isPastDeadline || !isCurrentWeek;

              return (
                <motion.div 
                  key={quiz._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  style={{ backgroundColor: isLocked ? '#f1f5f9' : 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', transition: '0.2s', cursor: isLocked ? 'default' : 'pointer', opacity: isLocked ? 0.7 : 1 }} 
                  onClick={() => !isLocked && startQuiz(quiz)} 
                  whileHover={!isLocked ? { translateY: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.05)' } : {}}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', backgroundColor: isLocked ? '#e2e8f0' : '#eef2ff', color: isLocked ? '#64748b' : 'var(--primary)', textTransform: 'uppercase' }}>
                      {isPastDeadline ? 'DEADLINE PASSED' : !isCurrentWeek ? 'LOCKED' : 'AVAILABLE'}
                    </span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}><IconClock size={14} /> 15 mins</div>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{quiz.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{quiz.module}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconCalendar size={14} /> Week {quiz.week} • {quiz.academicYear} • {quiz.questionCount} Qs
                  </p>
                  {quiz.deadline && (
                    <p style={{ fontSize: '11px', color: isPastDeadline ? '#ef4444' : '#64748b', fontWeight: '600', marginBottom: '20px' }}>
                      Deadline: {new Date(quiz.deadline).toLocaleDateString()}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button disabled={isLocked} style={{ background: 'none', border: 'none', color: isLocked ? '#94a3b8' : 'var(--primary)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', cursor: isLocked ? 'default' : 'pointer' }}>
                      {isLocked ? 'Cannot Attempt' : 'Attempt Now'} <IconArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Performed Quizzes Log Section */}
        {selectedModule && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: '48px', borderTop: '1px solid #eee', paddingTop: '32px' }}
          >
             <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <IconRotateClockwise size={20} color="var(--primary)" /> Performed Quizzes (History)
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pastAttempts.map((attempt, idx) => (
                  <motion.div 
                    key={attempt._id || idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                       <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: attempt.score >= 70 ? '#dcfce7' : attempt.score >= 40 ? '#fff7ed' : '#fee2e2', color: attempt.score >= 70 ? '#059669' : attempt.score >= 40 ? '#c2410b' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px' }}>
                         {attempt.score}%
                       </div>
                       <div>
                         <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{attempt.quiz?.title || attempt.title || 'Quiz Attempt'}</div>
                         <div style={{ fontSize: '11px', color: '#64748b' }}>Attempted on {new Date(attempt.date || attempt.createdAt).toLocaleDateString()} • Week {attempt.week}</div>
                       </div>
                    </div>
                    <button onClick={() => viewJustification(attempt)} style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}>View Logic Trace</button>
                  </motion.div>
                ))}
                {pastAttempts.length === 0 && <div style={{ fontSize: '13px', color: '#64748b', padding: '20px', textAlign: 'center' }}>No past quiz attempts found for this module.</div>}
             </div>
          </motion.div>
        )}
      </div>

      {/* Decorative Mascot Box from original layout */}
      <motion.div 
        className="feedback-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="chat-bubble">
          <div className="bulb-wrapper"><IconBulb size={18} className="bulb-icon-yellow" /></div>
          <p><strong>Did you know?</strong> Frequent quizzing helps reinforce what you've learned. It's one of the best ways to prepare for finals!</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default StudentQuizValidator;
