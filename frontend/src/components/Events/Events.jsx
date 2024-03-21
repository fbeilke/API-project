import { NavLink, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllEvents } from '../../store/events';
import './Events.css';

export default function Events () {
    const dispatch = useDispatch();
    const {Events} = useSelector(state => state.events)
    const today = new Date();

    useEffect(() => {
        dispatch(fetchAllEvents())
    }, [dispatch])


    if (!Events) return null;

    Events.sort((a,b) => {
        const aDate = new Date(a.startDate)
        const bDate = new Date(b.startDate)
        let total = 0;
        if(aDate > today && bDate > today) {
           aDate < bDate ? total = -1 : total = 1
        } else if (aDate < today && bDate > today) {
            total = 1
        } else if (aDate > today && bDate < today) {
            total = -1
        } else if (aDate < today && bDate < today) {
            aDate < bDate ? total = 1 : total = -1
        }

        return total;
    })



    return (
        <>
            <div className='list-links'>
                <NavLink to='/events' className='list-link'>Events</NavLink>
                <NavLink to='/groups' className='list-link'>Groups</NavLink>
            </div>
            <p className='sub-title'>Events in Meetup</p>

            {Events.map(event => (
                <Link to={`/events/${event.id}`} className='event-container' key={event.id}>
                    <div className='event-card' >
                        <img className='event-preview-image' src={event.previewImage} alt="event's preview image" />
                        <div className='event-card-info'>
                            <span className='start-date'>{event.startDate.slice(0, 10)}</span>
                            <span>·</span>
                            <span className='start-time'>{event.startDate.slice(11, 16)}</span>
                            <h2>{event.name}</h2>
                            {event.type === 'In person' ? <p className='event-location'>{event.Group.city}, {event.Group.state}</p> : <p className='online-event-tag'>{event.type}</p>}
                        </div>
                    </div>
                    <div className='event-description'>{event.description}</div>
                </Link>
                ))}

        </>
    )
}
