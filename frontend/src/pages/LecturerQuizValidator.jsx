import React from 'react';
import { IconCheck, IconChevronDown, IconBulb, IconArrowRight, IconPlus } from '@tabler/icons-react';
import './QuizValidator.css';
import actionFigure3Img from '../images/action-figure-3.png';

function LecturerQuizValidator() {
  return (
    <div className="quiz-validator-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Lecturer Quiz Management</h1>
          <p>Create and validate scenario-based questions for your classes.</p>
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '10px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <IconPlus size={18} /> Create New Quiz
        </button>
      </div>

      <div className="quiz-main-card">
        <div className="topic-selector-row">
          <span className="selector-label">Select Topic to Review</span>
          <div className="dropdown">
            <span>Database Normalization</span>
            <IconChevronDown size={18} className="dropdown-icon" />
          </div>
        </div>

        <div className="quiz-grid-inner">
          {/* Left Column: Question Preview */}
          <div className="question-col">
            <h3 className="question-number">Question Preview: Question 1</h3>
            <hr className="divider" />
            <p className="question-text">
              <strong>A</strong> university has a <strong>Students table</strong> that includes columns for student ID, name, course, professorName, and department. Over time, the database starts <strong>to have redundant data</strong>. For example, if a student changes their course, the professorName and department need to be updated manually. What might this indicate?
            </p>

            <div className="options-container">
              <div className="option-row">
                <span className="option-letter">A)</span>
                <span className="option-text">The table is in 1NF (First Normal Form)</span>
              </div>
              <div className="option-row">
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

            <button className="submit-btn" style={{background: 'var(--text-secondary)'}}>Edit Question</button>
          </div>

          {/* Right Column: Feedback and Mascot */}
          <div className="feedback-col">
            <div className="chat-bubble">
              <div className="bulb-wrapper"><IconBulb size={18} className="bulb-icon-yellow" /></div>
              <p><strong>Student Performance:</strong> 65% of students got this right. It seems like a good discriminator question.</p>
            </div>

            <div className="decorative-mascot-box">
              <img src={actionFigure3Img} alt="Mascot" className="action-figure-3" style={{position: 'static'}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LecturerQuizValidator;
