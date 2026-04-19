import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  IconLayoutDashboard, IconNotes, IconCalendarStats, 
  IconPencilCheck, IconChartBar, IconSettings, IconLogout, IconShieldLock
} from '@tabler/icons-react';
import logoImg from '../images/logo.png';

function Sidebar({ role: initialRole }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || 'User');
  const [userRole, setUserRole] = React.useState(localStorage.getItem('userRole') || initialRole || 'student');
  const [profilePic, setProfilePic] = React.useState(localStorage.getItem('profilePic') || '');

  React.useEffect(() => {
    const handleRefresh = () => {
      setUserName(localStorage.getItem('userName') || 'User');
      setUserRole(localStorage.getItem('userRole') || initialRole || 'student');
      setProfilePic(localStorage.getItem('profilePic') || '');
    };

    window.addEventListener('auth-change', handleRefresh);
    window.addEventListener('storage', handleRefresh);

    return () => {
      window.removeEventListener('auth-change', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
    };
  }, [initialRole]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('profilePic');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const getNavItems = () => {
    const items = [
      { path: '/', label: 'Dashboard', icon: IconLayoutDashboard, roles: ['student', 'lecturer'] },
      { path: '/admin', label: 'Admin Panel', icon: IconShieldLock, roles: ['admin'] },
      { path: '/notes-ai', label: 'Notes AI', icon: IconNotes, roles: ['student', 'lecturer'] },
      { path: '/attendance', label: userRole.toLowerCase() === 'student' ? 'Attendance' : 'QR Generator', icon: IconCalendarStats, roles: ['student', 'lecturer'] },
      { path: '/quiz-validator', label: 'Quiz Validator', icon: IconPencilCheck, roles: ['student', 'lecturer'] },
      { path: '/analytics', label: 'Analytics', icon: IconChartBar, roles: ['student', 'lecturer', 'admin'] },
      { path: '/settings', label: 'Profile Activity', icon: IconSettings, roles: ['student', 'lecturer', 'admin'] }
    ];
    return items.filter(item => item.roles.includes(userRole.toLowerCase()));
  };

  const navItems = getNavItems();
  const displayAvatar = profilePic || 'https://i.pravatar.cc/150?img=11';

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
          <img src={displayAvatar} alt={userName} className="user-avatar" />
          <div className="user-info">
            <div className="user-name">{userName}</div>
            <div className="user-role" style={{textTransform: 'capitalize'}}>{userRole}</div>
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
