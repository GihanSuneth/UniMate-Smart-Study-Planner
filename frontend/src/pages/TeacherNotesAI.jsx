import React, { useState, useRef } from 'react';
import { IconCloudUpload, IconPlus, IconDeviceFloppy, IconDotsVertical, IconDownload, IconCopy, IconCheck, IconTrash } from '@tabler/icons-react';
import './NotesAI.css';
import actionFigureImg from '../images/action-figure-1.png';

function TeacherNotesAI() {
  const [file, setFile] = useState(null);
  const [textNotes, setTextNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Lesson Plan');
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

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
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedNotes({
        'Lesson Plan': [
          "1. Introduction to the Topic (10 mins): Connect to previous knowledge.",
          "2. Core Concepts (20 mins): Explain theories using visual aids.",
          "3. Activity (15 mins): Group problem-solving based on the theories."
        ],
        'Key Teaching Points': [
          "Ensure students understand the difference between regression and classification.",
          "Emphasize the importance of data preprocessing.",
          "Provide real-world examples (e.g., predicting house prices vs. categorizing emails)."
        ],
        'Quiz Questions': [
          "Q1: What is the primary purpose of a Decision Tree?",
          "Q2: Explain why Data Preprocessing is a necessary step.",
          "Q3: Give an example of an application that uses Neural Networks."
        ]
      });
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
    alert("Downloading PDF... (Mock logic)");
  };

  return (
    <div className="notes-ai-page">
      <div className="page-header">
        <h1>Teacher Reference AI</h1>
        <p>Generate lesson plans, teaching points, and quiz ideas from your reference notes.</p>
      </div>

      <div className="upload-section">
        <div className="upload-card">
          <div className="upload-header">
            <h3>Reference Materials</h3>
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
                <p>Upload or drop your reference materials here...</p>
              </>
            )}
          </div>
          <button 
            className="btn-primary generate-btn" 
            onClick={handleGenerateClick}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Teaching Aids'}
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
              placeholder="Paste your syllabus or reference notes here..."
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
            <h3>Smart Teaching Prep Preview</h3>
            {isGenerating && <span className="status-text">Generating AI-powered teaching prep...</span>}
            {!isGenerating && generatedNotes && <span className="status-text success-text">Generation complete!</span>}
            {!isGenerating && !generatedNotes && <span className="status-text">Awaiting input...</span>}
          </div>
          <div className="preview-actions">
            <button className="btn-outline" onClick={handleDownload} disabled={!generatedNotes || isGenerating}>
              <IconDownload size={16} /> Download PDF
            </button>
            <button className="btn-outline" onClick={handleCopy} disabled={!generatedNotes || isGenerating}>
              {copied ? <><IconCheck size={16} /> Copied!</> : <><IconCopy size={16} /> Copy Content</>}
            </button>
          </div>
        </div>

        <div className="tabs-container">
          {['Lesson Plan', 'Key Teaching Points', 'Quiz Questions'].map((tab) => (
            <button 
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              disabled={isGenerating}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="preview-content">
          {isGenerating ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Analyzing context and crafting your lesson prep...</p>
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

          <div className="mascot-dialog-container">
            <div className="dialog-bubble">
              {isGenerating 
                ? "Transforming your materials into a ready-to-use lesson plan..." 
                : generatedNotes 
                  ? "Here is your teaching prep! You can switch tabs to see different formats."
                  : "I'm ready! Upload or paste your reference materials above."}
            </div>
            <img src={actionFigureImg} alt="AI Mascot" className="dialog-mascot" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherNotesAI;
