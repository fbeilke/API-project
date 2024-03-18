import { NavLink, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllEvents } from '../../store/events';
import './Events.css';

export default function Events () {
    const dispatch = useDispatch();
    const {Events} = useSelector(state => state.events)
    console.log('THIS IS EVENTS DETAILS', Events)

    useEffect(() => {
        dispatch(fetchAllEvents())
    }, [dispatch])

    return (
        <>
            <div className='list-links'>
                <NavLink to='/events' className='list-link'>Events</NavLink>
                <NavLink to='/groups' className='list-link'>Groups</NavLink>
            </div>
            <p className='sub-title'>Events in Meetup</p>

            { !Events ? null : Events.map(event => (
                <Link to={`/api/events/${event.id}`} className='event-container' key={event.id}>
                    <div className='event-card' >
                        <img className='event-preview-image' src={event.previewImage} alt="event's preview image" />
                        <div className='event-card-info'>
                            <span className='start-date'>{event.startDate.slice(0, 10)}</span>
                            <span className='start-time'>{event.startDate.slice(11, 16)}</span>
                            <h2>{event.name}</h2>
                            {event.type === 'In person' ? <p className='event-location'>{event.Venue.city}, {event.Venue.state}</p> : <p className='online-event-tag'>{event.type}</p>}
                        </div>
                    </div>
                    <div className='event-description'>{event.description}</div>
                </Link>
                ))}

        </>
    )
}
