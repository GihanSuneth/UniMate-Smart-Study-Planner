import React, { useState, useEffect } from 'react';
import { 
  IconUsers, 
  IconUserCheck, 
  IconSchool, 
  IconCalendarEvent, 
  IconLayoutGrid,
  IconChartPie,
  IconHistory,
  IconFilter,
  IconBooks
} from '@tabler/icons-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../api';
import './AdminAnalytics.css';

function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState('students');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Filters
  const [studentFilters, setStudentFilters] = useState({ year: 'All', semester: 'All' });
  const [lecturerFilters, setLecturerFilters] = useState({ modules: [] });

  const years = ['All', 'Year 1', 'Year 2', 'Year 3', 'Year 4'];
  const semesters = ['All', 'Semester 1', 'Semester 2'];
  const availableModules = ['Programming Applications', 'Database Systems', 'Operating Systems', 'Software Engineering', 'Computer Networks', 'Discrete Mathematics'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/analytics/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Failed to load portal stats');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleFilter = (mod) => {
    setLecturerFilters(prev => {
      const modules = prev.modules.includes(mod)
        ? prev.modules.filter(m => m !== mod)
        : [...prev.modules, mod];
      return { ...prev, modules };
    });
  };

  // Filter Logic (Calculated locally for responsiveness)
  const getFilteredStudentStats = () => {
    if (!stats) return { total: 0, active: 0 };
    let filtered = stats.students.breakdown;
    if (studentFilters.year !== 'All') {
      filtered = filtered.filter(b => b._id.year === studentFilters.year);
    }
    if (studentFilters.semester !== 'All') {
      filtered = filtered.filter(b => b._id.sem === studentFilters.semester);
    }
    
    const total = filtered.reduce((acc, curr) => acc + curr.count, 0);
    const active = filtered.reduce((acc, curr) => acc + curr.active, 0);
    return { total, active };
  };

  const getFilteredLecturerStats = () => {
    if (!stats) return { total: 0, active: 0 };
    return { total: stats.lecturers.total, active: stats.lecturers.active };
  };

  const renderStudentView = () => {
    const data = getFilteredStudentStats();
    const activeRate = data.total > 0 ? (data.active / data.total) * 100 : 0;
    
    return (
      <div className="analytics-view">
        <div className="filter-controls">
          <div className="filter-item">
            <label><IconSchool size={16}/> Filter by Year</label>
            <select value={studentFilters.year} onChange={(e) => setStudentFilters({...studentFilters, year: e.target.value})}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label><IconCalendarEvent size={16}/> Filter by Semester</label>
            <select value={studentFilters.semester} onChange={(e) => setStudentFilters({...studentFilters, semester: e.target.value})}>
              {semesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="stats-summary-grid">
          <div className="summary-card">
            <div className="card-top">
              <IconUsers className="card-icon blue"/>
              <span>Total Enrolled</span>
            </div>
            <h2>{data.total}</h2>
            <p>Students matching filters</p>
          </div>
          <div className="summary-card">
            <div className="card-top">
              <IconUserCheck className="card-icon green"/>
              <span>Active on Portal</span>
            </div>
            <h2>{data.active}</h2>
            <p>{activeRate.toFixed(1)}% Engagement rate</p>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-card">
            <h3>Engagement Analysis</h3>
            <div className="engagement-donut">
               <svg viewBox="0 0 36 36" className="donut-svg">
                 <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                 <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${activeRate}, 100`} />
               </svg>
               <div className="donut-text">
                 <strong>{activeRate.toFixed(0)}%</strong>
                 <span>Active</span>
               </div>
            </div>
          </div>
          <div className="chart-card">
            <h3>Enrollment Category Breakdown</h3>
            <div className="category-list">
               {stats.students.breakdown.slice(0, 5).map((b, i) => (
                 <div key={i} className="category-item">
                    <span>{b._id.year} {b._id.sem}</span>
                    <div className="cat-bar-wrapper">
                      <div className="cat-bar" style={{ width: `${(b.count / stats.students.total) * 100}%` }}></div>
                    </div>
                    <strong>{b.count}</strong>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLecturerView = () => {
    const data = getFilteredLecturerStats();
    const activeRate = data.total > 0 ? (data.active / data.total) * 100 : 0;

    return (
      <div className="analytics-view">
        <div className="filter-controls multi-controls">
          <label className="section-label"><IconBooks size={16}/> Filter by Allocated Modules (Multi-select)</label>
          <div className="module-chips">
            {availableModules.map(mod => (
              <button 
                key={mod} 
                className={`module-chip ${lecturerFilters.modules.includes(mod) ? 'active' : ''}`}
                onClick={() => toggleModuleFilter(mod)}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>

        <div className="stats-summary-grid">
          <div className="summary-card">
            <div className="card-top">
              <IconUsers className="card-icon blue"/>
              <span>Total Lecturers</span>
            </div>
            <h2>{data.total}</h2>
            <p>On-boarded staff members</p>
          </div>
          <div className="summary-card">
            <div className="card-top">
              <IconUserCheck className="card-icon green"/>
              <span>Active in Portal</span>
            </div>
            <h2>{data.active}</h2>
            <p>{activeRate.toFixed(1)}% Activity rate</p>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-card full-width">
            <h3>Staff Modules Distribution</h3>
            <div className="module-bar-chart">
              {stats.lecturers.breakdown.map((b, i) => (
                <div key={i} className="module-bar-row">
                  <span className="mod-label">{b._id}</span>
                  <div className="mod-bar-track">
                    <div className="mod-bar-fill" style={{ width: `${(b.count / (stats.lecturers.total || 1)) * 100}%` }}></div>
                  </div>
                  <span className="mod-count">{b.count} Staff</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading || !stats) return <div className="loading-state">Initializing Portal Analytics...</div>;

  return (
    <div className="admin-analytics-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="page-header">
        <h1>Portal Performance Insights</h1>
        <p>Administrative overview of student engagement and lecturer participation across the platform.</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <IconSchool size={20} /> Student Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'lecturers' ? 'active' : ''}`}
          onClick={() => setActiveTab('lecturers')}
        >
          <IconBooks size={20} /> Lecturer Analytics
        </button>
      </div>

      <div className="tab-viewport">
        {activeTab === 'students' ? renderStudentView() : renderLecturerView()}
      </div>
    </div>
  );
}

export default AdminAnalytics;
