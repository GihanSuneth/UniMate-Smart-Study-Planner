import React, { useState, useEffect, useRef } from 'react';
import { 
  IconShieldLock, 
  IconUsers, 
  IconCalendarStats, 
  IconChartPie, 
  IconRefresh, 
  IconSearch, 
  IconUpload, 
  IconTrash, 
  IconEdit, 
  IconX,
  IconCheck,
  IconLock,
  IconLockOpen
} from '@tabler/icons-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../api';
import './AdminPanel.css';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchId, setSearchId] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    role: '',
    academicYear: '',
    semester: '',
    assignedModules: '',
    status: ''
  });

  // Sensitive Data State
  const [verifyingUser, setVerifyingUser] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [revealedUsers, setRevealedUsers] = useState({}); // { userId: true }

  const fileInputRef = useRef(null);

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
        toast.error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Backend server not reachable');
      toast.error('Backend server not reachable');
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
        toast.success('User approved');
        fetchUsers();
      }
    } catch (err) {
      toast.error('Approve failed');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/auth/reject/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        toast.success('User rejected');
        fetchUsers();
      }
    } catch (err) {
      toast.error('Reject failed');
    }
  };

  const handleDelete = async (user) => {
    if (user.role === 'admin') {
      toast.error('Admin users cannot be deleted.');
      return;
    }
    if (!window.confirm("FATAL: Delete this user permanently?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/auth/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        toast.success('User deleted permanently');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Delete failed');
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/auth/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: adminPassword })
      });
      if (response.ok) {
        setRevealedUsers(prev => ({ ...prev, [verifyingUser._id]: true }));
        setVerifyingUser(null);
        setAdminPassword('');
        toast.success('Identity verified. Data unlocked.');
      } else {
        toast.error('Invalid admin password');
      }
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  const handleResetPassword = async (userId, newPassword) => {
    if (!newPassword) {
      toast.error('Please enter a temporary password');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/auth/admin/reset-password/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      if (response.ok) {
        toast.success('Temporary password set successfully');
        setTempPassword('');
        // Toggle view back
        setRevealedUsers(prev => ({ ...prev, [userId]: false }));
      } else {
        toast.error('Failed to reset password');
      }
    } catch (err) {
      toast.error('Error during password reset');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      role: user.role,
      academicYear: user.academicYear || '',
      semester: user.semester || '',
      assignedModules: (user.assignedModules || []).join(', '),
      status: user.status
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...editForm,
        assignedModules: editForm.assignedModules.split(',').map(m => m.trim()).filter(m => m)
      };
      const response = await fetch(`${BASE_URL}/auth/admin/update/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        toast.success('User details updated');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const jsonUsers = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        if (values.length < 2) return null;
        
        const userObj = {};
        headers.forEach((header, i) => {
          if (header === 'assignedmodules') {
            userObj.assignedModules = values[i] ? values[i].split(';').map(m => m.trim()) : [];
          } else {
            userObj[header] = values[i];
          }
        });
        return userObj;
      }).filter(u => u && u.username);

      if (jsonUsers.length === 0) {
        toast.error('No valid user data found in CSV');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/auth/bulk-update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ users: jsonUsers })
        });
        const result = await response.json();
        if (response.ok) {
          toast.success(`Bulk Upload Done! Created: ${result.results.created}, Updated: ${result.results.updated}`);
          if (result.results.errors.length > 0) {
            console.error('Bulk errors:', result.results.errors);
            toast.warning(`Some users had errors. Check console.`);
          }
          fetchUsers();
        } else {
          toast.error(result.message || 'Bulk upload failed');
        }
      } catch (err) {
        toast.error('Operation failed');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  const filteredUsers = users.filter(u => {
    if (!u) return false;
    const username = u.username || '';
    const portalId = u.portalId || '';
    const searchLower = searchId.toLowerCase();
    
    const matchesId = username.toLowerCase().includes(searchLower) || 
                      portalId.toLowerCase().includes(searchLower);
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesYear = yearFilter === 'all' || u.academicYear === yearFilter;
    const matchesSemester = semesterFilter === 'all' || u.semester === semesterFilter;
    
    return matchesId && matchesRole && matchesYear && matchesSemester;
  });

  const pendingReqs = filteredUsers.filter(u => u.status === 'pending');
  const processedUsers = filteredUsers.filter(u => u.status !== 'pending');

  if (loading && users.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Admin Panel...</div>;
  }

  return (
    <div className="admin-panel-page">
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="admin-header">
        <div className="header-text">
          <h1>Admin Control Panel</h1>
          <p>Manage users, bulk import data, and monitor student academic progression.</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchUsers} title="Refresh Data">
            <IconRefresh size={20} />
          </button>
          <button className="btn-bulk" onClick={() => fileInputRef.current.click()}>
            <IconUpload size={20} /> Bulk CSV Import
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleBulkUpload} 
            accept=".csv" 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="filter-group">
          <IconSearch size={18} className="filter-icon" />
          <input 
            type="text" 
            placeholder="Search by ID/Username..." 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="filter-select">
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="Lecturer">Lecturers</option>
          </select>
        </div>
        <div className="filter-group">
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="filter-select">
            <option value="all">All Years</option>
            <option value="Year 1">Year 1</option>
            <option value="Year 2">Year 2</option>
            <option value="Year 3">Year 3</option>
            <option value="Year 4">Year 4</option>
          </select>
        </div>
        <div className="filter-group">
          <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} className="filter-select">
            <option value="all">All Semesters</option>
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
          </select>
        </div>
      </div>

      <div className="admin-grid">
        {/* Pending Requests */}
        {pendingReqs.length > 0 && (
          <div className="admin-card full-width pending-users-card">
            <div className="card-header">
              <h3><IconUsers size={20} className="header-icon" /> Pending Approvals ({pendingReqs.length})</h3>
            </div>
            <div className="users-table-container">
              <table className="admin-table">
                <thead>
                    <th>Portal ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Actions</th>
                </thead>
                <tbody>
                   {pendingReqs.map(req => (
                    <tr key={req._id}>
                      <td><span className="portal-id-badge">{req.portalId || '---'}</span></td>
                      <td>{req.fullName || 'N/A'}</td>
                      <td>
                        <div className="reveal-cell">
                          {revealedUsers[req._id] ? (
                            <span className="revealed-text">{req.email}</span>
                          ) : (
                            <button className="btn-reveal" onClick={() => setVerifyingUser(req)}>
                              <IconLock size={14} /> Reveal Email
                            </button>
                          )}
                        </div>
                      </td>
                      <td><span className="role-badge">{req.role}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-approve" onClick={() => handleApprove(req._id)}><IconCheck size={16}/> Approve</button>
                          <button className="btn-reject" onClick={() => handleReject(req._id)}><IconX size={16}/> Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Main Users Management */}
        <div className="admin-card full-width">
          <div className="card-header">
            <h3><IconUsers size={20} className="header-icon" /> Manage Users & Data</h3>
          </div>
          <div className="users-table-container">
            <table className="admin-table">
              <thead>
                  <th>Portal ID</th>
                  <th>Full Name / Username</th>
                  <th>Role</th>
                  <th>Academic Info</th>
                  <th>Actions</th>
              </thead>
              <tbody>
                {processedUsers.map(user => (
                  <tr key={user._id}>
                    <td><span className="portal-id-badge">{user.portalId || '---'}</span></td>
                    <td>
                      <div className="user-cell">
                       <strong>{user.fullName || user.username}</strong>
                       <span className="username-sub">(@{user.username})</span>
                        <div className="reveal-container">
                          {revealedUsers[user._id] ? (
                            <div className="revealed-details">
                              <span className="user-email">Email: <strong>{user.email}</strong></span>
                              <div className="pwd-reset-box">
                                <input 
                                  type="text" 
                                  placeholder="New temp password..." 
                                  className="mini-input"
                                  value={tempPassword}
                                  onChange={(e) => setTempPassword(e.target.value)}
                                />
                                <button className="btn-save-mini" onClick={() => handleResetPassword(user._id, tempPassword)}>Set PWD</button>
                                <button className="btn-cancel-mini" onClick={() => setRevealedUsers(prev => ({ ...prev, [user._id]: false }))}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <button className="btn-reveal-inline" onClick={() => setVerifyingUser(user)} title="Reveal & Reset">
                              <IconLock size={12} /> View Details / Reset PWD
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                    <td>
                      {user.role === 'student' ? (
                        <div className="academic-cell">
                          <span>{user.academicYear || '-'}</span>
                          <span className="semester-sub">{user.semester || '-'}</span>
                        </div>
                      ) : (
                        <span className="not-applicable">N/A (Admin/Lecturer)</span>
                      )}
                    </td>
                    <td>
                      {user.role === 'admin' ? (
                        <span className="not-applicable">No modules required</span>
                      ) : (
                        <div className="modules-cell" title={(user.assignedModules || []).join(', ')}>
                          {(user.assignedModules || []).length} Modules
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="action-row">
                        <button className="icon-btn edit" onClick={() => openEditModal(user)} title="Edit Details"><IconEdit size={18}/></button>
                        {user.role !== 'admin' && (
                          <button className="icon-btn delete" onClick={() => handleDelete(user)} title="Delete User"><IconTrash size={18}/></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {verifyingUser && (
        <VerificationModal 
          user={verifyingUser}
          password={adminPassword}
          setPassword={setAdminPassword}
          onConfirm={handleVerifyPassword}
          onCancel={() => { setVerifyingUser(null); setAdminPassword(''); }}
        />
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit User: {editingUser.username}</h2>
              <button className="close-btn" onClick={() => setEditingUser(null)}><IconX size={20}/></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    value={editForm.role} 
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="modal-input"
                  >
                    <option value="student">Student</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={editForm.status} 
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="modal-input"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                {editForm.role === 'student' && (
                  <>
                    <div className="form-group">
                      <label>Academic Year</label>
                      <select 
                        value={editForm.academicYear} 
                        onChange={(e) => setEditForm({...editForm, academicYear: e.target.value})}
                        className="modal-input"
                      >
                        <option value="">Select Year</option>
                        <option value="Year 1">Year 1</option>
                        <option value="Year 2">Year 2</option>
                        <option value="Year 3">Year 3</option>
                        <option value="Year 4">Year 4</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Semester</label>
                      <select 
                        value={editForm.semester} 
                        onChange={(e) => setEditForm({...editForm, semester: e.target.value})}
                        className="modal-input"
                      >
                        <option value="">Select Semester</option>
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="form-group full-width">
                  <label>Assigned Modules (Comma separated)</label>
                  <textarea 
                    value={editForm.assignedModules} 
                    onChange={(e) => setEditForm({...editForm, assignedModules: e.target.value})}
                    className="modal-textarea"
                    placeholder="e.g. Computer Science 101, Data Structures"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn-save-modal">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for Admin Verification Modal
function VerificationModal({ user, password, setPassword, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content small-modal">
        <div className="modal-header">
          <h2>Verify Admin Identity</h2>
          <button className="close-btn" onClick={onCancel}><IconX size={20}/></button>
        </div>
        <div className="verification-notice">
          <p>Confirm your admin password to view sensitive data for <strong>{user.username}</strong>.</p>
        </div>
        <form onSubmit={onConfirm}>
          <div className="form-group">
            <label>Your Admin Password</label>
            <input 
              type="password" 
              className="modal-input"
              placeholder="Enter your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-save-modal">Verify & Reveal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;
