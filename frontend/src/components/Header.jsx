import React from 'react';
import { IconSearch } from '@tabler/icons-react';

function Header() {
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('role') || 'student';

  // Make the avatar slightly dynamic based on role or name length to simulate syncing
  const avatarId = userRole === 'lecturer' ? 12 : (userName.length % 70) + 1;

  return (
    <header className="top-header">
       <div className="header-left">
          {/* Intentional space for aesthetic absolute positioning visual balance matching image */}
       </div>
       
       <div className="header-right">
         <div className="search-box">
            <IconSearch size={18} className="search-icon" />
            <input type="text" placeholder="Search" />
         </div>
         <div className="header-actions">
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{userName}</div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>{userRole}</div>
              </div>
              <img src={`https://i.pravatar.cc/150?img=${avatarId}`} alt="Profile" className="header-avatar" style={{ border: '2px solid #eef2ff' }} />
            </div>
            
         </div>
       </div>
    </header>
  );
}

export default Header;
