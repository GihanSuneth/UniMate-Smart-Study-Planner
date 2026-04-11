import React, { useState } from 'react';
import { IconCheck, IconX, IconUser, IconMailOpened, IconEdit, IconDownload, IconChevronRight, IconTrash } from '@tabler/icons-react';
import './Attendance.css';

import actionFigure2Img from '../images/action-figure-2.png';
import qrSvg from '../images/qr.svg';

function LecturerAttendance() {
  const [showModal, setShowModal] = useState(false);
  const [moduleCode, setModuleCode] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  const handleGenerateClick = () => {
    setShowModal(true);
    setSessionEnded(false);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if(moduleCode && moduleName) {
      setQrGenerated(true);
      setShowModal(false);
    }
  };

  const handleRemoveQr = () => {
    setQrGenerated(false);
  };

  const handleEndSession = () => {
    setSessionEnded(true);
    setQrGenerated(false);
    setModuleCode('');
    setModuleName('');
  };

  return (
    <div className="attendance-page">
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-main, #ffffff)', padding: '24px', borderRadius: '16px', width: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-dark)' }}>Generate QR Code</h3>
            <form onSubmit={handleModalSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Module Code</label>
                <input 
                  type="text" 
                  value={moduleCode}
                  onChange={(e) => setModuleCode(e.target.value)}
                  placeholder="e.g. IT3030"
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-dark)', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', fontSize: '15px' }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Module Name</label>
                <input 
                  type="text" 
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g. Software Architecture"
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-dark)', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', fontSize: '15px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--primary, #266df1)', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="page-header">
        <h1>Attendance Management</h1>
        <p>Start an attendance session and share the QR code with your class.</p>
      </div>

      <div className="attendance-grid">
        <div className="role-column" style={{ margin: '0 auto', maxWidth: '600px', width: '100%' }}>
          <div className="attendance-card">
            <h3 className="card-title">Start Attendance Session</h3>
            
            {sessionEnded && (
              <div style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>
                Session Ended!
              </div>
            )}

            <button className="generate-btn" onClick={handleGenerateClick}>Generate QR Code</button>
            
            <div className="qr-display-box" style={{ position: 'relative' }}>
              {qrGenerated ? (
                <>
                  <img src={qrSvg} alt="QR Code" className="qr-code-img" />
                  <button 
                    onClick={handleRemoveQr}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', border: '1px solid #ffcccc', borderRadius: '50%', padding: '8px', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10, transition: 'all 0.2s' }}
                    title="Remove QR Image"
                  >
                    <IconTrash size={20} />
                  </button>
                </>
              ) : (
                <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: '2px dashed var(--border-color)', borderRadius: '12px', zIndex: 1, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  No QR Generated
                </div>
              )}
              <img src={actionFigure2Img} alt="Mascot" className="qr-mascot" />
            </div>

            {moduleCode && moduleName && qrGenerated && (
              <div style={{ textAlign: 'center', marginBottom: '20px', padding: '12px', backgroundColor: 'var(--bg-main, #fff)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--text-dark)', fontSize: '16px' }}>{moduleCode}</strong>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{moduleName}</div>
              </div>
            )}

            <div className="status-indicators">
              <div className="status-item present">
                 <IconCheck size={20} color="var(--success)" stroke={3} />
                 <span>Students Present: <span className="count">35</span></span>
              </div>
              <div className="status-item absent">
                 <IconX size={20} color="var(--danger)" stroke={3} />
                 <span>Absent: <span className="count">4</span></span>
              </div>
            </div>

            <button className="action-btn" onClick={handleEndSession}>End Session</button>
          </div>
        </div>

        {/* Right side: Who submitted the QR */}
        <div className="role-column" style={{ margin: '0 auto', maxWidth: '600px', width: '100%' }}>
          <div className="attendance-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Who submitted the QR</h3>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#e6f0ff', color: '#266df1', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                <IconDownload size={18} />
                <span style={{ fontSize: '13px' }}>CSV</span>
              </button>
            </div>
            
            <div className="submissions-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
              {[
                { id: 'IT23288126', name: 'Gajanayaka D G S', module: 'IT3030', ys: 'Year 3 Semester 2' },
                { id: 'IT23288127', name: 'Perera A M', module: 'IT3030', ys: 'Year 3 Semester 2' },
                { id: 'IT23288128', name: 'Silva K L', module: 'IT3030', ys: 'Year 3 Semester 2' },
                { id: 'IT23288129', name: 'Fernando P Q', module: 'IT3030', ys: 'Year 3 Semester 2' },
                { id: 'IT23288130', name: 'Rajapaksha T R', module: 'IT3030', ys: 'Year 3 Semester 2' },
                { id: 'IT23288131', name: 'Kumara V W', module: 'IT3030', ys: 'Year 3 Semester 2' },
                { id: 'IT23288132', name: 'Bandara S T', module: 'IT3030', ys: 'Year 3 Semester 2' },
                { id: 'IT23288133', name: 'Jayasooriya N M', module: 'IT3030', ys: 'Year 3 Semester 2' },
              ].map((student, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--text-dark)', fontSize: '15px' }}>{student.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', backgroundColor: '#e6f0ff', padding: '2px 8px', borderRadius: '12px' }}>{student.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <span>{student.module}</span>
                    <span>{student.ys}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-main)'; e.currentTarget.style.color = 'var(--text-dark)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              See all students <IconChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LecturerAttendance;
