import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton-bonus';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav className='nav-bar'>
      <h1><NavLink to="/" className='nav-bar-link'>Meetup</NavLink></h1>
      <ul className='nav-links'>
        <li className='nav-link'>
          <NavLink to="/" className='nav-bar-link'>Home</NavLink>
        </li>
        <li className='nav-link'>
          <NavLink to='/groups' className='nav-bar-link'>Groups</NavLink>
        </li>
        <li className='nav-link'>
          <NavLink to='/events' className='nav-bar-link'>Events</NavLink>
        </li>
        {isLoaded && (
          <li className='nav-link'>
            <ProfileButton user={sessionUser} />
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;
