import { NavLink, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllGroups } from '../../store/groups';
import './Groups.css';

export default function Groups () {
    const dispatch = useDispatch();
    const {Groups} = useSelector(state => state.groups)

    useEffect(() => {
        dispatch(fetchAllGroups())
    }, [dispatch])



    return (
        <>
            <div className='list-links'>
                <NavLink to='/events' className='list-link'>Events</NavLink>
                <NavLink to='/groups' className='list-link'>Groups</NavLink>
            </div>
            <p className='sub-title'>Groups in Meetup</p>

            { !Groups ? null : Groups.map(group => (
                <Link to={`/groups/${group.id}`} className='group-card' key={group.id}>
                    <img className='group-preview-image' src={group.previewImage} alt="group's preview image" />
                    <div className='group-card-info'>
                        <h2>{group.name}</h2>
                        <p>{group.city}, {group.state}</p>
                        <p>{group.about}</p>
                        <span>TODO: number of events by group</span>
                        <span>{group.private ? 'Private' : 'Public'}</span>
                    </div>
                </Link>
                ))}

        </>
    )
}
