import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSingleGroup } from '../../store/groups';
import './GroupDetails.css';
import { fetchEventsByGroup } from '../../store/events';

export default function GroupDetails () {
    const dispatch = useDispatch();
    const { groupId } = useParams();
    const { group } = useSelector(state => state.groups)
    const { byGroup } = useSelector(state => state.events)
    const today = new Date();




    useEffect(() => {
        dispatch(fetchSingleGroup(groupId))
        dispatch(fetchEventsByGroup(groupId))
    }, [dispatch, groupId])


    if (!group) return null;

    return (

        <div className='group-details-page'>
            <Link to='/groups'>Back to groups</Link>
            <div className='at-a-glance-details'>
                <img src={group.GroupImages[0].url} alt="group's first image" className='group-details-image'/>
                <div className='aag-info'>
                    <h2>{group.name}</h2>
                    <span>{byGroup.Events.length} events</span>
                    <span>{group.private === true ? 'Private' : 'Public'}</span>
                    <p>Organized by {group.Organizer.firstName} {group.Organizer.lastName}</p>
                    <button onClick={() => alert("Feature coming soon!")}>Join this group</button>
                </div>
            </div>
            <div className='in-depth-details'>
                <h3>Organizer</h3>
                <p>{group.Organizer.firstName} {group.Organizer.lastName}</p>
                <h3>What we&apos;re about</h3>
                <p>{group.about}</p>
                {byGroup.Events.map((eachEvent, numOfEvents = 0) => {
                    if (today < new Date(eachEvent.startDate)) return (
                        <>
                            <h3>Upcoming Events ({++numOfEvents})</h3>
                            <Link to={`/api/events/${eachEvent.id}`} className='event-container' key={eachEvent.id}>
                                <div className='event-card' >
                                    <img className='event-preview-image' src={eachEvent.previewImage} alt="event's preview image" />
                                    <div className='event-card-info'>
                                        <span className='start-date'>{eachEvent.startDate.slice(0, 10)}</span>
                                        <span className='start-time'>{eachEvent.startDate.slice(11, 16)}</span>
                                        <h4>{eachEvent.name}</h4>
                                        {eachEvent.type === 'In person' ? <p className='event-location'>{eachEvent.Venue.city}, {eachEvent.Venue.state}</p> : <p className='online-event-tag'>{eachEvent.type}</p>}
                                    </div>
                                </div>
                                <div className='event-description'>{eachEvent.description}</div>
                            </Link>
                        </>

                    );
                })}
                {byGroup.Events.map((eachEvent,numOfEvents = 0) => {
                    if (today > new Date(eachEvent.startDate)) return (
                        <>
                            <h3>Past Events ({++numOfEvents})</h3>
                            <Link to={`/api/events/${eachEvent.id}`} className='event-container' key={eachEvent.id}>
                                <div className='event-card' >
                                    <img className='event-preview-image' src={eachEvent.previewImage} alt="event's preview image" />
                                    <div className='event-card-info'>
                                        <span className='start-date'>{eachEvent.startDate.slice(0, 10)}</span>
                                        <span className='start-time'>{eachEvent.startDate.slice(11, 16)}</span>
                                        <h4>{eachEvent.name}</h4>
                                        {eachEvent.type === 'In person' ? <p className='event-location'>{eachEvent.Venue.city}, {eachEvent.Venue.state}</p> : <p className='online-event-tag'>{eachEvent.type}</p>}
                                    </div>
                                </div>
                                <div className='event-description'>{eachEvent.description}</div>
                            </Link>
                        </>
                    )
                    return null;

                })

            }

            </div>
        </div>
    )
}
