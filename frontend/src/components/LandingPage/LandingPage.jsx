import { Link } from 'react-router-dom';
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import SignupFormModal from '../SignupFormModal'
import './LandingPage.css';

export default function LandingPage () {

    return (
        <div className='landing-container'>
            <div className='intro-container'>
                <div className='intro'>
                    <h2>The people platform - Where interests become friendships</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </div>
                <img src='' className='intro-img' alt='image here'/>
            </div>
            <div className='how'>
                <h3>How Meetup Works</h3>
                <p>You can join groups or RSVP to attend events in your area or online.</p>
            </div>
            <div className='details-nav-container'>
                <div className='details-nav'>
                    <img src='' alt='image here' className='details-img'/>
                    <Link to='/groups'>See all groups</Link>
                    <p className='details-p'>The place to find groups that share your interests.</p>
                </div>
                <div className='details-nav'>
                    <img src='' alt='image here' className='details-img'/>
                    <Link to='/events'>Find an event</Link>
                    <p className='details-p'>Find an event online or in your area to attend.</p>
                </div>
                <div className='details-nav'>
                    <img src='' alt='image here' className='details-img'/>
                    <Link
                        to='/groups/new'
                        onClick={(e) => e.preventDefault()}
                    >
                        Start a new group
                    </Link>
                    <p className='details-p'>Can&apos;t find a group for what interests you? Start a new one of your own!</p>
                </div>
            </div>
            <div className='join-button'>
                <OpenModalMenuItem
                    itemText="Join Meetup"
                    modalComponent={<SignupFormModal />}
                />
            </div>
        </div>
    )

}
