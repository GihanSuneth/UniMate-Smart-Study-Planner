import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  IconLayoutDashboard, IconNotes, IconCalendarStats, 
  IconPencilCheck, IconChartBar, IconSettings, IconLogout, IconShieldLock
} from '@tabler/icons-react';
import logoImg from '../images/logo.png';

function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const getNavItems = () => {
    const items = [
      { path: '/', label: 'Dashboard', icon: IconLayoutDashboard, roles: ['student', 'Lecturer'] },
      { path: '/admin', label: 'Admin Panel', icon: IconShieldLock, roles: ['admin'] },
      { path: '/notes-ai', label: 'Notes AI', icon: IconNotes, roles: ['student', 'Lecturer'] },
      { path: '/attendance', label: role === 'student' ? 'Scan QR' : role === 'admin' ? 'Attendance Check' : 'QR Generator', icon: IconCalendarStats, roles: ['student', 'Lecturer', 'admin'] },
      { path: '/quiz-validator', label: 'Quiz Validator', icon: IconPencilCheck, roles: ['student', 'Lecturer', 'admin'] },
      { path: '/analytics', label: 'Analytics', icon: IconChartBar, roles: ['student', 'Lecturer', 'admin'] },
      { path: '/settings', label: role === 'admin' ? 'Admin Settings' : 'Profile Activity', icon: IconSettings, roles: ['student', 'Lecturer', 'admin'] }
    ];
    return items.filter(item => item.roles.includes(role));
  };

  const navItems = getNavItems();
  const userName = localStorage.getItem('userName') || 'User';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
         <img src={logoImg} alt="UniMate Logo" className="logo" />
         <span className="logo-text">UniMate</span>
      </div>
      
      <nav className="nav-menu">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-profile">
          <img src={`https://i.pravatar.cc/150?u=${userName}`} alt={userName} className="user-avatar" />
          <div className="user-info">
            <div className="user-name" style={{textTransform: 'capitalize'}}>{userName}</div>
            <div className="user-role" style={{textTransform: 'capitalize'}}>{role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <IconLogout size={20} stroke={2} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
