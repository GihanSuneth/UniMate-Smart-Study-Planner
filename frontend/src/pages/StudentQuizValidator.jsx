import React, { useState, useEffect } from 'react';
import { IconCheck, IconChevronDown, IconBulb, IconArrowRight, IconX } from '@tabler/icons-react';
import './QuizValidator.css';

function StudentQuizValidator() {
  const [quizzes, setQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('published_quizzes')) || [];
      if (stored.length > 0) {
        setQuizzes(stored);
      } else {
        // Fallback default quiz just in case
        setQuizzes([{
          topic: 'Database Normalization',
          text: 'A university has a Students table that includes columns for student ID, name, course, professorName, and department. Over time, the database starts to have redundant data. Which of the following describes this problem?',
          options: [
            { letter: 'A', text: 'The table is in 1NF', isCorrect: false },
            { letter: 'B', text: 'The table is in 2NF', isCorrect: false },
            { letter: 'C', text: 'The table is not normalized and there are data anomalies', isCorrect: true },
            { letter: 'D', text: 'The table is already in 3NF', isCorrect: false },
          ]
        }]);
      }
    } catch (e) {
      console.error("Failed to load quizzes", e);
    }
  }, []);

  const handleSelectOption = (idx) => {
    if (!isSubmitted) {
      setSelectedOption(idx);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setIsSubmitted(true);
    } else {
      alert("Please select an answer first.");
    }
  };

  const currentQuiz = quizzes[currentIndex];
  const isCorrect = isSubmitted && currentQuiz?.options[selectedOption]?.isCorrect;

  return (
    <div className="quiz-validator-page">
      <div className="page-header">
        <h1>Student Quiz Validator</h1>
        <p>Practice scenario-based questions to test your understanding of specific topics.</p>
      </div>

      <div className="quiz-main-card">
        <div className="topic-selector-row">
          <span className="selector-label">Select Active Quiz</span>
          <select 
             style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', minWidth: '250px', backgroundColor: 'var(--bg-secondary)', fontWeight: '600', color: 'var(--text-dark)' }}
             value={currentIndex}
             onChange={(e) => {
               setCurrentIndex(Number(e.target.value));
               setIsSubmitted(false);
               setSelectedOption(null);
             }}
          >
            {quizzes.map((q, idx) => (
              <option key={idx} value={idx}>Quiz {idx + 1} - {q.topic || 'General Topic'}</option>
            ))}
          </select>
        </div>

        {currentQuiz ? (
          <div className="quiz-grid-inner">
            {/* Left Column: Question */}
            <div className="question-col">
              <h3 className="question-number">Question {currentIndex + 1}</h3>
              <hr className="divider" />
              <p className="question-text">
                {currentQuiz.text}
              </p>

              <div className="options-container">
                {currentQuiz.options.map((opt, idx) => {
                  let rowClass = "option-row";
                  if (selectedOption === idx) {
                    if (isSubmitted) {
                      rowClass += opt.isCorrect ? " selected-correct" : " selected-incorrect";
                    } else {
                      rowClass += " selected";
                    }
                  }

                  let bgColor = '';
                  let borderColor = '';
                  
                  if (selectedOption === idx && !isSubmitted) {
                    bgColor = '#e6f0ff';
                    borderColor = '1px solid #266df1';
                  } else if (isSubmitted) {
                    if (opt.isCorrect) {
                      bgColor = '#e6f8f1';
                      borderColor = '1px solid #01b574';
                    } else if (selectedOption === idx) {
                      bgColor = '#ffe6e6';
                      borderColor = '1px solid #ff4d4f';
                    }
                  }

                  return (
                    <div 
                      key={idx} 
                      className={rowClass} 
                      onClick={() => handleSelectOption(idx)}
                      style={{
                        cursor: isSubmitted ? 'default' : 'pointer',
                        backgroundColor: bgColor || 'var(--bg-main)',
                        border: borderColor || '1px solid var(--border-color)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '10px'
                      }}
                    >
                      {isSubmitted && opt.isCorrect && <IconCheck size={18} color="#01b574" style={{ marginRight: '8px' }} />}
                      {isSubmitted && !opt.isCorrect && selectedOption === idx && <IconX size={18} color="#ff4d4f" style={{ marginRight: '8px' }} />}
                      
                      {(!isSubmitted || (!opt.isCorrect && selectedOption !== idx)) && (
                        <span className="option-letter" style={{ color: (selectedOption === idx) ? '#266df1' : 'var(--text-secondary)', fontWeight: '600', marginRight: '8px', minWidth: '24px' }}>
                          {opt.letter || String.fromCharCode(65+idx)})
                        </span>
                      )}
                      
                      <span className="option-text" style={{ color: (selectedOption === idx && !isSubmitted) ? '#266df1' : 'var(--text-dark)', fontWeight: (selectedOption === idx) ? '600' : '400' }}>
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {!isSubmitted ? (
                <button className="submit-btn" onClick={handleSubmit} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '20px' }}>
                  Submit Answer
                </button>
              ) : (
                <button className="submit-btn" onClick={() => {
                  if (currentIndex < quizzes.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    setSelectedOption(null);
                    setIsSubmitted(false);
                  } else {
                    alert('You have reached the end of the available quizzes!');
                  }
                }} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: 'var(--text-dark)', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '20px' }}>
                  {currentIndex < quizzes.length - 1 ? 'Next Question' : 'Finish Practice'}
                </button>
              )}
            </div>

            {/* Right Column: Feedback and Mascot */}
            <div className="feedback-col">
              {isSubmitted && (
                <div className="chat-bubble" style={{ backgroundColor: isCorrect ? '#e6f8f1' : '#ffe6e6', color: isCorrect ? '#01b574' : '#ff4d4f', border: `1px solid ${isCorrect ? '#01b574' : '#ff4d4f'}`, padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div className="bulb-wrapper" style={{ backgroundColor: isCorrect ? '#01b574' : '#ff4d4f', color: 'white', borderRadius: '50%', padding: '6px', display: 'flex' }}>
                    <IconBulb size={20} />
                  </div>
                  <p style={{ margin: 0, lineHeight: '1.5' }}>
                    <strong>{isCorrect ? 'Great Job!' : 'Not Quite!'}</strong><br/>
                    {isCorrect ? "You've answered perfectly. Keep up the good work!" : "That's incorrect. Review the topic explanation carefully to strengthen your grasp."}
                  </p>
                </div>
              )}

              <div className="decorative-mascot-box" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundImage: `url('../images/action-figure-1.png')`, backgroundSize: 'contain', backgroundPosition: 'right bottom', backgroundRepeat: 'no-repeat' }}>
                <div className="explanation-content" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '16px', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <h3 className="explanation-title" style={{ margin: 0, color: 'var(--text-dark)' }}>Topic Overview</h3>
                    <div className="bulb-wrapper-small" style={{ width: '28px', height: '28px', backgroundColor: '#fff3cd', color: '#ffc107', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBulb size={18} /></div>
                  </div>
                  <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-dark)', marginBottom: '16px' }}>
                    <strong>{currentQuiz.topic || 'General Principle'}</strong> is an essential pillar in software and system architectural design meant to improve reliability.
                  </p>
                  
                  {isSubmitted && !isCorrect && (
                    <div style={{ padding: '12px', backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107', borderRadius: '0 8px 8px 0', fontSize: '14px', color: '#856404' }}>
                      <strong>Hint:</strong> Re-read the scenario specifically observing the key constraints that lead to the correct definition.
                    </div>
                  )}
                  {isSubmitted && isCorrect && (
                    <div style={{ padding: '12px', backgroundColor: '#e6f8f1', borderLeft: '4px solid #01b574', borderRadius: '0 8px 8px 0', fontSize: '14px', color: '#01b574' }}>
                      <strong>Nailed it!</strong> Proceed to the next question to validate your knowledge further!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <h2 style={{ color: 'var(--text-dark)' }}>No Quizzes Available</h2>
            <p>Your lecturer hasn't published any quizzes yet. Please check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentQuizValidator;
