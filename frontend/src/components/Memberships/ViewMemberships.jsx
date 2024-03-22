import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { allGroupMemberships, leaveThisGroup } from '../../store/memberships';
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import DeleteGroupModal from '../Groups/DeleteGroupModal'
import './ViewMemberships.css'


export default function ViewMemberships() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.session);
    const { Groups }  = useSelector(state => state.memberships);


    useEffect(() => {

        dispatch(allGroupMemberships());

    }, [dispatch])

    async function leaveGroup(groupId) {
        await dispatch(leaveThisGroup(groupId, user.id))
    }

    if (!user || !Groups) {
        navigate('/');
        return null;
    }

    return (
        <>
        {/* <div className='list-links'>
            <NavLink to='/events' className='list-link'>Events</NavLink>
            <NavLink to='/groups' className='list-link'>Groups</NavLink>
        </div> */}
        <p className='sub-title'>My Groups</p>

        { !Groups ? null : Groups.map(group => (
            <div key={group.id} className='group-controls'>
                <Link to={`/groups/${group.id}`} className='group-card'>
                    <div className='group-preview-image-container'>
                        <img className='group-preview-image' src={group.previewImage} alt="group's preview image" />
                    </div>
                    <div className='group-card-info'>
                        <h2>{group.name}</h2>
                        <p>{group.city}, {group.state}</p>
                        <p>{group.about}</p>
                        <span>{group.numEvents} events</span>
                        <span>·</span>
                        <span>{group.private ? 'Private' : 'Public'}</span>
                    </div>
                </Link>
                {user.id !== group.organizerId ? <button className='unjoin-button' onClick={() => leaveGroup(group.id)}>Unjoin</button>
                    : (
                    <div className='manage-organizer-buttons-container'>
                        <Link to={`/groups/${group.id}/events/new`}>
                            <button className='manage-organizer-buttons'>Create Event</button>
                        </Link>
                        <Link to={`/groups/${group.id}/memberships`}>
                            <button className='manage-organizer-buttons'>Manage group memberships</button>
                        </Link>
                        <Link to={`/groups/${group.id}/update`}>
                            <button className='manage-organizer-buttons'>Update</button>
                        </Link>
                        <button className='manage-organizer-buttons'>
                            <OpenModalMenuItem
                                className='delete-group-modal'
                                itemText="Delete"
                                modalComponent={<DeleteGroupModal />}
                            />
                        </button>
                    </div>

                    )}
            </div>
            ))}

    </>
    )
}
