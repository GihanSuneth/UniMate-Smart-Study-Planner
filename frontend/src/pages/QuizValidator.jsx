import React from 'react';
import { IconCheck, IconChevronDown, IconBulb, IconArrowRight } from '@tabler/icons-react';
import './QuizValidator.css';
import actionFigure3Img from '../images/action-figure-3.png';

// Quiz Validator Demo Page

function QuizValidator() {
  // Render
  return (
    <div className="quiz-validator-page">
      <div className="page-header">
        <h1>Quiz Validator</h1>
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

            <div className="decorative-mascot-box">
              <div className="mini-explanation-card">
                 <div className="mini-header">
                   <span>Topic Explanation</span>
                   <div className="bulb-wrapper-small"><IconBulb size={14} className="bulb-icon-yellow" /></div>
                 </div>
                 <p className="mini-text">
                   <strong>Database Normalization</strong> is the process of structuring a relational database to reduce redundancy and improve
                 </p>
                 <a href="#" className="view-link">
                   <div className="icon-circle"><IconArrowRight size={14} /></div>
                   View All
                 </a>
              </div>
              <img src={actionFigure3Img} alt="Mascot" className="action-figure-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Topic Explanation */}
      <div className="topic-explanation-card bottom-card">
        <h3 className="explanation-title">Topic Explanation</h3>
        <div className="explanation-content">
          <p><strong>Database Normalization</strong> is the process of structuring a relational database to reduce redundancy and improve data integrity. Key concepts</p>
          <ul>
            <li><strong>1NF (First Normal Form)</strong> Ensures the table has atomic (indivisible) values</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default QuizValidator;
