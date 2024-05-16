import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitUpdateGroup } from '../../store/groups';
import './UpdateGroupForm.css'

export default function UpdateGroupForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { groupId } = useParams();
    const {user} = useSelector(state => state.session);
    const groups = useSelector(state => state.groups);
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [name, setName] = useState('');
    const [about, setAbout] = useState('');
    const [type, setType] = useState('');
    const [isPrivate, setIsPrivate] = useState('');
    const [validators, setValidators] = useState({});

    const { group } = groups;

    if (!groups || !user || !group || user.id !== group.organizerId) navigate('/')

    useEffect(() => {
        if (group) {
            setCity(group.city);
            setState(group.state);
            setName(group.name);
            setAbout(group.about);
            setType(group.type);
            setIsPrivate(group.private);
        }

    }, [group])


    async function handleSubmit(e) {
        e.preventDefault();

        const errors = {}

        if (!city.length || !state.length) errors.location = 'Location is required';
        if (!name.length) errors.name = 'Name is required';
        if (about.length < 50) errors.about = 'Description must be at least 50 characters long';
        if (type === '') errors.type = 'Group Type is required';
        if (isPrivate === '') errors.isPrivate = 'Visibility Type is required'

        setValidators(errors)


        if (Object.values(errors).length === 0) {
           const payload = {
                name,
                about,
                type,
                private: isPrivate,
                city,
                state,
                image: group.GroupImages
            }

            const response = await dispatch(submitUpdateGroup(groupId, payload))

            if (response && !response.id) {
                setValidators({error: 'There was an error, unable to submit'})
            } else {
                navigate(`/groups/${groupId}`);
            }

        }
    }





    return (
        <>
            <h2>Update your group</h2>
            <p className='update-group-intro'>We&apos;ll walk you through a few steps to build your local community.</p>
            <form className='update-group-form' onSubmit={handleSubmit}>
                <div className='update-group-section'>
                    <h3>Set your group&apos;s location.</h3>
                    <p>Meetup groups meet locally, in person, and online. We&apos;ll connect you with people in your area.</p>
                    <div className='update-group-location'>
                        <input
                            placeholder='City'
                            type='text'
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            className='update-group-input city-input'
                        />
                        <span>, </span>
                        <input
                            placeholder='STATE'
                            type='text'
                            value={state}
                            onChange={e => setState(e.target.value)}
                            className='update-group-input state-input'

                        />
                    </div>
                    {validators.location && <p className='errors'>{validators.location}</p>}
                </div>
                <div className='update-group-section'>
                    <h3>What will your group&apos;s name be?</h3>
                    <p>Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind.</p>
                    <input
                        placeholder='What is your group name?'
                        type='text'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className='update-group-input'
                    />
                    {validators.name && <p className='errors'>{validators.name}</p>}
                </div>
                <div className='update-group-section'>
                    <h3>Describe the purpose of your group.</h3>
                    <p>People will see this when we promote your group, but you&apos;ll be able to add to it later, too.</p>
                    <ol>
                        <li>What is the purpose of the group?</li>
                        <li>Who should join?</li>
                        <li>What will you do at your events?</li>
                    </ol>
                    <textarea
                        placeholder='Please write at least 50 characters'
                        value={about}
                        onChange={e => setAbout(e.target.value)}
                        className='update-group-input description-input'
                    />
                    {validators.about && <p className='errors'>{validators.about}</p>}
                </div>
                <div className='update-group-section'>
                    <h3>Final steps...</h3>
                    <p>Is this an in-person or online group?</p>
                    <select name='in-person-or-nah' onChange={e => setType(e.target.value)} value={type} className='update-group-input'>
                        <option value='' disabled={true}>(select one)</option>
                        <option value='In person'>In Person</option>
                        <option value='Online'>Online</option>
                    </select>
                    {validators.type && <p className='errors'>{validators.type}</p>}
                    <p>Is this group private or public?</p>
                    <select name='private-group' onChange={e => setIsPrivate(e.target.value)} value={isPrivate} className='update-group-input'>
                        <option value='' disabled={true}>(select one)</option>
                        <option value='true'>Private</option>
                        <option value='false'>Public</option>
                    </select>
                    {validators.isPrivate && <p className='errors'>{validators.isPrivate}</p>}
                </div>
                {validators.error && <p className='errors'>{validators.error}</p>}
                <div className='button-container'>
                    <button className='update-group-button' type='submit'>Update group</button>
                </div>
            </form>
        </>
    )
}
