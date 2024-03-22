import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import OpenModalMenuItem from './OpenModalMenuItem';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import './ProfileButton.css'

// profile button receives user as prop
function ProfileButton({ user }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  // allows menu to open by clicking button and close by either clicking button again or anywhere outside the dropdown menu
  const toggleMenu = (e) => {
    e.stopPropagation(); // Keep from bubbling up to document and triggering closeMenu
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  // logout button
  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    navigate('/');
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <div className='profile-button'>
      <button onClick={toggleMenu}>
        <i className="fas fa-user-circle" /> Profile
      </button>
      <ul className={ulClassName} ref={ulRef}>
        {/* if user, dropdown menu shows user info and user menu. if no user, dropdown shows login and signup buttons */}
        {user ? (
          <div>
            <div className='dropdown-links'>
              <Link to="/groups" className='dropdown-link'>View groups</Link>
              <Link to="/events" className='dropdown-link'>View events</Link>
            </div>
            <div className='dropdown-info'>
              <li>Hello {user.firstName},</li>
              <li className='dropdown-email'>{user.email}</li>
              <li>
                <button className='logout-button' onClick={logout}>Log Out</button>
              </li>
            </div>
          </div>
        ) : (
          <>
            <div className='login-signup-links'>
              <OpenModalMenuItem

                itemText="Log In"
                onItemClick={closeMenu}
                modalComponent={<LoginFormModal />}
              />
            </div>
            <div className='login-signup-links'>
              <OpenModalMenuItem

                itemText="Sign Up"
                onItemClick={closeMenu}
                modalComponent={<SignupFormModal />}
              />
            </div>
          </>
        )}
      </ul>
    </div>
  );
}

export default ProfileButton;
