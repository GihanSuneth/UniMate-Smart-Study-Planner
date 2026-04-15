import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { 
  IconDownload, IconCopy, IconCheck, IconSearch, IconSparkles, 
  IconFileText, IconTrash, IconChevronRight, IconArrowLeft, IconRobot, IconHistory,
  IconFilter, IconCloudUpload, IconPlus, IconDeviceFloppy, IconDotsVertical
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jsPDF';
import 'jspdf-autotable';
import { BASE_URL } from '../api';
import './NotesAI.css';
import actionFigureImg from '../images/action-figure-1.png';

function StudentNotesAI() {
  const [file, setFile] = useState(null);
  const [textNotes, setTextNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Summary');
  const [targetModule, setTargetModule] = useState('General'); 
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [generationMode, setGenerationMode] = useState('short_notes');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [filterModule, setFilterModule] = useState('All');

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/activity?module=${filterModule}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.filter(act => act.type === 'notes_generated'));
      }
    } catch (err) { console.error('Failed to fetch history', err); }
  };

  React.useEffect(() => {
    fetchHistory();
  }, [filterModule]);

  const loadHistoryItem = (item) => {
    setGenerationMode(item.content && item.content['Exam Path'] ? 'exam_prep' : 'short_notes');
    setGeneratedNotes(item.content);
    setActiveTab(item.content && item.content['Exam Path'] ? 'Exam Path' : 'Summary');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateClick = () => {
    if (!file && !textNotes.trim()) {
      setError('Please upload a file or paste your rough notes first.');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGeneratedNotes(null);

    // Mock AI API Call
    setTimeout(async () => {
      setIsGenerating(false);

      const sourceName = file ? file.name : 'your pasted notes';
      let newNotesObj;

      if (generationMode === 'short_notes') {
        newNotesObj = {
          Summary: [
            `Based on ${sourceName}: Machine Learning is a subset of AI where computers learn from data and make decisions with minimal human intervention.`,
            "It fundamentally relies on using algorithms to parse data, learn from it, and then make a determination or prediction.",
            "Data preprocessing and building pipelines are core components before any model training can begin."
          ],
          'Key Points': [
            `According to ${sourceName}, Linear Regression is used for predicting numerical values.`,
            "Decision Trees are primarily for classification.",
            "Neural Networks handle complex pattern recognition.",
            "Data Collection, Preprocessing, and Model Training are the essential phases of ML development."
          ],
          Definitions: [
            "Artificial Intelligence (AI): The theory and development of computer systems able to perform tasks that normally require human intelligence.",
            "Data Preprocessing: The process of cleaning and transforming raw data into a useful and understandable format.",
            "Model Training: The phase where the learning algorithm is applied to the training data."
          ]
        };
        setGeneratedNotes(newNotesObj);
        setActiveTab('Summary');
      } else {
        newNotesObj = {
          'Exam Path': [
            `Week 1: Review Core AI Concepts directly from ${sourceName} and understand the history of Machine Learning.`,
            "Week 2: Focus on Algorithms - specifically Linear Regression and classification methods.",
            "Week 3: Deep dive into Neural Networks and architecture design.",
            "Week 4: Final project practice and mock examinations."
          ],
          'Referral Sheet': [
            `Cheatsheet 1: Common ML Formulas discussed in ${sourceName}.`,
            "Cheatsheet 2: Definitions of Data Preprocessing techniques.",
            "CheatSheet 3: Quick look at Python libraries (Scikit-Learn, TensorFlow, PyTorch)."
          ]
        };
        setGeneratedNotes(newNotesObj);
        setActiveTab('Exam Path');
      }

      // Log activity to backend
      try {
        const token = localStorage.getItem('token');
        await fetch(`${BASE_URL}/activity`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'notes_generated',
            module: targetModule,
            title: file ? file.name : 'Generated Notes',
            content: newNotesObj
          })
        });
        fetchHistory(); // Refresh history
        window.dispatchEvent(new CustomEvent('new-notification', { 
          detail: { text: `AI Notes generated for ${targetModule}!` } 
        }));
      } catch (err) {
        console.error('Failed to log activity', err);
      }
    }, 2500);
  };

  const handleCopy = () => {
    if (!generatedNotes) return;
    const contentToCopy = generatedNotes[activeTab].join('\n\n');
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedNotes) return;
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // Primary color
      doc.text("UniMate Smart Study Notes", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated for ${targetModule} on ${timestamp}`, 14, 30);
      
      let cursorY = 40;
      
      Object.keys(generatedNotes).forEach((tab) => {
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text(tab, 14, cursorY);
        cursorY += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        const lines = generatedNotes[tab].map(item => `• ${item}`);
        const splitText = doc.splitTextToSize(lines.join('\n\n'), 180);
        doc.text(splitText, 14, cursorY);
        
        cursorY += (splitText.length * 7) + 15;
        
        if (cursorY > 270) {
          doc.addPage();
          cursorY = 20;
        }
      });
      
      doc.save(`UniMate_Notes_${targetModule}_${Date.now()}.pdf`);
      toast.success("PDF Downloaded Successfully!");
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="notes-ai-page">
      <AnimatePresence>
        <motion.div 
          className="mascot-dialog-container"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <motion.div 
            className="dialog-bubble"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {isGenerating
              ? "Transforming your rough notes into clear, structured notes. Give me a moment..."
              : generatedNotes
                ? "Here are your structured notes! You can switch tabs to see different formats."
                : "I'm ready! Upload or paste your rough notes above."}
          </motion.div>
          <motion.img 
            src={actionFigureImg} 
            alt="AI Mascot" 
            className="dialog-mascot"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="page-header">
        <h1>Student Notes AI</h1>
        <p>Generate structured study materials with AI from your rough notes.</p>
      </div>

      <div className="mode-selector-container" style={{ display: 'flex', gap: '15px', marginBottom: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          className={generationMode === 'short_notes' ? 'btn-primary' : 'btn-outline'}
          onClick={() => { setGenerationMode('short_notes'); setGeneratedNotes(null); setActiveTab('Summary'); }}
        >
          Create Short Note and Explanation
        </button>
        <button
          className={generationMode === 'exam_prep' ? 'btn-primary' : 'btn-outline'}
          onClick={() => { setGenerationMode('exam_prep'); setGeneratedNotes(null); setActiveTab('Exam Path'); }}
        >
          Examination Preparation Path and Refferral Sheet Builder
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', justifyContent: 'center' }}>
        <div className="main-content" style={{ flex: 1, maxWidth: '1000px', minWidth: 0 }}>
      <div className="upload-section">
        <div className="upload-card">
          <div className="upload-header">
            <h3>Rough Notes</h3>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Target Module Code</label>
            <select 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px', backgroundColor: 'white' }} 
              value={targetModule} 
              onChange={e => setTargetModule(e.target.value)}
            >
              <option value="General">General</option>
              <option value="IT3040">IT3040</option>
              <option value="IT3020">IT3020</option>
              <option value="IT3030">IT3030</option>
              <option value="IT3010">IT3010</option>
            </select>
          </div>

          <div
            className={`dropzone ${file ? 'has-file' : ''}`}
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".txt,.pdf,.doc,.docx"
            />
            {file ? (
              <div className="file-info-container">
                <IconCheck size={28} color="var(--primary)" />
                <p className="file-name">{file.name}</p>
                <button className="remove-file-btn" onClick={removeFile}>
                  <IconTrash size={16} /> Remove File
                </button>
              </div>
            ) : (
              <>
                <div className="cloud-icon-wrapper"><IconCloudUpload size={28} /></div>
                <p>Upload or drop your lecture notes here...</p>
              </>
            )}
          </div>
          <button
            className="btn-primary generate-btn"
            onClick={handleGenerateClick}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Smart Notes'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="upload-card">
          <div className="upload-header with-actions">
            <h3>Paste Text</h3>
            <div className="actions">
              <button className="btn-ghost" onClick={handleUploadClick}><IconPlus size={16} /> Upload File</button>
              <button className="icon-btn-small" onClick={() => alert('Saved Draft!')}><IconDeviceFloppy size={18} /></button>
              <button className="icon-btn-small"><IconDotsVertical size={18} /></button>
            </div>
          </div>
          <div className="text-area-wrapper">
            <textarea
              placeholder="Paste your rough notes here..."
              value={textNotes}
              onChange={(e) => {
                setTextNotes(e.target.value);
                if (error) setError('');
              }}
            ></textarea>
          </div>
        </div>
      </div>

      <div className="preview-section">
        <div className="preview-header">
          <div className="preview-title">
            <h3>Smart Notes Preview</h3>
            {isGenerating && <span className="status-text">Generating AI-powered notes...</span>}
            {!isGenerating && generatedNotes && <span className="status-text success-text">Generation complete!</span>}
            {!isGenerating && !generatedNotes && <span className="status-text">Awaiting input...</span>}
          </div>
          <div className="preview-actions">
            <button className="btn-outline" onClick={handleDownload} disabled={!generatedNotes || isGenerating}>
              <IconDownload size={16} /> Download PDF
            </button>
            <button className="btn-outline" onClick={handleCopy} disabled={!generatedNotes || isGenerating}>
              {copied ? <><IconCheck size={16} /> Copied!</> : <><IconCopy size={16} /> Copy Notes</>}
            </button>
          </div>
        </div>

        <div className="tabs-container">
          {([...(generatedNotes ? Object.keys(generatedNotes) : (generationMode === 'short_notes' ? ['Summary', 'Key Points', 'Definitions'] : ['Exam Path', 'Referral Sheet'])), 'Show Previous Record']).map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              disabled={isGenerating && tab !== 'Show Previous Record'}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="preview-content">
          {isGenerating && activeTab !== 'Show Previous Record' ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Analyzing context and crafting your notes...</p>
            </div>
          ) : activeTab === 'Show Previous Record' ? (
            <div className="history-tab-content">
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconFilter size={20} color="var(--text-secondary)" />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Filter by Module:</span>
                <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px' }} value={filterModule} onChange={e => setFilterModule(e.target.value)}>
                   <option value="All">All Modules</option>
                   <option value="General">General</option>
                   <option value="IT3040">IT3040</option>
                   <option value="IT3020">IT3020</option>
                   <option value="IT3030">IT3030</option>
                   <option value="IT3010">IT3010</option>
                </select>
              </div>
              <div className="history-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {history.filter(item => generationMode === 'short_notes' ? !!item.content?.Summary : !!item.content?.['Exam Path']).length === 0 ? (
                  <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>No history found for this tool.</p>
                ) : history.filter(item => generationMode === 'short_notes' ? !!item.content?.Summary : !!item.content?.['Exam Path']).map((item, idx) => (
                   <div key={idx} onClick={() => loadHistoryItem(item)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s', backgroundColor: 'white' }} onMouseEnter={(e) => e.currentTarget.style.borderColor='var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.borderColor='var(--border-color)'}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px' }}>{item.title || 'Generated Notes'}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>{item.module}</span>
                        <span>Date: {new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                   </div>
                ))}
              </div>
            </div>
          ) : generatedNotes ? (
            <ul className={`notes-list ${activeTab === 'Summary' ? 'summary-style' : ''}`}>
              {generatedNotes[activeTab].map((item, index) => {
                const parts = item.split(':');
                if (parts.length > 1 && activeTab !== 'Summary') {
                  const boldPart = parts.shift();
                  const rest = parts.join(':');
                  return (
                    <li key={index}>
                      <strong>{boldPart}:</strong>{rest}
                    </li>
                  );
                }
                return <li key={index}>{item}</li>;
              })}
            </ul>
          ) : (
            <div className="empty-state">
              <p>Your generated notes will appear here once you upload a file or paste text and click "Generate Smart Notes".</p>
            </div>
          )}
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default StudentNotesAI;
