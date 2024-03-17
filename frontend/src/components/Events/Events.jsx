import { NavLink } from 'react-router-dom';

export default function Events () {
    return (
        <>
            <div className='list-links'>
                <NavLink to='/events' className='list-link'>Events</NavLink>
                <NavLink to='/groups' className='list-link'>Groups</NavLink>
            </div>
            <h2>WELCOME TO THE EVENTS</h2>
        </>
    )
}
