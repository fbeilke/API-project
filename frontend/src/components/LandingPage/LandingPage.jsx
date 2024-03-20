import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import SignupFormModal from '../SignupFormModal'
import './LandingPage.css';

export default function LandingPage () {
    const {user} = useSelector(state => state.session)

    return (
        <div className='landing-container'>
            <div className='intro-container'>
                <div className='intro'>
                    <h2>The people platform - Where interests become friendships</h2>
                    <p>This is Finn Beilke&apos;s clone of Meetup, where people can join groups and create events based on their interests to meet new people interested in the same things. This site&apos;s images and information have been modeled using information from the Five Nights at Freddy&apos;s franchise, created by Scott Cawthon.</p>
                </div>
                <img src='https://res.cloudinary.com/dezjslj5y/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1710779969/FNAF-restaurant_mpvhvc.jpg?_s=public-apps' className='intro-img' alt='image here'/>
            </div>
            <div className='how'>
                <h3>How Meetup Works</h3>
                <p>You can join groups or RSVP to attend events in your area or online.</p>
            </div>
            <div className='details-nav-container'>
                <div className='details-nav'>
                    <img src='https://res.cloudinary.com/dezjslj5y/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1710779969/FNAF-all_d9cwjc.jpg?_s=public-apps' alt='image here' className='details-img'/>
                    <Link to='/groups' className='landing-links'>See all groups</Link>
                    <p className='details-p'>The place to find groups that share your interests.</p>
                </div>
                <div className='details-nav'>
                    <img src='https://res.cloudinary.com/dezjslj5y/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1710779969/FNAF-all-events_igyvxa.jpg?_s=public-apps' alt='image here' className='details-img'/>
                    <Link to='/events' className='landing-links'>Find an event</Link>
                    <p className='details-p'>Find an event online or in your area to attend.</p>
                </div>
                <div className='details-nav'>
                    <img src='https://res.cloudinary.com/dezjslj5y/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1710779969/FNAF-start-new-group_b3v0kb.jpg?_s=public-apps' alt='image here' className='details-img'/>
                    <Link
                        to='/groups/new'
                        className={user ?'landing-links' : 'no-session-user'}
                        onClick={user ? null : e => e.preventDefault()}

                    >
                        Start a new group
                    </Link>
                    <p className='details-p'>Can&apos;t find a group for what interests you? Start a new one of your own!</p>
                </div>
            </div>
            { user ? null :
            <div className='join-button'>
                <OpenModalMenuItem
                    itemText="Join Meetup"
                    modalComponent={<SignupFormModal />}
                />
            </div>
            }
        </div>
    )

}
