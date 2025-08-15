import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './UserAvatar.css';

const UserAvatar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Get first letter of email
  const getInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="user-avatar" ref={dropdownRef}>
      <div 
        className="avatar-circle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {getInitial(user?.email)}
      </div>
      
      {isOpen && (
        <div className="dropdown-menu">
          <div className="user-info">
            <span className="user-email">{user?.email}</span>
          </div>
          <button onClick={handleSignOut} className="sign-out-btn">
            Sign out from QuantumChat
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;