import React, { useState, useRef, useEffect } from 'react';
import { IconSearch, IconBell } from '@tabler/icons-react';

function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: 'Your Notes AI summary is ready!', time: '2m ago', unread: true },
    { id: 2, text: 'New quiz added for Mathematics.', time: '1h ago', unread: false },
    { id: 3, text: 'Attendance recorded successfully.', time: 'Yesterday', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
            <div className="notification-wrapper" ref={dropdownRef}>
              <button 
                className={`icon-btn ${showNotifications ? 'active' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <IconBell size={20} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
              
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h4>Notifications</h4>
                    <span className="mark-read">Mark all as read</span>
                  </div>
                  <div className="dropdown-list">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                        {notif.unread && <div className="notif-dot"></div>}
                        <div className="notif-content">
                          <p>{notif.text}</p>
                          <span className="notif-time">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="dropdown-footer">
                    View all notifications
                  </div>
                </div>
              )}
            </div>
            
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="header-avatar" />
         </div>
       </div>
    </header>
  );
}

export default Header;
