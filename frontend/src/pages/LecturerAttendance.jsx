import React from 'react';
import { IconCheck, IconX, IconUser, IconMailOpened, IconEdit, IconDownload, IconChevronRight } from '@tabler/icons-react';
import './Attendance.css';

import actionFigure2Img from '../images/action-figure-2.png';
import qrSvg from '../images/qr.svg';

function LecturerAttendance() {
  return (
    <div className="attendance-page">
      <div className="page-header">
        <h1>Attendance Management</h1>
        <p>Start an attendance session and share the QR code with your class.</p>
      </div>

      <div className="attendance-grid">
        <div className="role-column" style={{ margin: '0 auto', maxWidth: '600px', width: '100%' }}>
          <div className="attendance-card">
            <h3 className="card-title">Start Attendance Session</h3>
            <button className="generate-btn">Generate QR Code</button>
            
            <div className="qr-display-box">
              <img src={qrSvg} alt="QR Code" className="qr-code-img" />
              <img src={actionFigure2Img} alt="Mascot" className="qr-mascot" />
            </div>

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

            <button className="action-btn">End Session</button>
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
