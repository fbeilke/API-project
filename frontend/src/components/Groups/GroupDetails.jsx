import { useParams, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSingleGroup } from '../../store/groups';
import { fetchEventsByGroup } from '../../store/events';
import { joinExistingGroup, fetchMembershipsOfGroup } from '../../store/memberships';
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import DeleteGroupModal from './DeleteGroupModal'
import './GroupDetails.css';

export default function GroupDetails () {
    const dispatch = useDispatch();
    const { groupId } = useParams();
    const { user } = useSelector(state => state.session)
    const { group } = useSelector(state => state.groups)
    const { byGroup } = useSelector(state => state.events)
    const { Members, membership } = useSelector(state => state.memberships)
    const today = new Date();

    let currentMember;
    if (Members) {
        currentMember = Members.find(member => user.id === member.id)
    }

    async function joinGroup() {
        const response = await dispatch(joinExistingGroup(group.id))

        if (response && !response.memberId) {
            console.log(response)
            alert('Membership has already been requested')
        }
    }


    useEffect(() => {
        dispatch(fetchSingleGroup(groupId))
        dispatch(fetchEventsByGroup(groupId))
        dispatch(fetchMembershipsOfGroup(groupId))
    }, [dispatch, groupId])


    if (!group) return null;
    if (!byGroup) return null;

    return (

        <div className='group-details-page'>
            <Link to='/groups' className='back-to-groups'>Back to groups</Link>
            <div className='at-a-glance-details'>
                <img src={!group.GroupImages[0] ? '' : group.GroupImages[0].url} alt="group's first image" className='group-details-image'/>
                <div className='aag-info'>
                    <h2>{group.name}</h2>
                    <p>{group.city}, {group.state}</p>
                    <span>{byGroup.Events.length} events</span>
                    <span>·</span>
                    <span>{group.private === true ? 'Private' : 'Public'}</span>
                    <p>Organized by {group.Organizer.firstName} {group.Organizer.lastName}</p>
                    {!currentMember ? <button className='join-button' onClick={joinGroup}>Join this group</button> : null}
                    {membership && membership.memberId === user.id && membership.status === 'Pending' ? `(Pending approval)` : null}
                    { user && user.id === group.organizerId ?
                    <div className='organizer-buttons-container'>
                        <Link to={`/groups/${group.id}/events/new`}>
                            <button className='organizer-buttons'>Create Event</button>
                        </Link>
                        <button className='organizer-buttons' onClick={() => alert('Feature coming soon!')}>Manage group memberships</button>
                        <Link to={`/groups/${group.id}/update`}>
                            <button className='organizer-buttons'>Update</button>
                        </Link>
                        <button className='organizer-buttons'>
                            <OpenModalMenuItem
                                className='delete-group-modal'
                                itemText="Delete"
                                modalComponent={<DeleteGroupModal />}
                            />
                        </button>
                    </div>

                    : null}
                </div>
            </div>
            <div className='in-depth-details'>
                <h3>Organizer</h3>
                <p>{group.Organizer.firstName} {group.Organizer.lastName}</p>
                <h3>What we&apos;re about</h3>
                <p>{group.about}</p>
                {byGroup.Events.length === 0 ? <h3>No upcoming events</h3> :
                byGroup.Events.map((eachEvent, numOfEvents = 0) => {
                    if (today < new Date(eachEvent.startDate)) return (
                        <>
                            <h3>Upcoming Events ({++numOfEvents})</h3>
                            <Link to={`/events/${eachEvent.id}`} className='event-container' key={eachEvent.id}>
                                <div className='event-card' >
                                    <img className='event-preview-image' src={eachEvent.previewImage} alt="event's preview image" />
                                    <div className='event-card-info'>
                                        <span className='start-date'>{eachEvent.startDate.slice(0, 10)}</span>
                                        <span>·</span>
                                        <span className='start-time'>{eachEvent.startDate.slice(11, 16)}</span>
                                        <h4>{eachEvent.name}</h4>
                                        {eachEvent.type === 'In person' ? <p className='event-location'>{eachEvent.Group.city}, {eachEvent.Group.state}</p> : <p className='online-event-tag'>{eachEvent.type}</p>}
                                    </div>
                                </div>
                                <div className='event-description'>{eachEvent.description}</div>
                            </Link>
                        </>

                    );
                })}
                {byGroup.Events.length === 0 ? null :
                byGroup.Events.map((eachEvent,numOfEvents = 0) => {
                    if (today > new Date(eachEvent.startDate)) return (
                        <>
                            <h3>Past Events ({++numOfEvents})</h3>
                            <Link to={`/events/${eachEvent.id}`} className='event-container' key={eachEvent.id}>
                                <div className='event-card' >
                                    <img className='event-preview-image' src={eachEvent.previewImage} alt="event's preview image" />
                                    <div className='event-card-info'>
                                        <span className='start-date'>{eachEvent.startDate.slice(0, 10)}</span>
                                        <span>·</span>
                                        <span className='start-time'>{eachEvent.startDate.slice(11, 16)}</span>
                                        <h4>{eachEvent.name}</h4>
                                        {eachEvent.type === 'In person' ? <p className='event-location'>{eachEvent.Group.city}, {eachEvent.Group.state}</p> : <p className='online-event-tag'>{eachEvent.type}</p>}
                                    </div>
                                </div>
                                <div className='event-description'>{eachEvent.description}</div>
                            </Link>
                        </>
                    )
                    return null;

                })}


            </div>
        </div>
    )
}
