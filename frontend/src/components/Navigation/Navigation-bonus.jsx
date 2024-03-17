import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton-bonus';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav className='nav-bar'>
      <h1><Link to="/" className='nav-bar-link'>Meetup</Link></h1>
        {isLoaded && (
            <ProfileButton user={sessionUser} />
        )}
    </nav>
  );
}

export default Navigation;
