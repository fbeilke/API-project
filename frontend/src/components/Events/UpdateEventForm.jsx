import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { submitUpdateEvent } from '../../store/events';
import './UpdateEventForm.css';


export default function UpdateEventForm () {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { user } = useSelector(state => state.session);
    const groups = useSelector(state => state.groups);
    const { event } = useSelector (state => state.events);
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [price, setPrice] = useState('0');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [validators, setValidators] = useState({});

    const { group } = groups;


    useEffect(() => {
        if (event) {
            setName(event.name);
            setType(event.type);
            setPrice(event.price || 0);
            setStartDate(event.startDate.slice(0, 23));
            setEndDate(event.endDate.slice(0, 23));
            setDescription(event.description);
        }
    }, [event])

    async function handleSubmit(e) {
        e.preventDefault();

        const errors = {};

        if (name.length < 5) errors.name = 'Name is required and must be greater than 5 characters';
        if (type === '') errors.type = 'Event Type is required';
        if (!price && price !== 0) errors.price = 'Price is required';
        if (!startDate) errors.startDate = 'Event start is required';
        if (!endDate) errors.endDate = 'Event end is required';
        if (!description.length) errors.description = 'Description must be at least 30 characters long';

        setValidators(errors)

        if (Object.values(errors).length === 0) {
            const payload = {
                name,
                type,
                price,
                startDate,
                endDate,
                description,
                image: event.EventImages
            }

            const response = await dispatch(submitUpdateEvent(eventId, payload))

            if (response && !response.id) {
                setValidators({error: `There was an error, unable to submit`})
            } else {
                await navigate(`/events/${eventId}`);
            }

        }

    }

    if (!groups || !user || !group || !event || user.id !== group.organizerId) {
        navigate('/');
        return null
    }

    return (
        <form className='update-event-container' onSubmit={handleSubmit}>
                <div className='section-one'>
                    <h2>Update your event for {group.name}</h2>
                    <p>What is the name of your event?</p>
                    <input
                        placeholder='Event name'
                        type='text'
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    {validators.name && <p className='errors'>{validators.name}</p>}
                </div>
                <div className='update-event-section section-two'>
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
                <div className='update-event-section section-three'>
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
                <div className='update-event-section section-five'>
                    <p>Please describe your event:</p>
                    <textarea
                        placeholder='Please include at least 30 characters'
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    {validators.description && <p className='errors'>{validators.description}</p>}
                </div>
                {validators.error && <p className='errors'>{validators.error}</p>}
                <div className='update-event-button-container'>
                    <button type='submit' className='update-event-submit-button'>Update Event</button>
                </div>
            </form>
    )
}
