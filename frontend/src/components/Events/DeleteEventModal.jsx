import { useDispatch, useSelector } from 'react-redux';
import { useModal } from '../../context/Modal';
import { removeEvent } from '../../store/events';
import { useParams, useNavigate } from 'react-router-dom';
import './DeleteEventModal.css';

export default function DeleteEventModal() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { closeModal } = useModal();
    const { group } = useSelector(state => state.groups);

    const handleSubmit = (e) => {
        e.preventDefault();

        dispatch(removeEvent(eventId))


        closeModal()
        navigate(`/groups/${group.id}`)

    }

    return (
        <div className='delete-modal'>
            <h2>Confirm Delete</h2>
            <p className='delete-message'>Are you sure you want to remove this event?</p>
            <button onClick={handleSubmit} className='delete-yes delete-button'>
                Yes (Delete event)
            </button>
            <button onClick={closeModal} className='delete-no delete-button'>
                No (Keep event)
            </button>
        </div>
    )
}
