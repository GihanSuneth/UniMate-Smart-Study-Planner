import React from 'react';
import { IconSearch } from '@tabler/icons-react';

function Header() {
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || 'User');
  const [userRole, setUserRole] = React.useState(localStorage.getItem('userRole') || 'student');
  const [profilePic, setProfilePic] = React.useState(localStorage.getItem('profilePic') || '');

  React.useEffect(() => {
    const handleRefresh = () => {
      setUserName(localStorage.getItem('userName') || 'User');
      setUserRole(localStorage.getItem('userRole') || 'student');
      setProfilePic(localStorage.getItem('profilePic') || '');
    };

    window.addEventListener('auth-change', handleRefresh);
    window.addEventListener('storage', handleRefresh);

    return () => {
      window.removeEventListener('auth-change', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
    };
  }, []);

  const normalizedRole = userRole.trim().toLowerCase();
  const isAdmin = normalizedRole === 'admin';

  const displayAvatar = profilePic || 'https://i.pravatar.cc/150?img=11';

  return (
    <header className="top-header">
       <div className="header-left">
          {/* Intentional space for aesthetic absolute positioning visual balance matching image */}
       </div>
       
       <div className="header-right">
         {/* Search Filter hidden for all roles per standardisation requirement */}
         <div className="header-actions">
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{userName}</div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>{userRole}</div>
              </div>
              <img src={displayAvatar} alt="Profile" className="header-avatar" style={{ border: '2px solid #eef2ff' }} />
            </div>
            
         </div>
       </div>
    </header>
  );
}

export default Header;
