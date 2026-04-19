import React, { useState, useEffect } from 'react';
import { 
  IconCheck, 
  IconChevronDown, 
  IconPlus, 
  IconX, 
  IconRobot, 
  IconEdit, 
  IconEye, 
  IconDeviceFloppy, 
  IconTrash,
  IconCalendar,
  IconClock,
  IconBulb,
  IconShieldLock,
  IconSend
} from '@tabler/icons-react';
import { API_ENDPOINTS } from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './QuizValidator.css';

function LecturerQuizValidator() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Setup, 2: Questions
  const [isViewOnly, setIsViewOnly] = useState(false);
  
  // Dashboard Filtering
  const [filterModule, setFilterModule] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterSemester, setFilterSemester] = useState('All');
  const [filterWeek, setFilterWeek] = useState('All');

  // Form State for New Quiz
  const [quizForm, setQuizForm] = useState({
    title: '',
    module: '',
    year: 'Year 1',
    semester: 'Semester 1',
    week: 1,
    questionCount: 5,
    questions: [],
    deadline: ''
  });

  // Secure publishing state
  const [confirmPublishId, setConfirmPublishId] = useState(null);
  const [lecturerPassword, setLecturerPassword] = useState('');

  // Current Question being edited/added in step 2
  const [editingIndex, setEditingIndex] = useState(-1);
  const [tempQuestion, setTempQuestion] = useState({
    text: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  });

  const modules = ['Programming Applications', 'Database Systems', 'Operating Systems', 'Software Engineering'];

  useEffect(() => {
    fetchQuizzes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterModule, filterYear, filterSemester, filterWeek]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      let combinedYear = 'All';
      if (filterYear !== 'All' && filterSemester !== 'All') combinedYear = `${filterYear} ${filterSemester}`;
      else if (filterYear !== 'All') combinedYear = filterYear;
      else if (filterSemester !== 'All') combinedYear = filterSemester;

      let url = `${API_ENDPOINTS.QUIZZES}?module=${filterModule}&academicYear=${combinedYear}&week=${filterWeek}`;
      
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

  const handleCreateNew = () => {
    setQuizForm({
      title: '',
      module: '',
      year: 'Year 1',
      semester: 'Semester 1',
      week: 1,
      questionCount: 5,
      questions: []
    });
    setIsViewOnly(false);
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleEditQuiz = (quiz) => {
    const parts = quiz.academicYear ? quiz.academicYear.split(' ') : ['Year 1', 'Semester 1'];
    setQuizForm({
      ...quiz,
      year: parts[0] + ' ' + (parts[1] || '1'),
      semester: (parts[2] || 'Semester') + ' ' + (parts[3] || '1')
    });
    setIsViewOnly(false);
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleViewQuiz = (quiz) => {
    const parts = quiz.academicYear ? quiz.academicYear.split(' ') : ['Year 1', 'Semester 1'];
    setQuizForm({
      ...quiz,
      year: parts[0] + ' ' + (parts[1] || '1'),
      semester: (parts[2] || 'Semester') + ' ' + (parts[3] || '1')
    });
    setIsViewOnly(true);
    setCurrentStep(2);
    setShowModal(true);
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.QUIZZES}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchQuizzes();
        alert("Quiz deleted successfully!");
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const handleNextStep = () => {
    if (!quizForm.title || !quizForm.module || !quizForm.year || !quizForm.semester || !quizForm.week) {
      alert("Please fill in all details.");
      return;
    }
    if (quizForm.questionCount < 5) {
      alert("Minimum 5 questions required.");
      return;
    }
    setCurrentStep(2);
  };

  const handleAddQuestion = () => {
    if (!tempQuestion.text.trim()) return;
    if (tempQuestion.options.some(o => !o.text.trim())) {
      alert("Please fill all options.");
      return;
    }

    const newQuestions = [...quizForm.questions];
    if (editingIndex >= 0) {
      newQuestions[editingIndex] = { ...tempQuestion };
    } else {
      newQuestions.push({ ...tempQuestion });
    }

    setQuizForm({ ...quizForm, questions: newQuestions });
    resetTempQuestion();
    setEditingIndex(-1);
  };

  const resetTempQuestion = () => {
    setTempQuestion({
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    });
  };

  const handleEditQuestion = (index) => {
    setEditingIndex(index);
    setTempQuestion({ ...quizForm.questions[index] });
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = quizForm.questions.filter((_, i) => i !== index);
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  const handleMockGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const mockQuestions = Array.from({ length: quizForm.questionCount }, (_, i) => ({
        text: `Sample generated question ${i + 1} for ${quizForm.module}?`,
        options: [
          { text: 'Correct Answer', isCorrect: true },
          { text: 'Wrong Answer 1', isCorrect: false },
          { text: 'Wrong Answer 2', isCorrect: false },
          { text: 'Wrong Answer 3', isCorrect: false }
        ]
      }));
      setQuizForm({ ...quizForm, questions: mockQuestions });
      setIsGenerating(false);
    }, 1500);
  };

  const handleSaveDraft = async () => {
    try {
      const payload = {
        ...quizForm,
        academicYear: `${quizForm.year} ${quizForm.semester}`
      };
      
      const url = quizForm._id 
        ? `${API_ENDPOINTS.QUIZZES}/${quizForm._id}`
        : API_ENDPOINTS.QUIZZES;
      const method = quizForm._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setShowModal(false);
        fetchQuizzes();
        alert(quizForm._id ? "Quiz updated successfully!" : "Quiz saved as draft!");
      } else {
        const err = await response.json();
        alert(err.message || "Failed to save quiz.");
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!lecturerPassword) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.QUIZZES}/${confirmPublishId}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: lecturerPassword })
      });
      if (response.ok) {
        setConfirmPublishId(null);
        setLecturerPassword('');
        fetchQuizzes();
        toast.success("Quiz published successfully! 🚀");
      } else {
        const err = await response.json();
        toast.error(err.message || "Authentication failed. Incorrect password.");
      }
    } catch (error) {
      console.error('Error publishing quiz:', error);
      toast.error("Connectivity error.");
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    const matchesModule = filterModule === 'All' || q.module === filterModule;
    const matchesYear = filterYear === 'All' || (q.academicYear && q.academicYear.includes(filterYear));
    const matchesSemester = filterSemester === 'All' || (q.academicYear && q.academicYear.includes(filterSemester));
    return matchesModule && matchesYear && matchesSemester;
  });

  return (
    <div className="quiz-validator-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '8px' }}>Lecturer Quiz Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage, create, and publish quizzes for your modules.</p>
        </div>
        <button className="submit-btn" onClick={handleCreateNew} style={{ width: 'auto', padding: '12px 24px', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}>
          <IconPlus size={20} /> Create New Quiz
        </button>
      </div>

      <div className="quiz-main-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="topic-selector-row" style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', margin: 0, backgroundColor: '#fcfdfe', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="selector-label" style={{ fontSize: '11px' }}>Module</span>
            <select className="dropdown" style={{ width: '220px' }} value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
              <option value="All">All Modules</option>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="selector-label" style={{ fontSize: '11px' }}>Year</span>
            <select className="dropdown" style={{ width: '120px' }} value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="All">All Years</option>
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="selector-label" style={{ fontSize: '11px' }}>Semester</span>
            <select className="dropdown" style={{ width: '130px' }} value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}>
              <option value="All">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="selector-label" style={{ fontSize: '11px' }}>Week</span>
            <select className="dropdown" style={{ width: '110px' }} value={filterWeek} onChange={(e) => setFilterWeek(e.target.value)}>
              <option value="All">All Weeks</option>
              {Array.from({ length: 14 }, (_, i) => i + 1).map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
          </div>
        </div>

        <div className="quiz-list" style={{ minHeight: '400px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--text-secondary)' }}>
              Loading quizzes...
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px', gap: '16px' }}>
              <IconRobot size={48} style={{ color: '#cbd5e1' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No quizzes found for this selection.</p>
              <button onClick={handleCreateNew} style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '8px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Create your first quiz</button>
            </div>
          ) : (
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {filteredQuizzes.map(quiz => (
                  <div key={quiz._id} className="quiz-item-card" style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '20px', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', backgroundColor: quiz.isPublished ? '#e6f8f1' : '#fff3dc', color: quiz.isPublished ? '#01b574' : '#ff9c00', textTransform: 'uppercase' }}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <IconCalendar size={16} />
                        {new Date(quiz.dateCreated).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px' }}>{quiz.title}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{quiz.module}</p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', fontSize: '14px', color: 'var(--text-dark)' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><IconClock size={16} /> {quiz.questionCount} Questions</div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><IconCalendar size={16} /> Week {quiz.week}</div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><IconSend size={16} /> {quiz.academicYear}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!quiz.isPublished && (
                        <button 
                          onClick={() => setConfirmPublishId(quiz._id)}
                          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#6366f1', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        >
                          <IconShieldLock size={18} /> Approve & Publish
                        </button>
                      )}
                      <button 
                        onClick={() => quiz.isPublished ? handleViewQuiz(quiz) : handleEditQuiz(quiz)}
                        style={{ flex: quiz.isPublished ? 1 : 'none', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'white', color: 'var(--text-dark)', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                      >
                        {quiz.isPublished ? <><IconEye size={18} /> View Quiz</> : <><IconEdit size={18} /> Edit</>}
                      </button>
                      <button 
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #fee2e2', backgroundColor: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        title="Delete Quiz"
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18, 28, 56, 0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', width: '90%', maxWidth: currentStep === 1 ? '500px' : '900px', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', margin: 0, color: 'var(--text-dark)' }}>{isViewOnly ? "View Quiz" : currentStep === 1 ? "Quiz Setup" : "Add Questions"}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{isViewOnly ? quizForm.module : `Step ${currentStep} of 2`}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><IconX size={24} /></button>
            </div>

            {currentStep === 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Quiz Title</label>
                  <input type="text" placeholder="e.g. Midterm Practice Quiz" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} />
                </div>
                
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Module</label>
                  <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={quizForm.module} onChange={e => setQuizForm({...quizForm, module: e.target.value})}>
                    <option value="">Select Module</option>
                    {modules.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Year</label>
                    <select disabled={isViewOnly} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={quizForm.year} onChange={e => setQuizForm({...quizForm, year: e.target.value})}>
                      <option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Semester</label>
                    <select disabled={isViewOnly} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={quizForm.semester} onChange={e => setQuizForm({...quizForm, semester: e.target.value})}>
                      <option>Semester 1</option><option>Semester 2</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Academic Week</label>
                    <select disabled={isViewOnly} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={quizForm.week} onChange={e => setQuizForm({...quizForm, week: parseInt(e.target.value)})}>
                      {Array.from({length: 15}, (_, i) => i + 1).map(w => <option key={w} value={w}>Week {w}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Question Count (Min 5)</label>
                    <input disabled={isViewOnly} type="number" min="5" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} value={quizForm.questionCount} onChange={e => setQuizForm({...quizForm, questionCount: parseInt(e.target.value)})} />
                  </div>
                </div>

                {!isViewOnly && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button onClick={handleNextStep} style={{ flex: 2, padding: '14px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                      Continue to Questions
                    </button>
                    <button 
                      onClick={() => {
                        if (!quizForm.title || !quizForm.module || !quizForm.week) {
                          alert("Please fill in basic details first.");
                          return;
                        }
                        setCurrentStep(2);
                        handleMockGenerate();
                      }} 
                      style={{ flex: 1, padding: '14px', backgroundColor: '#f0f4ff', color: 'var(--primary)', border: '1px solid #e0e7ff', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <IconRobot size={20} /> AI Auto-Fill
                    </button>
                  </div>
                )}
                {isViewOnly && <button onClick={() => setCurrentStep(2)} style={{ marginTop: '12px', padding: '14px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>View Questions</button>}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>{editingIndex >= 0 ? "Edit Question" : "New Question"} #{quizForm.questions.length + (editingIndex >= 0 ? 0 : 1)}</h4>
                    
                    <textarea 
                      disabled={isViewOnly}
                      placeholder="Enter question text..." 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '80px', marginBottom: '16px', fontFamily: 'inherit' }} 
                      value={tempQuestion.text}
                      onChange={e => setTempQuestion({...tempQuestion, text: e.target.value})}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {tempQuestion.options.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input 
                            disabled={isViewOnly}
                            type="radio" 
                            name="correct" 
                            checked={opt.isCorrect} 
                            onChange={() => {
                              const opts = tempQuestion.options.map((o, idx) => ({ ...o, isCorrect: idx === i }));
                              setTempQuestion({ ...tempQuestion, options: opts });
                            }}
                          />
                          <input 
                            disabled={isViewOnly}
                            type="text" 
                            placeholder={`Option ${i+1}`} 
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '13px' }} 
                            value={opt.text}
                            onChange={e => {
                              const opts = [...tempQuestion.options];
                              opts[i].text = e.target.value;
                              setTempQuestion({ ...tempQuestion, options: opts });
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {!isViewOnly && (
                      <button 
                        onClick={handleAddQuestion}
                        style={{ marginTop: '20px', width: '100%', padding: '10px', backgroundColor: '#eef2ff', color: 'var(--primary)', border: '1px solid #e0e7ff', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        {editingIndex >= 0 ? "Update Question" : "Add to Quiz"}
                      </button>
                    )}
                  </div>

                  {!isViewOnly && (
                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '20px', borderRadius: '16px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                      <IconRobot size={32} color="var(--primary)" />
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>Feeling Lazy?</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Generate all {quizForm.questionCount} questions using AI based on your module.</p>
                      </div>
                      <button 
                        onClick={handleMockGenerate} 
                        disabled={isGenerating}
                        style={{ width: '100%', padding: '10px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', gap: '8px', opacity: isGenerating ? 0.7 : 1 }}
                      >
                        {isGenerating ? "Generating..." : "AI Generate Questions"}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0 }}>Quiz structure ({quizForm.questions.length}/{quizForm.questionCount})</h4>
                    {!isViewOnly && quizForm.questions.length >= quizForm.questionCount && (
                      <button onClick={handleSaveDraft} style={{ padding: '8px 20px', backgroundColor: '#e6f8f1', color: '#01b574', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconDeviceFloppy size={18} /> {quizForm._id ? "Update Quiz" : "Save Draft"}
                      </button>
                    )}
                  </div>

                  <div style={{ overflowY: 'auto', maxHeight: '500px', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                    {quizForm.questions.length === 0 ? (
                      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                        No questions added yet.
                      </div>
                    ) : (
                      quizForm.questions.map((q, idx) => (
                        <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontWeight: '700', fontSize: '14px' }}>Q{idx + 1}</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {!isViewOnly && <button onClick={() => handleEditQuestion(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><IconEdit size={16} /></button>}
                              {!isViewOnly && <button onClick={() => handleRemoveQuestion(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><IconTrash size={16} /></button>}
                            </div>
                          </div>
                          <p style={{ fontSize: '13px', margin: '0 0 10px 0', lineHeight: '1.4' }}>{q.text}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {q.options.map((o, oi) => (
                              <div key={oi} style={{ fontSize: '11px', color: o.isCorrect ? '#01b574' : 'var(--text-secondary)', fontWeight: o.isCorrect ? '700' : 'normal', display: 'flex', gap: '4px' }}>
                                {o.isCorrect && <IconCheck size={12} />} {o.text}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Publish Confirmation Modal */}
      {confirmPublishId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18, 28, 56, 0.6)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', width: '90%', maxWidth: '400px', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', margin: 0 }}>Secure Publish</h2>
                <button onClick={() => setConfirmPublishId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><IconX size={20} /></button>
             </div>
             <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
               Please enter your password to confirm and publish this quiz. This ensures data integrity.
             </p>
             <form onSubmit={handlePublish}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Your Password</label>
                  <input 
                    type="password" 
                    required 
                    autoFocus
                    placeholder="Enter password..."
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                    value={lecturerPassword}
                    onChange={e => setLecturerPassword(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setConfirmPublishId(null)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#6366f1', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Confirm Publish</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LecturerQuizValidator;
