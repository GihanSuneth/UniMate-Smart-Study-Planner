import React from 'react';
import { IconCheck, IconChevronDown, IconBulb, IconArrowRight } from '@tabler/icons-react';
import './QuizValidator.css';


function StudentQuizValidator() {
  return (
    <div className="quiz-validator-page">
      <div className="page-header">
        <h1>Student Quiz Validator</h1>
        <p>Practice scenario-based questions to test your understanding of specific topics.</p>
      </div>

      <div className="quiz-main-card">
        <div className="topic-selector-row">
          <span className="selector-label">Select Topic</span>
          <div className="dropdown">
            <span>Database Normalization</span>
            <IconChevronDown size={18} className="dropdown-icon" />
          </div>
        </div>

        <div className="quiz-grid-inner">
          {/* Left Column: Question */}
          <div className="question-col">
            <h3 className="question-number">Question 1</h3>
            <hr className="divider" />
            <p className="question-text">
              <strong>A</strong> university has a <strong>Students table</strong> that includes columns for student ID, name, course, professorName, and department. Over time, the database starts <strong>to have redundant data</strong>. For example, if a student changes their course, the professorName and department need to be updated manually. What might this indicate?
            </p>

            <div className="options-container">
              <div className="option-row">
                <span className="option-letter">A)</span>
                <span className="option-text">The table is in 1NF (First Normal Form)</span>
              </div>
              <div className="option-row disabled">
                <span className="option-letter">B)</span>
                <span className="option-text">The table is in 2NF (Second Normal Form)</span>
              </div>
              <div className="option-row selected-correct">
                <IconCheck size={18} className="success-icon" stroke={3} />
                <span className="option-text" style={{marginLeft: '8px'}}><strong>The table is not normalized</strong> and <strong>there are data anomalies</strong></span>
              </div>
              <div className="option-row">
                <span className="option-letter">D)</span>
                <span className="option-text">The table is already in 3NF (Third Normal Form)</span>
              </div>
            </div>

            <button className="submit-btn">Submit Answer</button>
          </div>

          {/* Right Column: Feedback and Mascot */}
          <div className="feedback-col">
            <div className="chat-bubble">
              <div className="bulb-wrapper"><IconBulb size={18} className="bulb-icon-yellow" /></div>
              <p><strong>Great!</strong> The table is <strong>not normalized</strong>, which is causing data anomalies and redundancy. Let's briefly go over some key concepts.</p>
            </div>

            <div className="decorative-mascot-box" style={{ padding: '24px' }}>
              <div className="explanation-content" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '16px', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <h3 className="explanation-title" style={{ margin: 0 }}>Topic Explanation</h3>
                  <div className="bulb-wrapper-small" style={{ width: '24px', height: '24px' }}><IconBulb size={16} className="bulb-icon-yellow" /></div>
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-dark)', marginBottom: '12px' }}>
                  <strong>Database Normalization</strong> is the process of structuring a relational database to reduce redundancy and improve data integrity. Key concepts:
                </p>
                <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text-dark)', lineHeight: '1.6' }}>
                  <li style={{ marginBottom: '8px' }}><strong>1NF (First Normal Form)</strong> Ensures the table has atomic (indivisible) values</li>
                  <li style={{ marginBottom: '8px' }}><strong>2NF (Second Normal Form)</strong> Meets 1NF and removes partial dependencies</li>
                  <li><strong>3NF (Third Normal Form)</strong> Meets 2NF and removes transitive dependencies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Topic Explanation Removed */}
    </div>
  );
}

export default StudentQuizValidator;
