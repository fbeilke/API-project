import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton-bonus';
import './Navigation.css';

//nav bar receives isLoaded as a prop
function Navigation({ isLoaded }) {
  // checks if there is an existing logged in user
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav className='nav-bar'>
      <h1><Link to="/" className='logo-link'>Meetup</Link></h1>
      <div className='right-side-nav'>
        {/* if user logged in, has link to create group, else does not */}
        {sessionUser ?
          <Link to='/groups/new' className='nav-bar-link'>Start a new group</Link>
          : null}
          {/* if restore user has run, sends the value of sessionuser to ProfileButton as a prop */}
          {isLoaded && (
              <ProfileButton user={sessionUser} />
          )}
      </div>
    </nav>
  );
}

export default Navigation;
