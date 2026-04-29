import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconClock,
  IconCheckbox,
  IconAlertTriangle,
  IconRotateClockwise,
  IconGraph,
  IconListNumbers,
  IconBulb,
  IconBrain,
  IconX
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { API_ENDPOINTS, BASE_URL } from '../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [explanations, setExplanations] = useState({});
  const [isExplaining, setIsExplaining] = useState(null);
  const [isExplainingAll, setIsExplainingAll] = useState(false);

  const modules = ['Network Design and Modeling', 'Database Systems', 'Operating Systems', 'Data Structures and Algorithms', 'Data Science and Analytics'];
  const [selectedWeek, setSelectedWeek] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    if (selectedModule) {
      fetchQuizzes();
      fetchPastAttempts();
    }
  }, [selectedModule, selectedYear, selectedWeek]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const url = `${API_ENDPOINTS.QUIZZES}?module=${selectedModule}&academicYear=${selectedYear}&week=${selectedWeek}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPastAttempts(data);
      }
    } catch (err) {
      console.error(err);
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
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const fullQuiz = await response.json();
        setActiveQuiz(fullQuiz);
        setResult(attempt);
        const dummyAnswers = {};
        fullQuiz.questions.forEach((q, qIdx) => {
          const res = attempt.questionResults && attempt.questionResults.find((qr) => qr.questionText === q.text);
          if (res) {
            const matchedOptIdx = q.options.findIndex((o) => o.text === res.selectedText);
            dummyAnswers[qIdx] = matchedOptIdx !== -1 ? matchedOptIdx : 0;
          } else {
            dummyAnswers[qIdx] = 0;
          }
        });
        setCurrentAnswers(dummyAnswers);
        window.scrollTo(0, 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOptionSelect = (qIdx, oIdx) => {
    setCurrentAnswers({ ...currentAnswers, [qIdx]: oIdx });
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
          Authorization: `Bearer ${localStorage.getItem('token')}`
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
    setExplanations({});
  };

  const handleGetExplanation = async (qIdx) => {
    const q = activeQuiz.questions[qIdx];
    const userChoiceIdx = currentAnswers[qIdx];
    const userChoice = q.options[userChoiceIdx]?.text || 'No Answer';
    const correctChoice = q.options.find((o) => o.isCorrect)?.text || 'N/A';
    setIsExplaining(qIdx);
    try {
      const response = await fetch(`${API_ENDPOINTS.ANALYTICS}/justify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          questionText: q.text,
          selectedAnswer: userChoice,
          correctAnswer: correctChoice
        })
      });
      if (response.ok) {
        const data = await response.json();
        setExplanations((prev) => ({ ...prev, [qIdx]: data.explanation }));
      } else if (response.status === 429) {
        toast.warning('Gemini AI Quota Exceeded. Please wait 60 seconds before retrying.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExplaining(null);
    }
  };

  const handleExplainAll = async () => {
    if (!activeQuiz || !activeQuiz.questions) return;
    setIsExplainingAll(true);
    try {
      const batchData = activeQuiz.questions.map((q, i) => {
        const userChoiceIdx = currentAnswers[i];
        return {
          questionText: q.text,
          selectedAnswer: q.options[userChoiceIdx]?.text || 'No Answer',
          correctAnswer: q.options.find((o) => o.isCorrect)?.text || 'N/A'
        };
      });

      const response = await fetch(`${API_ENDPOINTS.ANALYTICS}/justify-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ questions: batchData })
      });

      if (response.ok) {
        const data = await response.json();
        const newExplanations = {};
        data.explanations.forEach((exp, idx) => {
          newExplanations[idx] = exp;
        });
        setExplanations(newExplanations);
        toast.success('Master AI Briefing complete!');
      } else if (response.status === 429) {
        toast.warning('Gemini AI Quota Exceeded. Try again in 60s.');
      }
    } catch (error) {
      console.error('Error fetching batch briefing:', error);
      toast.error('Failed to generate master briefing.');
    } finally {
      setIsExplainingAll(false);
    }
  };

  if (!activeQuiz) {
    return (
      <motion.div className="quiz-validator-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="page-header">
          <h1>Student Quiz Portal</h1>
          <p>Challenge yourself with module-specific quizzes to test your knowledge.</p>
        </div>
        <div className="quiz-main-card">
          <div className="topic-selector-row" style={{ display: 'flex', gap: '20px', padding: '16px 24px', backgroundColor: '#fcfdfe', borderBottom: '1px solid #eee' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Module</span>
              <select className="dropdown" style={{ width: '220px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
                <option value="">Select Module</option>
                {modules.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Year</span>
              <select className="dropdown" style={{ width: '120px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="All">All Years</option>
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
              </select>
            </div>
          </div>
          <div className="quiz-list-container" style={{ padding: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                Active Weekly Quizzes (Week 5)
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {quizzes.filter((q) => q.week === 5).length > 0 ? (
                quizzes.filter((q) => q.week === 5).map((quiz) => (
                  <div key={quiz._id} className="quiz-card" style={{ padding: '24px', border: '1px solid #6366f1', borderRadius: '16px', background: '#f5f3ff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#6366f1' }}>{quiz.module}</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '4px' }}>WEEK 5</span>
                    </div>
                    <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>{quiz.title}</h3>
                    <button onClick={() => startQuiz(quiz)} className="start-quiz-btn" style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700' }}>Start Quiz Now</button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', border: '1.5px dashed #e2e8f0', borderRadius: '16px', gridColumn: '1 / -1' }}>
                  No active quizzes released for Week 5 yet.
                </div>
              )}
            </div>

            {quizzes.filter((q) => q.week < 5).length > 0 && (
              <div style={{ marginTop: '48px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#64748b', marginBottom: '16px' }}>Academic Archive (Expired Quizzes)</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {quizzes.filter((q) => q.week < 5).map((quiz) => (
                    <div key={quiz._id} className="quiz-card" style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', opacity: 0.7, background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8' }}>WEEK {quiz.week}</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#ef4444' }}>EXPIRED</span>
                      </div>
                      <h4 style={{ marginBottom: '12px', fontSize: '15px', color: '#475569' }}>{quiz.title}</h4>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>This quiz was available until Sunday. Check History for results.</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '0 32px 32px', borderTop: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: '32px 0 20px' }}>Performed Quizzes (History)</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {pastAttempts.map((attempt) => (
                <div key={attempt._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: '700' }}>{attempt.quiz?.title || 'Quiz'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Score: {attempt.score}% • Week: {attempt.week}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {new Date(attempt.createdAt || attempt.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  <button onClick={() => viewJustification(attempt)} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: '#6366f1' }}>Review Quiz Results</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (result) {
    const score = typeof result.score === 'number' ? result.score : 0;
    const correct = result.correctCount || result.correctAnswers || 0;
    const total = result.totalQuestions || activeQuiz?.questions?.length || 0;

    return (
      <motion.div className="quiz-validator-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="page-header"><h1>Quiz Results</h1><p>Module: {activeQuiz?.module}</p></div>
        <div className="quiz-main-card" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '48px', fontWeight: '800' }}>{score}%</div>
              <div style={{ fontWeight: '700', color: '#64748b' }}>{correct} / {total} Correct</div>
            </div>

            <button
              onClick={handleExplainAll}
              disabled={isExplainingAll || Object.keys(explanations).length === activeQuiz.questions.length}
              style={{ padding: '12px 32px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)', cursor: 'pointer' }}
            >
              <IconBrain size={20} />
              {isExplainingAll ? 'Synthesizing Briefings...' : 'Master AI Briefing (One-Tap All)'}
            </button>
          </div>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {(activeQuiz?.questions || []).map((q, i) => (
              <div key={i} style={{ marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontWeight: '700', marginBottom: '12px' }}>{q.text}</p>
                <div style={{ fontSize: '14px', marginBottom: '8px' }}>Your Answer: {q.options[currentAnswers[i]]?.text || 'None'}</div>
                <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>Correct Answer: {q.options.find((o) => o.isCorrect)?.text}</div>
                {explanations[i] && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#eef2ff', borderRadius: '8px', fontSize: '13px', borderLeft: '4px solid #6366f1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#6366f1', fontWeight: '700', fontSize: '11px' }}>
                      <IconBrain size={14} /> AI BRIEFING
                    </div>
                    {explanations[i]}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button onClick={backToQuizzes} style={{ padding: '12px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700' }}>Back to Portal</button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="quiz-validator-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div><h1>{activeQuiz?.title}</h1><p>Week {activeQuiz?.week} • {activeQuiz?.questionCount} Questions</p></div>
        <button onClick={backToQuizzes} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px' }}>Exit</button>
      </div>
      <div className="quiz-main-card" style={{ padding: '40px' }}>
        {(activeQuiz?.questions || []).map((q, i) => (
          <div key={i} style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '12px' }}>Question {i + 1}</h3>
            <p style={{ marginBottom: '16px' }}>{q?.text || 'Loading question...'}</p>
            <div style={{ display: 'grid', gap: '10px' }}>
              {(q?.options || []).map((opt, oi) => (
                <div
                  key={oi}
                  onClick={() => handleOptionSelect(i, oi)}
                  style={{ padding: '16px', border: '1.5px solid', borderColor: currentAnswers[i] === oi ? '#4f46e5' : '#e2e8f0', borderRadius: '10px', cursor: 'pointer', backgroundColor: currentAnswers[i] === oi ? '#f5f3ff' : 'white' }}
                >
                  {opt?.text || 'Option'}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '16px 40px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800' }}>
            {isSubmitting ? 'Submitting...' : 'Finish and Submit'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default StudentQuizValidator;
