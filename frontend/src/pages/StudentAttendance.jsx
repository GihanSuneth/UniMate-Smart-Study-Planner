import React from 'react';
import { IconCheck, IconX, IconUser } from '@tabler/icons-react';
import './Attendance.css';

import actionFigure2Img from '../images/action-figure-2.png';
import qrSvg from '../images/qr.svg';

function StudentAttendance() {
  return (
    <div className="attendance-page">
      <div className="page-header">
        <h1>Attendance</h1>
        <p>Scan the QR code to mark your attendance for the session.</p>
      </div>

      <div className="attendance-grid">
        <div className="role-column" style={{ margin: '0 auto', maxWidth: '600px', width: '100%' }}>
          <div className="attendance-card">
            <h3 className="card-title">Scan QR Code</h3>
            
            <div className="qr-display-box">
              <img src={qrSvg} alt="QR Code" className="qr-code-img" />
              <img src={actionFigure2Img} alt="Mascot" className="qr-mascot" />
            </div>

            <button className="generate-btn scan-btn">Scan QR Code</button>

            <div className="attendance-status-block">
              <h4>Attendance Status: 82%</h4>
              
              <div className="status-cards">
                <div className="status-card present-card">
                  <div className="status-card-header">
                    <IconCheck size={18} stroke={3} /> Present
                  </div>
                  <div className="status-card-value">Present Days: 64</div>
                </div>
                
                <div className="status-card absent-card">
                  <div className="status-card-header">
                    <IconX size={18} stroke={3} /> Absent
                  </div>
                  <div className="status-card-value">Absent Days: 14</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side piece chart */}
        <div className="role-column" style={{ margin: '0 auto', maxWidth: '600px', width: '100%' }}>
          <div className="attendance-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 className="card-title" style={{ alignSelf: 'flex-start', width: '100%' }}>Module Attendance Overview</h3>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <div className="chart-container" style={{ position: 'relative', width: '220px', height: '220px', margin: '20px 0' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                  {/* Background Circle (Absent - Danger color) */}
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(238, 93, 80, 0.2)"
                    strokeWidth="4"
                  />
                  {/* Foreground Circle (Present - Success color) 82% */}
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#01b574"
                    strokeWidth="4"
                    strokeDasharray="82, 100"
                    strokeLinecap="round"
                    style={{ animation: 'fillChart 1.5s ease-out forwards' }}
                  />
                </svg>
                {/* Center Text */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-dark)' }}>82%</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>Present</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '32px', marginTop: '24px', backgroundColor: 'var(--bg-main)', padding: '16px 24px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#01b574' }}></div>
                    <span style={{ fontSize: '15px', color: 'var(--text-dark)', fontWeight: '600' }}>Present</span>
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>64 Days</span>
                </div>
                
                <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ee5d50' }}></div>
                    <span style={{ fontSize: '15px', color: 'var(--text-dark)', fontWeight: '600' }}>Absent</span>
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>14 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentAttendance;
