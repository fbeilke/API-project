import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchSingleEvent } from '../../store/events';
import { fetchSingleGroup } from '../../store/groups';
import { FaClock } from "react-icons/fa";
import { HiCurrencyDollar } from "react-icons/hi2";
import { FaMapLocationDot } from "react-icons/fa6";
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import DeleteEventModal from "./DeleteEventModal"
import './EventDetails.css'

export default function EventDetails () {
    const dispatch = useDispatch();
    const { eventId } = useParams();
    const { event } = useSelector(state => state.events);
    const { group } = useSelector(state => state.groups);
    const { user } = useSelector(state => state.session);








    useEffect(() => {
        const fetchBoth = async() => {
            const fetchEvent = async () => {
                const event = await dispatch(fetchSingleEvent(eventId))
                return event;
            }
            const {groupId} = await fetchEvent()
            const fetchGroup = async () => {
                dispatch(fetchSingleGroup(groupId))
            }
            fetchGroup();
        }
        fetchBoth();

    }, [dispatch, eventId])



    if (!event || !group) return null;



    return (
        <>
            <Link to='/events'>Back to events</Link>
            <div className='event-detail-header'>
                <h2>{event.name}</h2>
                <p>Hosted by {group.Organizer.firstName} {group.Organizer.lastName}</p>
            </div>
            <div className='event-detail-card'>
                <div className='details'>
                    <img className='event-image' src={event.EventImages[0].url} alt='first event image'/>
                    <div className='details-right-side'>
                        <Link to={`/groups/${event.groupId}`} className='event-group-card'>
                            <img className='group-image' src={!group.GroupImages[0] ? '' : group.GroupImages[0].url} alt="group's preview image" />
                            <div className='event-group-details'>
                                <p>{event.Group.name}</p>
                                <p>{event.Group.private === true ? 'Private' : 'Public'}</p>
                            </div>
                        </Link>
                        <div className='event-details'>
                            <div className='details-split'>
                                <FaClock className='icon' />
                                <div className='details-split-details'>
                                    <div className='details-split-label'>
                                        <p>START</p>
                                        <p>END</p>
                                    </div>
                                    <div>
                                        <div className='details-split-time'>
                                            <span>{event.startDate.slice(0, 10)}</span>
                                            <span>·</span>
                                            <span>{event.startDate.slice(11, 16)}</span>
                                        </div>
                                        <div className='details-split-time'>
                                            <span>{event.endDate.slice(0, 10)}</span>
                                            <span>·</span>
                                            <span>{event.endDate.slice(11, 16)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='details-split'>
                                <HiCurrencyDollar className='icon'/>
                                <span className='details-split-label'>{!event.price || parseFloat(event.price) === 0 ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`}</span>
                            </div>
                            <div className='details-split'>
                                <FaMapLocationDot className='icon'/>
                                <span className='details-split-label'>{event.type}</span>
                                {user && user.id === group.Organizer.id ?
                                <div className='event-button-container'>
                                    <button
                                        onClick={() => alert('Feature coming soon!')}
                                        className='update-event-button'
                                    >
                                        Update
                                    </button>
                                    <button className='delete-event-button'>
                                        <OpenModalMenuItem
                                            className='delete-event-modal'
                                            itemText='Delete'
                                            modalComponent={<DeleteEventModal />}
                                        />
                                    </button>
                                </div>
                               : null}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='about'>
                    <h3>Description</h3>
                    <p>{event.description}</p>
                </div>
            </div>
        </>
    )
}
