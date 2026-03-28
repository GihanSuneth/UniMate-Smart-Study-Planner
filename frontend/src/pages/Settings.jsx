import React, { useState } from 'react';
import { IconSettings, IconUser } from '@tabler/icons-react';
import './Settings.css';
import actionFigure4Img from '../images/action-figure-4.png';

function ToggleSwitch({ checked, onChange }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider round"></span>
    </label>
  );
}

function Settings() {
  const [toggles, setToggles] = useState({
    email1: true,
    push1: true,
    email2: true,
    push2: true,
    weekly: true
  });

  const handleToggle = (key) => {
    setToggles(prev => ({...prev, [key]: !prev[key]}));
  };

  const userRoleStr = localStorage.getItem('userRole') || 'student';
  const isLecturer = userRoleStr.toLowerCase() === 'lecturer';

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Profile Activity</h1>
        <p>Here are your general profile configuration and preferences.</p>
      </div>

      <div className="settings-grid">
        {/* Left Column */}
        <div className="settings-main">
          
          <form className="settings-card" onSubmit={(e) => {
            e.preventDefault();
            const name = e.target.fullName.value;
            const email = e.target.email.value;
            if (!name.trim() || !email.trim()) {
              alert("Full Name and Email cannot be blank in Profile Settings.");
              return;
            }
            alert("Changes saved!");
          }}>
            <h3 className="card-title">Profile</h3>
            
            <div className="profile-top">
              <img src="https://i.pravatar.cc/150?img=11" alt="Profile avatar" className="profile-avatar" />
              <button type="button" className="upload-photo-btn">Upload New Photo</button>
            </div>

            <div className="profile-form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" className="form-input" defaultValue={isLecturer ? "Dr. Smith" : "John Doe"} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" className="form-input" defaultValue={isLecturer ? "smith@example.com" : "john.doe@example.com"} />
              </div>
              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label>Role</label>
                <select className="form-input form-select" name="role" defaultValue={isLecturer ? "Lecturer" : "Student"}>
                  <option value="Student">Student</option>
                  <option value="Lecturer">Lecturer</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-save">Save Changes</button>
          </form>

          <div className="two-col-cards">
            
            <form className="settings-card" onSubmit={(e) => {
              e.preventDefault();
              const currentP = e.target.currentPassword.value;
              const newP = e.target.newPassword.value;
              const confirmP = e.target.confirmPassword.value;
              if (!currentP.trim() || !newP.trim() || !confirmP.trim()) {
                alert("All password fields must be filled out and cannot be blank.");
                return;
              }
              alert("Password Updated successfully!");
            }}>
              <h3 className="card-title">Security</h3>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" name="currentPassword" className="form-input" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" name="newPassword" className="form-input" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirmPassword" className="form-input" />
              </div>
              <button type="submit" className="btn-save" style={{marginTop: 8}}>Update Password</button>
            </form>

            <div className="settings-card">
              <h3 className="card-title">Notifications</h3>
              <h4 className="sub-title">{isLecturer ? 'Lecturer Settings' : 'Student Settings'}</h4>
              
              <div className="toggle-row">
                <div className="toggle-header">
                  <span className="toggle-label">Email Notifications</span>
                  <ToggleSwitch checked={toggles.email1} onChange={() => handleToggle('email1')} />
                </div>
                <div className="toggle-desc">Receive activity updates and alerts via email.</div>
              </div>

              <div className="toggle-row">
                <div className="toggle-header">
                  <span className="toggle-label">Push Notifications</span>
                  <ToggleSwitch checked={toggles.push1} onChange={() => handleToggle('push1')} />
                </div>
                <div className="toggle-desc">Receive updates on your device.</div>
              </div>

              <button className="btn-save" style={{marginTop: 'auto'}}>Save Preferences</button>
            </div>

          </div>

          <div className="settings-card" style={{padding: '24px'}}>
             <div className="user-list-header" style={{borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 16}}>
               <div className="details-tab active" style={{display: 'flex', gap: 8, fontSize: 16, fontWeight: 600}}>
                 {isLecturer ? 'Dr. Smith' : 'John Doe'} <div style={{color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4}}><IconUser size={16}/> {isLecturer ? 'Lecturer' : 'Student'}</div>
               </div>
             </div>
             <div style={{color: 'var(--text-secondary)', fontSize: 14}}>General account information view.</div>
          </div>

        </div>

        {/* Right Column */}
        <div className="settings-side">
          
          {!isLecturer ? (
            <div className="profile-summary-card" style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #e3edfe 100%)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(18, 28, 56, 0.04)', position: 'relative', overflow: 'hidden' }}>
               <div style={{ flex: 1, zIndex: 2 }}>
                 <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '16px' }}>Profile Summary</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Name:</span>
                     <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>John Doe</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Year:</span>
                     <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>Year 3</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Semester:</span>
                     <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>Semester 2</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Program:</span>
                     <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>BSc. IT</span>
                   </div>
                 </div>
               </div>
               
               <div style={{ zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 <img src={actionFigure4Img} alt="Mascot Helper" style={{ width: '110px', height: 'auto' }} />
               </div>
               
               {/* Decorative background circles */}
               <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 1 }}></div>
               <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 1 }}></div>
            </div>
          ) : (
            <div className="profile-summary-card" style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(18, 28, 56, 0.04)', position: 'relative', overflow: 'hidden' }}>
               <div style={{ flex: 1, zIndex: 2 }}>
                 <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '16px' }}>Lecturer Profile</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Name:</span>
                     <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>Dr. Smith</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Department:</span>
                     <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>Computing</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Modules:</span>
                     <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>CS101, IT202</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Faculty:</span>
                     <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>FOC</span>
                   </div>
                 </div>
               </div>
               
               <div style={{ zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 <img src={actionFigure4Img} alt="Mascot Helper" style={{ width: '110px', height: 'auto' }} />
               </div>
               
               {/* Decorative background circles */}
               <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 1 }}></div>
               <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 1 }}></div>
            </div>
          )}

          <div className="settings-card settings-sidebar-card">
             <h3 className="card-title">Settings</h3>
             
             <div className="general-header">
               <IconSettings size={18} color="var(--primary)" /> General
             </div>

             <div className="toggle-row">
                <div className="toggle-header">
                  <span className="toggle-label" style={{fontSize: 13}}>Email Notifications</span>
                  <ToggleSwitch checked={toggles.email2} onChange={() => handleToggle('email2')} />
                </div>
                <div className="toggle-desc">Receive activity updates and alerts via email.</div>
              </div>

              <div className="toggle-row">
                <div className="toggle-header">
                  <span className="toggle-label" style={{fontSize: 13}}>Push Notifications</span>
                  <ToggleSwitch checked={toggles.push2} onChange={() => handleToggle('push2')} />
                </div>
                <div className="toggle-desc">Receive updates on your device.</div>
              </div>

              <div className="toggle-row">
                <div className="toggle-header">
                  <span className="toggle-label" style={{fontSize: 13}}>Weekly Reports</span>
                  <ToggleSwitch checked={toggles.weekly} onChange={() => handleToggle('weekly')} />
                </div>
                <div className="toggle-desc">Receive weekly summaries of CS101. Consider including interactive quizzes.</div>
              </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Settings;
