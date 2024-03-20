import { csrfFetch } from './csrf.js';

const LIST_EVENTS = 'eventsReducer/listEvents';

const LIST_BY_GROUP = 'eventsReducer/listByGroup';

const SINGLE_EVENT = 'eventsReducer/singleEvent';

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
        default:
            return state;
    }
}
