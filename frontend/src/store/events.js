import { csrfFetch } from './csrf.js';

const LIST_EVENTS = 'eventsReducer/listEvents';

const LIST_BY_GROUP = 'eventsReducer/listByGroup';

const SINGLE_EVENT = 'eventsReducer/singleEvent';

const CREATE_NEW_EVENT = 'eventsReducer/createNewEvent';

const DELETE_EVENT = 'eventsReducer/deleteEvent';

function listEvents(events) {
   return {
        type: LIST_EVENTS,
        events
   }
}


function listByGroup(events) {
    return {
        type: LIST_BY_GROUP,
        events
    }
}

function singleEvent(event) {
    return {
        type: SINGLE_EVENT,
        event
    }
}

function createNewEvent(event) {
    return {
        type: CREATE_NEW_EVENT,
        event
    }
}

export function deleteEvent(eventId) {
    return {
        type: DELETE_EVENT,
        eventId
    }
}


export const fetchAllEvents = () => async (dispatch) => {
    const response = await csrfFetch('/api/events');

    if(response.ok) {
        const data = await response.json()
        dispatch(listEvents(data));
    }
}

export const fetchEventsByGroup = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/events`)

    if (response.ok) {
        const data = await response.json();
        dispatch(listByGroup(data));
        return data;
    }
}

export const fetchSingleEvent = (eventId) => async (dispatch) => {
    const response = await csrfFetch(`/api/events/${eventId}`);

    if (response.ok) {
        const data = await response.json();
        dispatch(singleEvent(data))
        return data;
    }
}

export const postNewEvent = (payload, groupId) => async (dispatch) => {
    try {
        const body = {
            name: payload.name,
            type: payload.type,
            description: payload.description,
            startDate: payload.startDate.slice(0, 10) + ' ' + payload.startDate.slice(11) + ":00",
            endDate: payload.endDate.slice(0, 10) + ' ' + payload.endDate.slice(11) + ":00",
            price: payload.price
        }

        if (!payload.capacity) body.capacity = 10;


        const response = await csrfFetch(`/api/groups/${groupId}/events`, {
            method: 'POST',
            body: JSON.stringify(body)
        })

        if (response.ok) {
            const data = await response.json();
            dispatch(addEventImage(payload, data));
            return data;
        }
    } catch (err) {
        return err
    }
}

export const addEventImage = ({url}, data) => async (dispatch) => {
    const response = await csrfFetch(`/api/events/${data.id}/images`, {
        method: 'POST',
        body: JSON.stringify({url, preview: true})
    })

    if (response.ok) {
        data.EventImages = await response.json();
        dispatch(createNewEvent(data))
    }
}

export const removeEvent = (eventId) => async (dispatch) => {
    const response = await csrfFetch(`/api/events/${eventId}`, {
        method: 'DELETE',
    })

    if (response.ok) {
        dispatch(deleteEvent(eventId));
    }
}



const initialState = {events: null}


export default function eventsReducer (state = initialState, action) {
    switch (action.type) {
        case LIST_EVENTS: {
            return {...state, ...action.events}
        }
        case LIST_BY_GROUP: {
            return {...state, byGroup: action.events}
        }
        case SINGLE_EVENT: {
            return {...state, event: action.event}
        }
        case CREATE_NEW_EVENT: {
            return {...state, [action.event.id]: action.event}
        }
        case DELETE_EVENT: {
            const newState = {...state};
            delete newState.event
            const eventToDelete = newState.byGroup.Events.find(event => event.id === action.eventId)
            const indexOfEvent = newState.byGroup.Events.indexOf(eventToDelete)
            newState.byGroup.Events.splice(indexOfEvent, 1)
            console.log('-------------',newState)
            return newState;
        }
        default:
            return state;
    }
}
