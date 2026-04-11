import React, { useState } from 'react';
import { IconCheck, IconChevronDown, IconPlus, IconX, IconRobot, IconEdit } from '@tabler/icons-react';
import './QuizValidator.css';

function LecturerQuizValidator() {
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  // Modal Form State
  const [modalForm, setModalForm] = useState({
    year: 'Year 1',
    semester: 'Semester 1',
    module: '',
    questionText: '',
    options: [
      { id: 'A', text: '', isCorrect: true },
      { id: 'B', text: '', isCorrect: false },
      { id: 'C', text: '', isCorrect: false },
      { id: 'D', text: '', isCorrect: false }
    ]
  });

  // Generator State
  const [genState, setGenState] = useState({
    year: 'Year 1',
    semester: 'Semester 1',
    module: '',
    topic: ''
  });

  // Initial Preview Question
  const [previewQuestion, setPreviewQuestion] = useState({
    text: 'A university has a Students table that includes columns for student ID, name, course, professorName, and department. Over time, the database starts to have redundant data. For example, if a student changes their course, the professorName and department need to be updated manually. What might this indicate?',
    topic: 'Database Normalization',
    options: [
      { letter: 'A', text: 'The table is in 1NF (First Normal Form)', isCorrect: false },
      { letter: 'B', text: 'The table is in 2NF (Second Normal Form)', isCorrect: false },
      { letter: 'C', text: 'The table is not normalized and there are data anomalies', isCorrect: true },
      { letter: 'D', text: 'The table is already in 3NF (Third Normal Form)', isCorrect: false },
    ]
  });

  const handleGenerate = () => {
    if (!genState.year || !genState.semester || !genState.module || !genState.topic.trim()) {
      alert("Please fill in all generate form fields (Year, Semester, Module, Topic).");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const t = genState.topic || 'General Topic';
      setGeneratedQuestions([
        {
          text: `Regarding ${t}, which of the following is considered a best practice?`,
          options: [
            { letter: 'A', text: 'Ignoring data integrity to save memory', isCorrect: false },
            { letter: 'B', text: 'Ensuring strict structured constraints', isCorrect: true },
            { letter: 'C', text: 'Compiling everything into a single entity', isCorrect: false },
            { letter: 'D', text: 'Hardcoding variables manually', isCorrect: false },
          ]
        },
        {
          text: `What is the primary indicator that a system lacks proper ${t}?`,
          options: [
            { letter: 'A', text: 'Frequent data anomalies or duplication', isCorrect: true },
            { letter: 'B', text: 'Excessive available storage space', isCorrect: false },
            { letter: 'C', text: 'Highly secure API endpoints', isCorrect: false },
            { letter: 'D', text: 'Instantaneous compilation', isCorrect: false },
          ]
        },
        {
          text: `Which mechanism is best utilized when managing scenarios related to ${t}?`,
          options: [
            { letter: 'A', text: 'Graphical manipulations', isCorrect: false },
            { letter: 'B', text: 'Randomized logic flow', isCorrect: false },
            { letter: 'C', text: 'Standardized query languages', isCorrect: true },
            { letter: 'D', text: 'Basic text formatting tools', isCorrect: false },
          ]
        }
      ]);
      setIsGenerating(false);
    }, 1200);
  };

  const publishGenerated = (q) => {
    setPreviewQuestion({
      text: q.text,
      topic: genState.topic || 'Generated Topic',
      options: q.options
    });
    setGeneratedQuestions(prev => prev.filter(item => item.text !== q.text));
    alert('Question Moved to Preview Successfully!');
  };

  const handleEditPreview = () => {
    setModalForm({
      year: 'Year 1',
      semester: 'Semester 1',
      module: previewQuestion.topic,
      questionText: previewQuestion.text,
      options: previewQuestion.options.map((o, idx) => ({
        id: o.letter || String.fromCharCode(65 + idx),
        text: o.text,
        isCorrect: o.isCorrect
      }))
    });
    setShowModal(true);
  };

  const handleOptionTick = (index) => {
    const newOptions = modalForm.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setModalForm({ ...modalForm, options: newOptions });
  };

  const handleOptionTextChange = (index, value) => {
    const newOptions = [...modalForm.options];
    newOptions[index].text = value;
    setModalForm({ ...modalForm, options: newOptions });
  };

  const handleManualPublish = () => {
    if (!modalForm.module) {
      alert("Please carefully select a Module.");
      return;
    }
    if (!modalForm.questionText.trim()) {
      alert("Please enter the question text.");
      return;
    }
    const hasEmptyOption = modalForm.options.some(o => !o.text.trim());
    if (hasEmptyOption) {
      alert("Please provide text for all answer options.");
      return;
    }
    setPreviewQuestion({
      text: modalForm.questionText,
      topic: modalForm.module,
      options: modalForm.options.map(o => ({ letter: o.id, text: o.text || 'Empty option text', isCorrect: o.isCorrect }))
    });
    setShowModal(false);
    alert('Manual Question Published to Quiz Successfully!');
  };

  return (
    <div className="quiz-validator-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Lecturer Quiz Management</h1>
          <p>Create and validate scenario-based questions for your classes.</p>
        </div>
        <button className="submit-btn" onClick={() => {
          setModalForm({
            year: 'Year 1', semester: 'Semester 1', module: '', questionText: '',
            options: [
              { id: 'A', text: '', isCorrect: true }, { id: 'B', text: '', isCorrect: false }, { id: 'C', text: '', isCorrect: false }, { id: 'D', text: '', isCorrect: false }
            ]
          });
          setShowModal(true);
        }} style={{ width: 'auto', padding: '10px 20px', display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          <IconPlus size={18} /> Create New Quiz
        </button>
      </div>

      <div className="quiz-main-card">
        <div className="topic-selector-row">
          <span className="selector-label">Currently Reviewing</span>
          <div className="dropdown" style={{ backgroundColor: '#f1f5f9' }}>
            <span>{previewQuestion.topic}</span>
            <IconChevronDown size={18} className="dropdown-icon" />
          </div>
        </div>

        <div className="quiz-grid-inner">
          {/* Left Column: Question Preview */}
          <div className="question-col">
            <h3 className="question-number">Question Preview</h3>
            <hr className="divider" />
            <p className="question-text">
              {previewQuestion.text}
            </p>

            <div className="options-container">
              {previewQuestion.options.map((opt, idx) => (
                <div key={idx} className={`option-row ${opt.isCorrect ? 'selected-correct' : ''}`} style={opt.isCorrect ? { backgroundColor: '#e6f8f1', border: '1px solid #ccebe1' } : {}}>
                  {opt.isCorrect && <IconCheck size={18} className="success-icon" stroke={3} style={{ marginRight: '8px' }} />}
                  <span className="option-letter" style={opt.isCorrect ? { display: 'none' } : {}}>{opt.letter})</span>
                  <span className="option-text" style={opt.isCorrect ? { fontWeight: '600' } : {}}>{opt.text}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={handleEditPreview} 
                style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <IconEdit size={18} /> Edit Current Question
              </button>
              <button 
                onClick={() => {
                  try {
                    const existingQuizzes = JSON.parse(localStorage.getItem('published_quizzes')) || [];
                    const updatedQuizzes = [...existingQuizzes, previewQuestion];
                    localStorage.setItem('published_quizzes', JSON.stringify(updatedQuizzes));
                    alert("Quiz Published to Course successfully!");
                  } catch (e) {
                    console.error("Error saving to localStorage", e);
                  }
                }} 
                style={{ flex: 1.5, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <IconCheck size={18} /> Publish to Course
              </button>
            </div>
          </div>

          {/* Right Column: Generate Quiz in AI */}
          <div className="feedback-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#e6f0ff', color: '#266df1', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                  <IconRobot size={20} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: 'var(--text-dark)' }}>Generate Quiz in AI</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <select style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={genState.year} onChange={(e) => setGenState({ ...genState, year: e.target.value })}>
                    <option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option>
                  </select>
                  <select style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={genState.semester} onChange={(e) => setGenState({ ...genState, semester: e.target.value })}>
                    <option>Semester 1</option><option>Semester 2</option>
                  </select>
                </div>
                <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={genState.module} onChange={(e) => setGenState({ ...genState, module: e.target.value })}>
                  <option value="">Select Module</option>
                  <option>IT3030 - PAF</option>
                  <option>IT3040 - ITPM</option>
                  <option>IT3010 - NDM</option>
                  <option>IT3020 - DS</option>
                </select>
                <input type="text" placeholder="Which Topic (e.g. Normalization)" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={genState.topic} onChange={(e) => setGenState({ ...genState, topic: e.target.value })} />

                <button onClick={handleGenerate} disabled={isGenerating || !genState.module || !genState.topic} style={{ marginTop: '8px', width: '100%', padding: '12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: (isGenerating || !genState.module || !genState.topic) ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: (isGenerating || !genState.module || !genState.topic) ? 0.7 : 1 }}>
                  {isGenerating ? 'Generating...' : 'Generate Questions'}
                </button>
              </div>
            </div>

            {/* Generated Questions List underneath */}
            {generatedQuestions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '15px', color: 'var(--text-dark)', margin: 0 }}>Generated Questions</h4>
                {generatedQuestions.map((q, idx) => (
                  <div key={idx} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-dark)', marginBottom: '16px', lineHeight: '1.5' }}><strong>Q{idx + 1}:</strong> {q.text}</p>
                    <button onClick={() => publishGenerated(q)} style={{ padding: '8px 16px', backgroundColor: '#e6f8f1', color: '#01b574', border: '1px solid #ccebe1', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d3f2e4'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#e6f8f1'}>
                      Publish Option
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18, 28, 56, 0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', width: '90%', maxWidth: '650px', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', margin: 0, color: 'var(--text-dark)' }}>Create Manual Question</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><IconX size={24} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <select style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={modalForm.year} onChange={e => setModalForm({ ...modalForm, year: e.target.value })}><option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option></select>
                <select style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={modalForm.semester} onChange={e => setModalForm({ ...modalForm, semester: e.target.value })}><option>Semester 1</option><option>Semester 2</option></select>
              </div>
              <input type="text" placeholder="Module Code (e.g. IT3030)" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={modalForm.module} onChange={e => setModalForm({ ...modalForm, module: e.target.value })} />

              <textarea placeholder="Enter scenario or question text..." style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', outline: 'none' }} value={modalForm.questionText} onChange={e => setModalForm({ ...modalForm, questionText: e.target.value })} />

              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '12px', display: 'block' }}>Answers (Tick the correct one):</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {modalForm.options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="radio" name="correctAnswer" checked={opt.isCorrect} onChange={() => handleOptionTick(i)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--success)' }} />
                      <span style={{ fontWeight: '600', color: 'var(--text-secondary)', minWidth: '20px' }}>{opt.id})</span>
                      <input type="text" placeholder={`Answer option ${opt.id}...`} style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={opt.text} onChange={(e) => handleOptionTextChange(i, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'white', color: 'var(--text-dark)', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleManualPublish} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Publish Question</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LecturerQuizValidator;
