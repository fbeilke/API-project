import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { postNewEvent } from '../../store/events';
import './CreateNewEvent.css';

export default function CreateNewEvent() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { groupId } = useParams();
    const { user } = useSelector(state => state.session);
    const { group } = useSelector(state => state.groups);
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [price, setPrice] = useState('0');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [validators, setValidators] = useState({});

    if (!user || !group) {
        navigate(`/groups/${groupId}`)
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const errors = {};

        if (name.length < 5) errors.name = 'Name is required and must be greater than 5 characters';
        if (type === '') errors.type = 'Event Type is required';
        if (!price) errors.price = 'Price is required';
        if (!startDate) errors.startDate = 'Event start is required';
        if (!endDate) errors.endDate = 'Event end is required';
        if (!url.length || (!url.endsWith('.png') && !url.endsWith('.jpg') && !url.endsWith('.jpeg'))) errors.url = 'Image URL must end in .png, .jpg, or .jpeg'
        if (!description.length) errors.description = 'Description must be at least 30 characters long';

        setValidators(errors)

        if (Object.values(validators).length === 0) {
            const payload = {
                name,
                type,
                price,
                startDate,
                endDate,
                description,
                url
            }

            const response = await dispatch(postNewEvent(payload, groupId))
            console.log(response)
            if (!response.id) {
                setValidators({error: `There was an error, unable to submit`})
            } else {
                await navigate(`/events/${response.id}`);
            }

        }

    }

    return (
        <form className='create-event-container' onSubmit={handleSubmit}>
                <h2>Create an event for {group.name}</h2>
                <div className='section-one'>
                    <p>What is the name of your event?</p>
                    <input
                        placeholder='Event name'
                        type='text'
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    {validators.name && <p className='errors'>{validators.name}</p>}
                </div>
                <div className='create-event-section section-two'>
                    <p>Is this an in person or online event?</p>
                    <select
                        name='type'
                        onChange={e => setType(e.target.value)}
                        value={type}
                    >
                        <option value='' disabled={true}>(select one)</option>
                        <option value='In person'>In Person</option>
                        <option value='Online'>Online</option>
                    </select>
                    {validators.type && <p className='errors'>{validators.type}</p>}
                    <p>What is the price for your event?</p>
                    <input
                        placeholder='0'
                        type='text'
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                    />
                    {validators.price && <p className='errors'>{validators.price}</p>}
                </div>
                <div className='create-event-section section-three'>
                    <p>When does your event start?</p>
                    <input
                        type='datetime-local'
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                    {validators.startDate && <p className='errors'>{validators.startDate}</p>}
                    <p>When does your event end?</p>
                    <input
                        type='datetime-local'
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                    {validators.endDate && <p className='errors'>{validators.endDate}</p>}
                </div>
                <div className='create-event-section section-four'>
                    <p>Please add an image url for your event below:</p>
                    <input
                        placeholder='Image URL'
                        type='text'
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                    />
                    {validators.url && <p className='errors'>{validators.url}</p>}
                </div>
                <div className='create-event-section section-five'>
                    <p>Please describe your event:</p>
                    <textarea
                        placeholder='Please include at least 30 characters'
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    {validators.description && <p className='errors'>{validators.description}</p>}
                </div>
                {validators.error && <p className='errors'>{validators.error}</p>}
                <div className='create-event-button-container'>
                    <button type='submit' className='create-event-button'>Create Event</button>
                </div>
            </form>
    )

}
