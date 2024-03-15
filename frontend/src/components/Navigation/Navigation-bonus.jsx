import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton-bonus';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav className='nav-bar'>
      <h1><NavLink to="/">Meetup</NavLink></h1>
      <ul className='nav-links'>
        <li className='nav-link'>
          <NavLink to="/">Home</NavLink>
        </li>
        <li className='nav-link'>
          <NavLink to='/events'>Events</NavLink>
        </li>
        <li className='nav-link'>
          <NavLink to='/groups'>Groups</NavLink>
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
