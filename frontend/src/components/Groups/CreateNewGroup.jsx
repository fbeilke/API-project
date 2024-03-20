import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { postNewGroup } from '../../store/groups';
import { addGroupImage } from '../../store/groups';
import './CreateNewGroup.css';


export default function CreateNewGroup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {user} = useSelector(state => state.session)
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [name, setName] = useState('');
    const [about, setAbout] = useState('');
    const [type, setType] = useState('');
    const [isPrivate, setIsPrivate] = useState('');
    const [url, setUrl] = useState('');
    const [validators, setValidators] = useState({});
    const groups = useSelector(state => state.groups)

    console.log('THESE ARE MY GROUPS', groups)

    console.log('THESE ARE MY ERRORS', validators)


    if (!user) navigate('/');

    function resetInputs() {
        setCity('');
        setState('');
        setName('');
        setAbout('');
        setType('');
        setIsPrivate('');
        setUrl('');
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const errors = {}
        let group;

        if (!city.length || !state.length) errors.location = 'Location is required';
        if (!name.length) errors.name = 'Name is required';
        if (about.length < 50) errors.about = 'Description must be at least 50 characters long';
        if (type === '') errors.type = 'Group Type is required';
        if (isPrivate === '') errors.isPrivate = 'Visibility Type is required'
        if (!url.length || (!url.endsWith('.png') && !url.endsWith('.jpg') && !url.endsWith('.jpeg'))) errors.url = 'Image URL must end in .png, .jpg, or .jpeg'

        setValidators(errors)


        if (Object.values(validators).length === 0) {
           const payload = {
                name,
                about,
                type,
                private: isPrivate,
                city,
                state
            }

           group = await dispatch(postNewGroup(payload)).catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    setValidators(data.errors);
                }
            })
        }

        if (Object.values(validators).length === 0) {
            await dispatch(addGroupImage(group.id, url))
            resetInputs();
            navigate(`/groups/${group.id}`)
        }


    }

    return (
        <>
            <h2>Start a new group</h2>
            <p className='create-group-intro'>We'll walk you through a few steps to build your local community.</p>
            <form className='create-group-form' onSubmit={handleSubmit}>
                <div className='create-group-section'>
                    <h3>Set your group's location.</h3>
                    <p>Meetup groups meet locally, in person, and online. We&apos;ll connect you with people in your area.</p>
                    <div className='create-group-location'>
                        <input
                            placeholder='City'
                            type='text'
                            value={city}
                            onChange={e => setCity(e.target.value)}

                        />
                        <input
                            placeholder='STATE'
                            type='text'
                            value={state}
                            onChange={e => setState(e.target.value)}

                        />
                    </div>
                    {validators.location && <p className='errors'>{validators.location}</p>}
                </div>
                <div className='create-group-section'>
                    <h3>What will your group's name be?</h3>
                    <p>Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind.</p>
                    <input
                        placeholder='What is your group name?'
                        type='text'
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    {validators.name && <p className='errors'>{validators.name}</p>}
                </div>
                <div className='create-group-section'>
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
                    />
                    {validators.about && <p className='errors'>{validators.about}</p>}
                </div>
                <div className='create-group-section'>
                    <p>Is this an in-person or online group?</p>
                    <select name='in-person-or-nah' onChange={e => setType(e.target.value)} value={type} >
                        <option value='' disabled={true}>(select one)</option>
                        <option value='In person'>In Person</option>
                        <option value='Online'>Online</option>
                    </select>
                    {validators.type && <p className='errors'>{validators.type}</p>}
                    <p>Is this group private or public?</p>
                    <select name='private-group' onChange={e => setIsPrivate(e.target.value)} value={isPrivate}>
                        <option value='' disabled={true}>(select one)</option>
                        <option value='true'>Private</option>
                        <option value='false'>Public</option>
                    </select>
                    {validators.isPrivate && <p className='errors'>{validators.isPrivate}</p>}
                    <p>Please add an image URL for your group below:</p>
                    <input
                        placeholder='Image Url'
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                    />
                    {validators.url && <p className='errors'>{validators.url}</p>}
                </div>
                {Object.values(validators).length !== 0 && <p className='errors'>There was an error, unable to submit.</p>}
                <div className='button-container'>
                    <button className='create-group-button' type='submit'>Create group</button>
                </div>
            </form>
        </>
    )

}
