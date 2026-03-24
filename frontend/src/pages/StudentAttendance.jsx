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
        <div className="role-column" style={{ margin: '0 auto', maxWidth: '600px' }}>
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
      </div>
    </div>
  );
}

export default StudentAttendance;
