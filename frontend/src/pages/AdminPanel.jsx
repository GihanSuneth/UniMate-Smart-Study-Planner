import React, { useState } from 'react';
import { IconShieldLock, IconUsers, IconCalendarStats, IconChartPie } from '@tabler/icons-react';
import './AdminPanel.css';

function AdminPanel() {
  const [pendingReqs, setPendingReqs] = useState(() => {
    return JSON.parse(localStorage.getItem('pendingLecturerReqs')) || [];
  });

  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@student.unimate.edu', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: 2, name: 'Dr. Jane Smith', email: 'jane.smith@faculty.unimate.edu', role: 'Lecturer', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 3, name: 'Admin User', email: 'admin@unimate.edu', role: 'Admin', avatar: 'https://i.pravatar.cc/150?img=8' },
    { id: 4, name: 'Alice Johnson', email: 'alice@student.unimate.edu', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=9' },
  ]);

  const [attendanceRecords] = useState([
    { id: 1, student: 'John Doe', course: 'Computer Science 101', date: 'Oct 24, 2026', status: 'Present' },
    { id: 2, student: 'Alice Johnson', course: 'Data Structures', date: 'Oct 24, 2026', status: 'Absent' },
    { id: 3, student: 'Michael Brown', course: 'Machine Learning', date: 'Oct 23, 2026', status: 'Present' },
    { id: 4, student: 'Sarah Adams', course: 'Web Development', date: 'Oct 23, 2026', status: 'Present' },
  ]);

  const handleRoleChange = (id, newRole) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, role: newRole } : user
    ));
  };

  const removePendingReq = (id) => {
    const updated = pendingReqs.filter(r => r.id !== id);
    setPendingReqs(updated);
    localStorage.setItem('pendingLecturerReqs', JSON.stringify(updated));
  };

  const handleApprove = (req) => {
    const newUser = {
      id: Date.now(),
      name: req.name,
      email: req.email,
      role: 'Lecturer',
      avatar: `https://i.pravatar.cc/150?u=${req.name}`
    };
    setUsers([...users, newUser]);
    removePendingReq(req.id);
  };

  const handleDecline = (reqId) => {
    removePendingReq(reqId);
  };

  return (
    <div className="admin-panel-page">
      <div className="admin-header">
        <h1>Admin Control Panel</h1>
        <p>Manage users, view system-wide attendance, and monitor analytics.</p>
      </div>

      <div className="admin-grid">
        {/* Pending Lecturer Requests */}
        {pendingReqs.length > 0 && (
          <div className="admin-card full-width" style={{ border: '1px solid #eab308', backgroundColor: '#fefce8' }}>
            <div className="card-header" style={{ borderBottomColor: '#fef08a' }}>
              <h3 style={{ color: '#854d0e' }}><IconUsers size={20} className="header-icon" /> Pending Lecturer Signups</h3>
            </div>
            <div className="users-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Lecturer ID</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReqs.map(req => (
                    <tr key={req.id}>
                      <td><strong>{req.name}</strong></td>
                      <td>{req.lecturerId}</td>
                      <td>{req.email}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleApprove(req)} style={{ padding: '6px 12px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                          <button onClick={() => handleDecline(req.id)} style={{ padding: '6px 12px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Decline</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Role Assignment Section */}
        <div className="admin-card full-width">
          <div className="card-header">
            <h3><IconUsers size={20} className="header-icon" /> Manage Users & Roles</h3>
          </div>
          <div className="users-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Assign Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <img src={user.avatar} alt={user.name} />
                        <strong>{user.name}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="role-select" 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="Student">Student</option>
                        <option value="Lecturer">Lecturer</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Monitoring Section */}
        <div className="admin-card">
          <div className="card-header">
            <h3><IconCalendarStats size={20} className="header-icon" /> Recent Attendance logs</h3>
          </div>
          <div className="attendance-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map(record => (
                  <tr key={record.id}>
                    <td><strong>{record.student}</strong><br/><span style={{fontSize: '12px', color: 'var(--text-secondary)'}}>{record.date}</span></td>
                    <td>{record.course}</td>
                    <td>
                      <span className={`attendance-badge ${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="admin-card">
          <div className="card-header">
            <h3><IconChartPie size={20} className="header-icon" /> System Analytics</h3>
          </div>
          <div className="analytics-overview">
            <div className="stat-box">
              <h4>Total Users</h4>
              <div className="stat-number">1,452</div>
              <div className="stat-change up">+12% this month</div>
            </div>
            <div className="stat-box">
              <h4>Avg. Attendance</h4>
              <div className="stat-number">86%</div>
              <div className="stat-change up">+4% this week</div>
            </div>
            <div className="stat-box">
              <h4>Notes Generated</h4>
              <div className="stat-number">8,940</div>
              <div className="stat-change up">+42% this month</div>
            </div>
            <div className="stat-box">
              <h4>Active Quizzes</h4>
              <div className="stat-number">342</div>
              <div className="stat-change down">-2% this week</div>
            </div>
            <div className="stat-box" style={{gridColumn: '2 / -1'}}>
              <h4>System Health</h4>
              <div className="stat-number" style={{color: 'var(--success)'}}>100% Operational</div>
              <div className="stat-change">No issues reported</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminPanel;
