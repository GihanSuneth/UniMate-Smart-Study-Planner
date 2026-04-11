import React, { useState, useEffect } from 'react';
import { IconShieldLock, IconUsers, IconCalendarStats, IconChartPie, IconRefresh } from '@tabler/icons-react';
import { BASE_URL } from '../api';
import './AdminPanel.css';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [attendanceRecords] = useState([
    { id: 1, student: 'John Doe', course: 'Computer Science 101', date: 'Oct 24, 2026', status: 'Present' },
    { id: 2, student: 'Alice Johnson', course: 'Data Structures', date: 'Oct 24, 2026', status: 'Absent' },
    { id: 3, student: 'Michael Brown', course: 'Machine Learning', date: 'Oct 23, 2026', status: 'Present' },
    { id: 4, student: 'Sarah Adams', course: 'Web Development', date: 'Oct 23, 2026', status: 'Present' },
  ]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Backend server not reachable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/auth/approve/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      console.error('Approve failed', err);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this signup request?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/auth/reject/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      console.error('Reject failed', err);
    }
  };

  const pendingReqs = users.filter(u => u.status === 'pending');
  const activeUsers = users.filter(u => u.status === 'approved');
  const rejectedUsers = users.filter(u => u.status === 'rejected');

  const handleRoleChange = (id, newRole) => {
    // Role change logic could be added here
  };

  if (loading && users.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Admin Panel...</div>;
  }

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
                    <tr key={req._id}>
                      <td><strong>{req.username}</strong></td>
                      <td>{req.role}</td>
                      <td>{req.email}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleApprove(req._id)} style={{ padding: '6px 12px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Approve</button>
                          <button onClick={() => handleReject(req._id)} style={{ padding: '6px 12px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Reject</button>
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        <div style={{width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><IconUsers size={16}/></div>
                        <strong>{user.username}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--success)', fontSize: '12px', fontWeight: 600 }}>Approved</span>
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
