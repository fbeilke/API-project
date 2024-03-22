import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchMembershipsOfGroup } from '../../store/memberships';
import { useParams, useNavigate } from 'react-router-dom';
import './ManageGroupMemberships.css'

export default function ManageGroupMemberships() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { groupId } = useParams();
    const { user } = useSelector(state => state.session);
    const { Members } = useSelector(state => state.memberships);

    // Owner and Co-host can now see userId returned as member.Membership[0].userId


    useEffect(() => {
        dispatch(fetchMembershipsOfGroup(groupId))
    }, [dispatch, groupId])

    if (!user || !Members) {
        navigate('/')
        return null;
    }

    return (
        <div>
            <h2>List of all Members</h2>
            {Members.map((member) => (
                <div className='each-member' key={member.id}>
                    <h3>{member.Membership[0].status}</h3>
                    <p>{member.firstName} {member.lastName}</p>

                </div>
            ))}
        </div>
    )
}
