import React, { useState, useEffect, useRef } from 'react';
import { IconSettings, IconUser, IconCamera } from '@tabler/icons-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_ENDPOINTS } from '../api';
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
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    role: '',
    username: '',
    profilePic: '',
    assignedModules: [],
    academicYear: '',
    semester: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const fileInputRef = useRef(null);

  const [toggles, setToggles] = useState({
    email1: true,
    push1: true,
    email2: true,
    push2: true,
    weekly: true
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_ENDPOINTS.AUTH}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserData({
          fullName: data.fullName || '',
          email: data.email || '',
          role: data.role || '',
          username: data.username || '',
          profilePic: data.profilePic || '',
          assignedModules: data.assignedModules || [],
          academicYear: data.academicYear || '',
          semester: data.semester || ''
        });
      } else {
        toast.error('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('An error occurred while loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const name = e.target.fullName.value;
    const email = e.target.email.value;

    if (!name.trim() || !email.trim()) {
      toast.warning('Full Name and Email cannot be blank.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.AUTH}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName: name, email, profilePic: userData.profilePic })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(prev => ({ ...prev, fullName: updatedUser.fullName, email: updatedUser.email }));
        toast.success('Profile updated successfully!');
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while saving profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const currentPassword = e.target.currentPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.warning('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.AUTH}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.ok) {
        toast.success('Password updated successfully! Logging out...');
        e.target.reset();
        
        // Force logout after password change
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('_id');
          window.dispatchEvent(new Event('auth-change'));
          window.location.href = '/login/' + (userRoleStr.toLowerCase());
        }, 2000);
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to update password');
      }
    } catch (error) {
      toast.error('An error occurred while updating password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({ ...prev, profilePic: reader.result }));
        toast.info('Photo selected. Click "Save Changes" to apply.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const userRoleStr = userData.role || localStorage.getItem('userRole') || 'student';
  const isLecturer = userRoleStr.toLowerCase() === 'lecturer';
  const isAdmin = userRoleStr.toLowerCase() === 'admin';

  const displayName = userData.fullName || userData.username || (isAdmin ? 'System Admin' : isLecturer ? 'Dr. Smith' : 'John Doe');
  const displayEmail = userData.email || (isAdmin ? 'admin@unimate.com' : isLecturer ? 'smith@example.com' : 'john.doe@example.com');

  if (loading) return <div className="loading-spinner" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '18px', color: 'var(--text-secondary)' }}>Loading your profile...</div>;

  return (
    <div className="settings-page">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="page-header">
        <h1>Profile Activity</h1>
        <p>Here are your general profile configuration and preferences.</p>
      </div>

      <div className="settings-grid">
        {/* Left Column */}
        <div className="settings-main">

          {/* Profile Form */}
          <form className="settings-card" onSubmit={handleProfileUpdate}>
            <h3 className="card-title">Profile</h3>

            <div className="profile-top">
              <div className="avatar-wrapper" onClick={() => fileInputRef.current && fileInputRef.current.click()} title="Click to change photo">
                <img
                  src={userData.profilePic || 'https://i.pravatar.cc/150?img=11'}
                  alt="Profile avatar"
                  className="profile-avatar"
                />
                <div className="avatar-overlay">
                  <IconCamera size={22} color="#fff" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="upload-photo-btn"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                Change Photo
              </button>
            </div>

            <div className="profile-form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  defaultValue={displayName}
                  key={displayName}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  defaultValue={displayEmail}
                  key={displayEmail}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Role</label>
                <select
                  className="form-input form-select"
                  name="role"
                  defaultValue={isAdmin ? 'Admin' : isLecturer ? 'Lecturer' : 'Student'}
                  disabled={true}
                >
                  <option value="Student">Student</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-save" disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <div className="two-col-cards">
            {/* Security / Password Form */}
            <form className="settings-card" onSubmit={handlePasswordUpdate}>
              <h3 className="card-title">Security</h3>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" name="currentPassword" className="form-input" placeholder="Enter current password" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" name="newPassword" className="form-input" placeholder="Enter new password" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirmPassword" className="form-input" placeholder="Confirm new password" />
              </div>
              <button type="submit" className="btn-save" style={{ marginTop: 8 }} disabled={isUpdatingPassword}>
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            {/* Notifications Card */}
            <div className="settings-card">
              <h3 className="card-title">Notifications</h3>
              <h4 className="sub-title">{isAdmin ? 'Admin Settings' : isLecturer ? 'Lecturer Settings' : 'Student Settings'}</h4>

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

              <button className="btn-save" style={{ marginTop: 'auto' }}>Save Preferences</button>
            </div>
          </div>

          {/* Account Info Bar */}
          <div className="settings-card" style={{ padding: '24px' }}>
            <div className="user-list-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 16 }}>
              <div className="details-tab active" style={{ display: 'flex', gap: 8, fontSize: 16, fontWeight: 600 }}>
                {displayName}
                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconUser size={16} /> {userRoleStr}
                </div>
              </div>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>General account information view.</div>
          </div>

        </div>

        {/* Right Column */}
        <div className="settings-side">

          {isAdmin ? (
            <div className="profile-summary-card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(18, 28, 56, 0.04)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ flex: 1, zIndex: 2 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '16px' }}>Admin Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Name:</span>
                    <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>{displayName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Role:</span>
                    <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>Super Administrator</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Access Level:</span>
                    <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>Full System Access</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Last Login:</span>
                    <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>Just Now</span>
                  </div>
                </div>
              </div>
              <div style={{ zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={actionFigure4Img} alt="Mascot Helper" style={{ width: '110px', height: 'auto' }} />
              </div>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 1 }}></div>
              <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 1 }}></div>
            </div>
          ) : isLecturer ? (
            <div className="profile-summary-card" style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(18, 28, 56, 0.04)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ flex: 1, zIndex: 2 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '16px' }}>Lecturer Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Name:</span>
                    <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>{displayName}</span>
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
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 1 }}></div>
              <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 1 }}></div>
            </div>
          ) : (
            <div className="profile-summary-card" style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #e3edfe 100%)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(18, 28, 56, 0.04)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ flex: 1, zIndex: 2 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '16px' }}>Profile Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Name:</span>
                    <span style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600' }}>{displayName}</span>
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
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 1 }}></div>
              <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 1 }}></div>
            </div>
          )}

          {/* Modules & Academic Progress Section */}
          {!isAdmin && (
            <div className="settings-card" style={{ marginBottom: '24px' }}>
              <h3 className="card-title">{isLecturer ? 'Assigned Modules' : 'Enrolled Modules'}</h3>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Academic Info: </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>
                  {userData.academicYear || 'Not Set'} {userData.semester ? `| ${userData.semester}` : ''}
                </span>
              </div>
              <div className="modules-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {userData.assignedModules && userData.assignedModules.length > 0 ? (
                  userData.assignedModules.map((module, index) => (
                    <div key={index} style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{module}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px', gridColumn: '1/-1' }}>No modules assigned yet.</div>
                )}
              </div>
            </div>
          )}

          {/* Settings Sidebar Card */}
          <div className="settings-card settings-sidebar-card">
            <h3 className="card-title">Settings</h3>

            <div className="general-header">
              <IconSettings size={18} color="var(--primary)" /> General
            </div>

            <div className="toggle-row">
              <div className="toggle-header">
                <span className="toggle-label" style={{ fontSize: 13 }}>Email Notifications</span>
                <ToggleSwitch checked={toggles.email2} onChange={() => handleToggle('email2')} />
              </div>
              <div className="toggle-desc">Receive activity updates and alerts via email.</div>
            </div>

            <div className="toggle-row">
              <div className="toggle-header">
                <span className="toggle-label" style={{ fontSize: 13 }}>Push Notifications</span>
                <ToggleSwitch checked={toggles.push2} onChange={() => handleToggle('push2')} />
              </div>
              <div className="toggle-desc">Receive updates on your device.</div>
            </div>

            <div className="toggle-row">
              <div className="toggle-header">
                <span className="toggle-label" style={{ fontSize: 13 }}>Weekly Reports</span>
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
