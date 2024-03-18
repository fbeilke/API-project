import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton-bonus';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav className='nav-bar'>
      <h1><Link to="/" className='logo-link'>Meetup</Link></h1>
      <div className='right-side-nav'>
        {sessionUser ?
          <Link to='/groups/new' className='nav-bar-link'>Start a new group</Link>
          : null}
          {isLoaded && (
              <ProfileButton user={sessionUser} />
          )}
      </div>
    </nav>
  );
}

export default Navigation;
