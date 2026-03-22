import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  IconLayoutDashboard, IconNotes, IconCalendarStats, 
  IconPencilCheck, IconChartBar, IconSettings, IconLogout
} from '@tabler/icons-react';
import logoImg from '../images/logo.png';

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: IconLayoutDashboard },
    { path: '/notes-ai', label: 'Notes AI', icon: IconNotes },
    { path: '/attendance', label: 'Attendance', icon: IconCalendarStats },
    { path: '/quiz-validator', label: 'Quiz Validator', icon: IconPencilCheck },
    { path: '/analytics', label: 'Analytics', icon: IconChartBar },
    { path: '/settings', label: 'Settings', icon: IconSettings }
  ];

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
          <img src="https://i.pravatar.cc/150?img=11" alt="John Doe" className="user-avatar" />
          <div className="user-info">
            <div className="user-name">John Doe</div>
            <div className="user-role">Student</div>
          </div>
        </div>
        <button className="logout-btn">
          <IconLogout size={20} stroke={2} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
