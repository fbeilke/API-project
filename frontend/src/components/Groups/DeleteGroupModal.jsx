import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { removeGroup } from '../../store/groups';
import { useParams, useNavigate } from 'react-router-dom';
import './DeleteGroupModal.css';


export default function DeleteGroupModal () {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { groupId } = useParams();
    const { closeModal } = useModal();

    const handleSubmit = (e) => {
        e.preventDefault();

        dispatch(removeGroup(groupId))

        closeModal()
        navigate('/groups')

    }

    return (
        <div className='delete-modal'>
            <h2>Confirm Delete</h2>
            <p className='delete-message'>Are you sure you want to remove this group?</p>
            <button onClick={handleSubmit} className='delete-yes delete-button'>
                Yes (Delete group)
            </button>
            <button onClick={closeModal} className='delete-no delete-button'>
                No (Keep group)
            </button>
        </div>
    )
}
