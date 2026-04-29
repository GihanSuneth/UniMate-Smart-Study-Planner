import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  IconDownload, IconCopy, IconCheck, IconRobot,
  IconFilter, IconCloudUpload, IconTrash
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BASE_URL } from '../api';
import './NotesAI.css';
import actionFigureImg from '../images/action-figure-1.png';

const MODE_CONFIG = {
  smart_notes: {
    title: 'Smart Notes Generator',
    previewTitle: 'Smart Notes Preview',
    buttonLabel: 'Smart Notes',
    defaultTabs: ['Summary', 'Key Points', 'Deep Dive', 'Quiz Ideas'],
    loadingText: 'Analyzing context and crafting your notes...',
    bubbleIdle: "I'm ready! Upload or paste your rough notes above.",
    bubbleGenerated: 'Here are your structured notes! You can switch tabs to see different formats.',
    bubbleGenerating: 'Transforming your rough notes into clear, detailed study notes. Give me a moment...',
    emptyState: 'Your generated notes will appear here once you upload a file or paste text and click "Generate Smart Notes".',
    historyEmpty: 'No Smart Notes history found for this module.',
    historyLabel: 'SMART NOTES',
    downloadTitle: 'UniMate Smart Study Notes',
    historyTitlePrefix: 'Smart Notes',
    notificationText: (module) => `Smart Notes generated for ${module}!`
  },
  exam_prep: {
    title: 'Exam Prep Generator',
    previewTitle: 'Exam Prep Preview',
    buttonLabel: 'Exam Preparation',
    defaultTabs: ['Exam Snapshot', 'Must Remember', 'High-Risk Areas', 'Rapid Review'],
    loadingText: 'Compressing the material into a high-yield exam pack...',
    bubbleIdle: "I'm ready! Upload a large file or paste content and I'll compress it into exam-first revision notes.",
    bubbleGenerated: 'Your exam prep pack is ready. Everything here is compressed for fast revision.',
    bubbleGenerating: 'Compressing your material into a minimal, high-yield exam revision pack...',
    emptyState: 'Your compressed exam prep notes will appear here once you upload a file or paste text and click "Generate Exam Preparation".',
    historyEmpty: 'No Exam Prep history found for this module.',
    historyLabel: 'EXAM PREP',
    downloadTitle: 'UniMate Exam Preparation Pack',
    historyTitlePrefix: 'Exam Prep',
    notificationText: (module) => `Exam Prep generated for ${module}!`
  }
};

function inferModeFromItem(item) {
  if (item?.generatorMode) return item.generatorMode;
  if (item?.content?.['Exam Snapshot']) return 'exam_prep';
  return 'smart_notes';
}

function StudentNotesAI() {
  const [file, setFile] = useState(null);
  const [textNotes, setTextNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generationMode, setGenerationMode] = useState('smart_notes');
  const [activeTab, setActiveTab] = useState(MODE_CONFIG.smart_notes.defaultTabs[0]);
  const [targetModule, setTargetModule] = useState('General');
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [generatedMode, setGeneratedMode] = useState('smart_notes');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [filterModule, setFilterModule] = useState('All');
  const [modules, setModules] = useState([]);
  const [fileContent, setFileContent] = useState('');
  const fileInputRef = useRef(null);

  const currentConfig = MODE_CONFIG[generationMode];

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/activity?module=${filterModule}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        const filteredHistory = data.filter((item) => (
          item.type === 'notes_generated' && inferModeFromItem(item) === generationMode
        ));
        setHistory(filteredHistory);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        const enrolled = data.enrolledModules || [];
        setModules(enrolled);
        if (enrolled.length > 0) {
          setTargetModule(enrolled[0]);
        }
      }
    } catch (err) {
      console.error('Profile fetch error', err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [filterModule, generationMode]);

  const switchMode = (mode) => {
    setGenerationMode(mode);
    setActiveTab(MODE_CONFIG[mode].defaultTabs[0]);
    if (generatedMode !== mode) {
      setGeneratedNotes(null);
    }
    setError('');
    setCopied(false);
  };

  const loadHistoryItem = (item) => {
    const itemMode = inferModeFromItem(item);
    const tabs = Object.keys(item.content || {});
    setGenerationMode(itemMode);
    setGeneratedMode(itemMode);
    setGeneratedNotes(item.content);
    setActiveTab(tabs[0] || MODE_CONFIG[itemMode].defaultTabs[0]);
  };

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

  const handleDragOver = (e) => e.preventDefault();

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
    setFileContent('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateClick = async () => {
    if (!file && !textNotes.trim()) {
      setError(
        generationMode === 'exam_prep'
          ? 'Please upload a file or paste your study material first.'
          : 'Please upload a file or paste your rough notes first.'
      );
      return;
    }

    setError('');
    setIsGenerating(true);
    setGeneratedNotes(null);
    setGeneratedMode(generationMode);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'notes',
          data: {
            module: targetModule,
            notes: [fileContent, textNotes].filter(Boolean).join('\n\n--- Document Text ---\n\n'),
            fileName: file ? file.name : null,
            generationMode
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.warning('Gemini AI Quota Exceeded. Please wait 60 seconds before retrying.');
          setIsGenerating(false);
          return;
        }
        throw new Error('Failed to generate notes from AI');
      }

      const newNotesObj = await response.json();
      const firstTab = Object.keys(newNotesObj)[0] || MODE_CONFIG[generationMode].defaultTabs[0];

      setGeneratedNotes(newNotesObj);
      setActiveTab(firstTab);
      setIsGenerating(false);

      await fetch(`${BASE_URL}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'notes_generated',
          generatorMode: generationMode,
          module: targetModule,
          title: `${MODE_CONFIG[generationMode].historyTitlePrefix}: ${file ? file.name : targetModule}`,
          content: newNotesObj
        })
      });

      fetchHistory();
      window.dispatchEvent(new CustomEvent('new-notification', {
        detail: { text: MODE_CONFIG[generationMode].notificationText(targetModule) }
      }));
    } catch (err) {
      console.error('AI Generation Error:', err);
      setError('Failed to reach AI. Please try again later.');
      setIsGenerating(false);
      toast.error('AI Service is temporarily unavailable.');
    }
  };

  const handleCopy = () => {
    if (!generatedNotes || !generatedNotes[activeTab]) return;
    const tabContent = Array.isArray(generatedNotes[activeTab])
      ? generatedNotes[activeTab].join('\n\n')
      : JSON.stringify(generatedNotes[activeTab], null, 2);
    navigator.clipboard.writeText(tabContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedNotes) return;
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229);
      doc.text(MODE_CONFIG[generatedMode].downloadTitle, 14, 22);

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
        const entries = Array.isArray(generatedNotes[tab]) ? generatedNotes[tab] : [String(generatedNotes[tab])];
        const lines = entries.map((item) => `• ${item}`);
        const splitText = doc.splitTextToSize(lines.join('\n\n'), 180);
        doc.text(splitText, 14, cursorY);
        cursorY += (splitText.length * 7) + 15;

        if (cursorY > 270) {
          doc.addPage();
          cursorY = 20;
        }
      });

      doc.save(`UniMate_${generatedMode}_${targetModule}_${Date.now()}.pdf`);
      toast.success('PDF Downloaded Successfully!');
    } catch (err) {
      console.error('PDF Export Error:', err);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const visibleTabs = generatedNotes ? Object.keys(generatedNotes) : currentConfig.defaultTabs;
  const previewMode = generatedNotes ? generatedMode : generationMode;
  const previewConfig = MODE_CONFIG[previewMode];
  const activeContent = generatedNotes?.[activeTab];

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
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {isGenerating
              ? currentConfig.bubbleGenerating
              : generatedNotes
                ? MODE_CONFIG[generatedMode].bubbleGenerated
                : currentConfig.bubbleIdle}
          </motion.div>
          <motion.img
            src={actionFigureImg}
            alt="AI Mascot"
            className="dialog-mascot"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="page-header">
        <h1>Student Notes AI</h1>
        <p>Students have two separate AI tools: one for detailed smart notes and one for compressed exam preparation.</p>

        <div className="top-level-tabs" style={{ display: 'flex', gap: '16px', marginTop: '24px', borderBottom: '2px solid var(--border-color)', paddingBottom: '0' }}>
          <button
            className={`tab ${generationMode === 'smart_notes' ? 'active' : ''}`}
            onClick={() => switchMode('smart_notes')}
            style={{ padding: '12px 24px', backgroundColor: 'transparent', border: 'none', borderBottom: generationMode === 'smart_notes' ? '3px solid var(--primary)' : '3px solid transparent', fontSize: '16px', fontWeight: '600', color: generationMode === 'smart_notes' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: '0.2s', marginBottom: '-2px' }}
          >
            Smart Notes Generator
          </button>
          <button
            className={`tab ${generationMode === 'exam_prep' ? 'active' : ''}`}
            onClick={() => switchMode('exam_prep')}
            style={{ padding: '12px 24px', backgroundColor: 'transparent', border: 'none', borderBottom: generationMode === 'exam_prep' ? '3px solid var(--primary)' : '3px solid transparent', fontSize: '16px', fontWeight: '600', color: generationMode === 'exam_prep' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: '0.2s', marginBottom: '-2px' }}
          >
            Exam Prep Generator
          </button>
        </div>
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
                    <p style={{ margin: '0 20px', fontSize: '14px' }}>
                      {generationMode === 'exam_prep'
                        ? 'Upload or drop a large study file here for compression...'
                        : 'Upload or drop study materials here...'}
                    </p>
                  </div>
                )}
              </div>

              <button
                className="btn-primary generate-btn"
                onClick={handleGenerateClick}
                disabled={isGenerating}
                style={{ width: 'max-content', padding: '12px 24px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer' }}
              >
                {isGenerating ? `Generating ${currentConfig.buttonLabel}...` : `Generate ${currentConfig.buttonLabel}`}
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
                    onChange={(e) => setTargetModule(e.target.value)}
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
                placeholder={generationMode === 'exam_prep'
                  ? 'Paste long lecture notes, documents, or revision content here to compress into a minimal exam pack...'
                  : 'Paste your rough notes here...'}
                style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', resize: 'none', backgroundColor: '#ffffff', minHeight: '280px' }}
              />
            </div>
          </div>

          {error && <div className="error-message" style={{ marginTop: '20px' }}>{error}</div>}

          <div className="preview-section" style={{ marginTop: '24px' }}>
            <div className="preview-header">
              <div className="preview-title">
                <h3>{previewConfig.previewTitle}</h3>
                {isGenerating && <span className="status-text">{currentConfig.loadingText}</span>}
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
              {[...visibleTabs, 'Show Previous Record'].map((tab) => (
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
                  <p>{currentConfig.loadingText}</p>
                </div>
              ) : activeTab === 'Show Previous Record' ? (
                <div className="history-tab-content">
                  <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IconFilter size={20} color="var(--text-secondary)" />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Filter by Module:</span>
                    <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px' }} value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
                      <option value="All">All Modules</option>
                      {modules.map((mod, idx) => (
                        <option key={idx} value={mod}>{mod}</option>
                      ))}
                    </select>
                  </div>
                  <div className="history-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {history.length === 0 ? (
                      <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>{currentConfig.historyEmpty}</p>
                    ) : history.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => loadHistoryItem(item)}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: item.isShared ? '2.5px solid #6366f1' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: '0.2s',
                          backgroundColor: 'white',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.isShared ? '#6366f1' : 'var(--primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = item.isShared ? '#6366f1' : 'var(--border-color)'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)' }}>{item.title || 'Generated Notes'}</div>
                          {item.isShared && <IconRobot size={18} color="#6366f1" />}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ backgroundColor: item.isShared ? '#eef2ff' : 'var(--secondary)', color: item.isShared ? '#6366f1' : 'var(--primary)', padding: '4px 8px', borderRadius: '6px', fontWeight: '800' }}>
                            {item.module}
                          </span>
                          <span style={{ backgroundColor: '#f8fafc', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>
                            {inferModeFromItem(item) === 'exam_prep' ? MODE_CONFIG.exam_prep.historyLabel : MODE_CONFIG.smart_notes.historyLabel}
                          </span>
                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : generatedNotes && Array.isArray(activeContent) ? (
                <ul className={`notes-list ${activeTab === 'Summary' || activeTab === 'Exam Snapshot' ? 'summary-style' : ''}`}>
                  {activeContent.map((item, index) => {
                    const parts = item.split(':');
                    if (parts.length > 1 && activeTab !== 'Summary' && activeTab !== 'Exam Snapshot') {
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
                  <p>{currentConfig.emptyState}</p>
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
