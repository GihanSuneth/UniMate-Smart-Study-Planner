import React, { useState, useRef } from 'react';
import { IconCloudUpload, IconPlus, IconDeviceFloppy, IconDotsVertical, IconDownload, IconCopy, IconCheck, IconTrash } from '@tabler/icons-react';
import './NotesAI.css';
import actionFigureImg from '../images/action-figure-1.png';

function NotesAI() {
  const [file, setFile] = useState(null);
  const [textNotes, setTextNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Summary');
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
      setError('Please upload a file or paste your rough notes first.');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGeneratedNotes(null);

    // Mock AI API Call
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedNotes({
        Summary: [
          "Machine Learning is a subset of AI where computers learn from data and make decisions with minimal human intervention.",
          "It fundamentally relies on using algorithms to parse data, learn from it, and then make a determination or prediction.",
          "Data preprocessing and building pipelines are core components before any model training can begin."
        ],
        'Key Points': [
          "Linear Regression is used for predicting numerical values.",
          "Decision Trees are primarily for classification.",
          "Neural Networks handle complex pattern recognition.",
          "Data Collection, Preprocessing, and Model Training are the essential phases of ML development."
        ],
        Definitions: [
          "Artificial Intelligence (AI): The theory and development of computer systems able to perform tasks that normally require human intelligence.",
          "Data Preprocessing: The process of cleaning and transforming raw data into a useful and understandable format.",
          "Model Training: The phase where the learning algorithm is applied to the training data."
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
        <h1>Notes AI</h1>
        <p>Generate structured notes with AI from your rough notes.</p>
      </div>

      <div className="upload-section">
        <div className="upload-card">
          <div className="upload-header">
            <h3>Rough Notes</h3>
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
          {['Summary', 'Key Points', 'Definitions'].map((tab) => (
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
              <p>Analyzing context and crafting your notes...</p>
            </div>
          ) : generatedNotes ? (
            <ul className={`notes-list ${activeTab === 'Summary' ? 'summary-style' : ''}`}>
               {generatedNotes[activeTab].map((item, index) => {
                 // Bold the first part if there's a colon for definitions/key points
                 const parts = item.split(':');
                 if (parts.length > 1 && (activeTab === 'Definitions' || activeTab === 'Key Points')) {
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

          <div className="mascot-dialog-container">
            <div className="dialog-bubble">
              {isGenerating 
                ? "Transforming your rough notes into clear, structured notes. Give me a moment..." 
                : generatedNotes 
                  ? "Here are your structured notes! You can switch tabs to see different formats."
                  : "I'm ready! Upload or paste your rough notes above."}
            </div>
            <img src={actionFigureImg} alt="AI Mascot" className="dialog-mascot" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesAI;
