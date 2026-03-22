import React from 'react';
import { IconSearch, IconBell, IconMessageCircle } from '@tabler/icons-react';

function Header() {
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
            <button className="icon-btn">
              <IconMessageCircle size={20} />
              <span className="badge" style={{display: 'none'}}>0</span>
            </button>
            <button className="icon-btn">
              <IconBell size={20} />
              <span className="badge">1</span>
            </button>
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="header-avatar" />
         </div>
       </div>
    </header>
  );
}

export default Header;
