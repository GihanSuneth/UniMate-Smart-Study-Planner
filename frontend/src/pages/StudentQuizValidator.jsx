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
  IconX
} from '@tabler/icons-react';
import { API_ENDPOINTS } from '../api';
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

  const modules = ['Programming Applications', 'Database Systems', 'Operating Systems', 'Software Engineering'];

  useEffect(() => {
    if (selectedModule) {
      fetchQuizzes();
    }
  }, [selectedModule]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.QUIZZES}?module=${selectedModule}`, {
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

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setResult(null);
    setCurrentAnswers({});
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
        <div className="quiz-validator-page">
          <div className="page-header">
            <h1>Quiz Results</h1>
            <p>Well done on completing the quiz for {activeQuiz.module}!</p>
          </div>

          <div className="quiz-main-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ position: 'relative', marginBottom: '32px' }}>
              <div style={{ width: '160px', height: '160px', borderRadius: '50%', border: '8px solid #eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
                <span style={{ fontSize: '42px', fontWeight: '800', color: 'var(--primary)' }}>{result.score}%</span>
              </div>
              <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', backgroundColor: '#ffd700', padding: '10px', borderRadius: '50%', color: 'white', boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)' }}>
                <IconTrophy size={24} />
              </div>
            </div>

            <h2 style={{ fontSize: '28px', color: 'var(--text-dark)', marginBottom: '12px' }}>Excellent Effort!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '500px' }}>
              You got <strong>{result.correctAnswers} out of {result.totalQuestions}</strong> questions correct. 
              This data has been sent to your analytics page to help track your progress.
            </p>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={backToQuizzes}
                style={{ padding: '14px 28px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'white', color: 'var(--text-dark)', fontWeight: '600', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <IconArrowLeft size={20} /> Back to Quizzes
              </button>
              <button 
                onClick={() => { setActiveQuiz(activeQuiz); setResult(null); setCurrentAnswers({}); }}
                style={{ padding: '14px 28px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <IconRotateClockwise size={20} /> Try Again
              </button>
              <button 
                onClick={() => navigate('/analytics')}
                style={{ padding: '14px 28px', borderRadius: '12px', border: 'none', backgroundColor: '#01b574', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 12px rgba(1, 181, 116, 0.2)' }}
              >
                View Analytics <IconArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="quiz-validator-page">
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
              <div key={qIdx} className="question-block" style={{ borderBottom: qIdx === activeQuiz.questions.length - 1 ? 'none' : '1px solid var(--border-color)', paddingBottom: '32px' }}>
                <h3 className="question-number">Question {qIdx + 1}</h3>
                <p className="question-text" style={{ fontSize: '16px', fontWeight: '500' }}>{q.text}</p>
                
                <div className="options-container">
                  {q.options.map((opt, oIdx) => (
                    <div 
                      key={oIdx} 
                      className={`option-row ${currentAnswers[qIdx] === oIdx ? 'selected-correct' : ''}`}
                      onClick={() => handleOptionSelect(qIdx, oIdx)}
                      style={currentAnswers[qIdx] === oIdx ? { backgroundColor: '#eef2ff', borderColor: '#ccd6ff' } : {}}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + oIdx)})</span>
                      <span className="option-text">{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>
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
      </div>
    );
  }

  return (
    <div className="quiz-validator-page">
      <div className="page-header">
        <h1>Student Quiz Portal</h1>
        <p>Challenge yourself with module-specific quizzes to test your knowledge.</p>
      </div>

      <div className="quiz-main-card">
        <div className="topic-selector-row">
          <span className="selector-label">Pick a Module to Start</span>
          <select 
            className="dropdown" 
            value={selectedModule} 
            onChange={(e) => setSelectedModule(e.target.value)}
          >
            <option value="">Select Module</option>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
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
            {quizzes.map(quiz => (
              <div key={quiz._id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', transition: 'transform 0.2s', cursor: 'pointer' }} onClick={() => startQuiz(quiz)} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#eef2ff', color: 'var(--primary)', textTransform: 'uppercase' }}>Available</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}><IconClock size={14} /> 15 mins</div>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{quiz.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{quiz.module}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconCalendar size={14} /> Week {quiz.week} • {quiz.academicYear} • {quiz.questionCount} Qs
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    Attempt Now <IconArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="feedback-col">
        <div className="chat-bubble">
          <div className="bulb-wrapper"><IconBulb size={18} className="bulb-icon-yellow" /></div>
          <p><strong>Did you know?</strong> Frequent quizzing helps reinforce what you've learned. It's one of the best ways to prepare for finals!</p>
        </div>
      </div>
    </div>
  );
}

export default StudentQuizValidator;
