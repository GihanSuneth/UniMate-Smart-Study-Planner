import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { 
  IconDownload, IconCopy, IconCheck, IconTrash, IconHistory, IconFilter,
  IconCloudUpload, IconPlus, IconDeviceFloppy, IconDotsVertical
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
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

  const [modules, setModules] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        const assigned = data.assignedModules || [];
        setModules(assigned);
        if (assigned.length > 0) {
          setTargetModule(assigned[0]);
        } else {
          setTargetModule('General');
        }
      }
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  };

  React.useEffect(() => {
    fetchUserProfile();
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterModule]);

  const loadHistoryItem = (item) => {
    setGeneratedNotes(item.content);
    setActiveTab('Lesson Plan');
  };

  const [fileContent, setFileContent] = useState('');

  const processFile = (fileObj) => {
    setFile(fileObj);
    setError('');
    
    if (fileObj.type === 'text/plain' || fileObj.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => setFileContent(e.target.result);
      reader.readAsText(fileObj);
    } else {
      setFileContent(`[Attached Document: ${fileObj.name}. Note: Automated parsing for non-txt files may be limited in demo.]`);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
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

  const handleGenerateClick = async () => {
    if (!file && !textNotes.trim()) {
      setError('Please upload a file or paste your reference materials first.');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGeneratedNotes(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/ai`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'notes',
          data: {
            module: targetModule,
            notes: [fileContent, textNotes].filter(Boolean).join('\n\n--- Document Text ---\n\n'),
            fileName: file ? file.name : null,
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.warning("Gemini AI Quota Exceeded. Please wait 60 seconds before retrying.");
          setIsGenerating(false);
          return;
        }
        throw new Error('Failed to generate teaching prep from AI');
      }

      const newNotesObj = await response.json();
      setIsGenerating(false);
      setGeneratedNotes(newNotesObj);
      
      const firstTab = Object.keys(newNotesObj)[0];
      if (firstTab) setActiveTab(firstTab);

      // Save to Notes database (log activity)
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
      fetchHistory(); 
      window.dispatchEvent(new CustomEvent('new-notification', { 
        detail: { text: `Teaching prep generated and saved for: ${targetModule}` } 
      }));

    } catch (err) {
      console.error('AI Generation Error:', err);
      setError('Failed to reach AI. Please try again later.');
      setIsGenerating(false);
      toast.error("AI Service is temporarily unavailable.");
    }
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
        <div className="main-content" style={{ flex: 1, maxWidth: '1200px', minWidth: 0 }}>
          <div className="upload-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px', padding: '40px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', boxShadow: 'var(--shadow-card)', marginBottom: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-dark)' }}>Reference Materials</h3>
            


            <div 
              className={`dropzone ${file ? 'has-file' : ''}`}
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{ flex: 1, minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', border: '1px dashed #cbd5e1', borderRadius: '12px', backgroundColor: '#f8fafc', cursor: 'pointer' }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
                accept=".txt,.pdf,.doc,.docx"
              />
              {file ? (
                <div className="file-info-container" style={{ textAlign: 'center' }}>
                  <IconCheck size={28} color="var(--primary)" />
                  <p className="file-name" style={{ marginTop: '8px', fontWeight: '500' }}>{file.name}</p>
                  <button 
                    className="remove-file-btn" 
                    onClick={removeFile}
                    style={{ marginTop: '12px', background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', margin: '12px auto 0' }}
                  >
                    <IconTrash size={16} /> Remove File
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <div className="cloud-icon-wrapper" style={{ marginBottom: '12px', color: 'var(--primary)' }}><IconCloudUpload size={32} /></div>
                  <p style={{ margin: '0 20px', fontSize: '14px' }}>Upload or drop your reference materials here...</p>
                </div>
              )}
            </div>

            <button 
              className="btn-primary generate-btn" 
              onClick={handleGenerateClick}
              disabled={isGenerating}
              style={{ width: 'max-content', padding: '12px 24px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer' }}
            >
              {isGenerating ? 'Generating...' : 'Generate Teaching Aids'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-dark)' }}>Paste Text</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)' }}>Filter by Module:</span>
                <select 
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: 'white', color: 'var(--primary)', outline: 'none', cursor: 'pointer', minWidth: '220px' }} 
                  value={targetModule} 
                  onChange={e => setTargetModule(e.target.value)}
                >
                  {modules.map((mod, idx) => (
                    <option key={idx} value={mod}>{mod}</option>
                  ))}
                  {modules.length === 0 && <option value="General">General</option>}
                </select>
              </div>
            </div>
            
            <textarea 
              value={textNotes}
              onChange={(e) => setTextNotes(e.target.value)}
              placeholder="Paste your syllabus or reference notes here..."
              style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', resize: 'none', backgroundColor: '#ffffff', minHeight: '280px' }}
            />
          </div>

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
          {([...(generatedNotes ? Object.keys(generatedNotes) : ['Summary', 'Key Points', 'Lesson Plan', 'Quiz Ideas']), 'Show Previous Record']).map((tab) => (
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
                   {modules.length > 0 ? (
                     modules.map((mod, idx) => (
                       <option key={idx} value={mod}>{mod}</option>
                     ))
                   ) : (
                     <option value="" disabled>No Assigned Modules</option>
                   )}
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
