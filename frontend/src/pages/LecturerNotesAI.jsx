import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { 
  IconDownload, IconCopy, IconCheck, IconTrash, IconHistory, IconFilter,
  IconCloudUpload, IconPlus, IconDeviceFloppy, IconDotsVertical
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jsPDF';
import 'jspdf-autotable';
import { BASE_URL } from '../api';
import './NotesAI.css';
import actionFigureImg from '../images/action-figure-1.png';

function LecturerNotesAI() {
  const [file, setFile] = useState(null);
  const [textNotes, setTextNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Lesson Plan');
  const [targetModule, setTargetModule] = useState('General'); 
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [filterModule, setFilterModule] = useState('All');

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/notes?module=${filterModule}&type=teaching_prep`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) { console.error('Failed to fetch history', err); }
  };

  React.useEffect(() => {
    fetchHistory();
  }, [filterModule]);

  const loadHistoryItem = (item) => {
    setGeneratedNotes(item.content);
    setActiveTab('Lesson Plan');
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
      setError('Please upload a file or paste your reference materials first.');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGeneratedNotes(null);

    // Mock AI API Call
    setTimeout(async () => {
      setIsGenerating(false);
      
      let sourceName = '';
      if (file && textNotes.trim()) {
        sourceName = `${file.name} and your raw notes`;
      } else if (file) {
        sourceName = file.name;
      } else {
        sourceName = 'your pasted text';
      }

      const newNotesObj = {
        'Lesson Plan': [
          `1. Introduction to the Topic (10 mins): Connect to previous knowledge based on ${sourceName}.`,
          "2. Core Concepts (20 mins): Explain theories using visual aids.",
          "3. Activity (15 mins): Group problem-solving based on the theories."
        ],
        'Key points': [
          `Comprehensive overview of topics from ${sourceName}.`,
          "Detailed explanation of core theories and methodologies.",
          "Visual prompt ideas derived from ${sourceName}. Discussion starters to engage students.",
          "Case studies and real-world application examples."
        ],
        'Quiz Ideas': [
          `Q1: What is the primary purpose of the module discussed in ${sourceName}?`,
          "Q2: Explain why Data Preprocessing is a necessary step.",
          "Q3: Give an example of an application that uses Neural Networks."
        ]
      };
      setGeneratedNotes(newNotesObj);
      setActiveTab('Lesson Plan');

      // Save to Notes database
      try {
        const token = localStorage.getItem('token');
        await fetch(`${BASE_URL}/notes`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'teaching_prep',
            module: targetModule,
            title: file ? file.name : 'Teaching Prep Draft',
            content: newNotesObj
          })
        });
        fetchHistory(); // Refresh history
        window.dispatchEvent(new CustomEvent('new-notification', { 
          detail: { text: `Teaching prep generated and saved for: ${targetModule}` } 
        }));
      } catch (err) {
        console.error('Failed to save prep', err);
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
      doc.setTextColor(30, 64, 175); // Lecturer Primary color (Blueish)
      doc.text("UniMate Lecturer Study Prep", 14, 22);
      
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
      
      doc.save(`UniMate_LecturerPrep_${targetModule}_${Date.now()}.pdf`);
      toast.success("Teaching Prep PDF Downloaded Successfully!");
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
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <motion.div 
            className="dialog-bubble"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {isGenerating 
              ? "Transforming your materials into a ready-to-use lesson plan. Hold tight!" 
              : generatedNotes 
                ? "Here is your teaching prep! You can switch tabs to see different formats."
                : "I'm ready! Upload or paste your reference materials above."}
          </motion.div>
          <motion.img 
            src={actionFigureImg} 
            alt="AI Mascot" 
            className="dialog-mascot"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="page-header">
        <h1>Lecturer Reference AI</h1>
        <p>Generate lesson plans, teaching points, and quiz ideas from your reference notes.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', justifyContent: 'center' }}>
        <div className="main-content" style={{ flex: 1, maxWidth: '1000px', minWidth: 0 }}>
          <div className="upload-section">
        <div className="upload-card">
          <div className="upload-header">
            <h3>Reference Materials</h3>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Paste Raw Notes (Optional)</label>
              <textarea 
                value={textNotes}
                onChange={(e) => setTextNotes(e.target.value)}
                placeholder="Paste your reference materials or notes here..."
                style={{ flex: 1, minHeight: '160px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Or Upload Reference File (Optional)</label>
              <div 
                className={`dropzone ${file ? 'has-file' : ''}`}
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
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
                    <p style={{ textAlign: 'center', margin: '0 10px' }}>Upload or drop reference materials here...</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
        <button 
          className="btn-primary generate-btn" 
          onClick={handleGenerateClick}
          disabled={isGenerating}
          style={{ width: '100%', maxWidth: '1000px', padding: '16px', fontSize: '16px', fontWeight: '700' }}
        >
          {isGenerating ? 'Generating...' : 'Generate Smart Study Guides & Teaching Aids'}
        </button>
      </div>

          {error && <div className="error-message" style={{ marginTop: '20px' }}>{error}</div>}

          <div className="preview-section" style={{ marginTop: '24px' }}>
        <div className="preview-header">
          <div className="preview-title">
            <h3>Smart Teaching Prep Preview</h3>
            {isGenerating && <span className="status-text">Generating AI-powered teaching prep...</span>}
            {!isGenerating && generatedNotes && <span className="status-text success-text">Generation complete!</span>}
            {!isGenerating && !generatedNotes && <span className="status-text">Awaiting input...</span>}
          </div>
          <div className="preview-actions">
            <button className="btn-outline" onClick={handleDownload} disabled={!generatedNotes || isGenerating}>
              <IconDownload size={16} /> Download PDF
            </button>
          </div>
        </div>

        <div className="tabs-container">
          {['Lesson Plan', 'Key points', 'Quiz Ideas', 'Show Previous Record'].map((tab) => (
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
              <p>Analyzing context and crafting your lesson prep...</p>
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
                {history.length === 0 ? <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>No history found for the selected module.</p> : history.map((item, idx) => (
                   <div key={idx} onClick={() => loadHistoryItem(item)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s', backgroundColor: 'white' }} onMouseEnter={(e) => e.currentTarget.style.borderColor='var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.borderColor='var(--border-color)'}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px' }}>{item.title || 'Generated Prep'}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>{item.module}</span>
                        <span>Date: {new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                   </div>
                ))}
              </div>
            </div>
          ) : generatedNotes ? (
            <ul className={`notes-list ${activeTab === 'Lesson Plan' ? 'summary-style' : ''}`}>
               {generatedNotes[activeTab].map((item, index) => {
                 const parts = item.split(':');
                 if (parts.length > 1 && (activeTab === 'Key Teaching Points' || activeTab === 'Quiz Questions')) {
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
              <p>Your generated teaching prep will appear here once you upload a file or paste text and click "Generate Teaching Aids".</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

export default LecturerNotesAI;
