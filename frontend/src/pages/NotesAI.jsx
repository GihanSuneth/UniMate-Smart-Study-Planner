import React from 'react';
import { IconCloudUpload, IconPlus, IconDeviceFloppy, IconDotsVertical, IconDownload } from '@tabler/icons-react';
import './NotesAI.css';
import actionFigureImg from '../images/action-figure-1.png';

function NotesAI() {
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
          <div className="dropzone">
            <div className="cloud-icon-wrapper"><IconCloudUpload size={28} /></div>
            <p>Upload or drop your lecture notes here...</p>
          </div>
          <button className="btn-primary generate-btn">Generate Smart Notes</button>
        </div>

        <div className="upload-card">
          <div className="upload-header with-actions">
            <h3>Paste Text</h3>
            <div className="actions">
              <button className="btn-ghost"><IconPlus size={16} /> Upload File</button>
              <button className="icon-btn-small"><IconDeviceFloppy size={18} /></button>
              <button className="icon-btn-small"><IconDotsVertical size={18} /></button>
            </div>
          </div>
          <div className="text-area-wrapper">
            <textarea placeholder="Paste your rough notes here..."></textarea>
          </div>
        </div>
      </div>

      <div className="preview-section">
        <div className="preview-header">
          <div className="preview-title">
            <h3>Smart Notes Preview</h3>
            <span className="status-text">Generating AI-powered notes...</span>
          </div>
          <div className="preview-actions">
            <button className="btn-outline"><IconDownload size={16} /> Download PDF</button>
            <button className="btn-outline">Copy Notes</button>
          </div>
        </div>

        <div className="tabs-container">
          <button className="tab active">Summary</button>
          <button className="tab">Key Points</button>
          <button className="tab">Definitions</button>
        </div>

        <div className="preview-content">
          <ul className="notes-list">
            <li><strong>Machine Learning</strong> is a subset of AI where computers learn from data and make decisions with minimal human intervention.</li>
            <li>There are several types of Machine Learning algorithms, including:
              <ul>
                <li><strong>Linear Regression</strong> for predicting numerical values</li>
                <li><strong>Decision Trees</strong> for classification</li>
                <li><strong>Neural Networks</strong> for complex pattern recognition</li>
              </ul>
            </li>
            <li>Steps in building a Machine Learning model:
              <ol>
                <li><strong>Data Collection:</strong> Gather and prepare data.</li>
                <li><strong>Data Preprocessing:</strong> Clean and transform data for analysis.</li>
                <li><strong>Model Training:</strong> Use the data to train the machine learning model.</li>
              </ol>
            </li>
          </ul>

          <div className="mascot-dialog-container">
            <div className="dialog-bubble">
              Transforming your rough notes into clear, structured notes. Give me a moment...
            </div>
            <img src={actionFigureImg} alt="AI Mascot" className="dialog-mascot" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesAI;
