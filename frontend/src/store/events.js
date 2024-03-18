import { csrfFetch } from './csrf.js';

const LIST_EVENTS = 'eventsReducer/listEvents';
const LIST_BY_GROUP = 'eventsReducer/listByGroup';

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


export const fetchAllEvents = () => async (dispatch) => {
    const response = await csrfFetch('/api/events');

    if(response.ok) {
        const data = await response.json()
        dispatch(listEvents(data));
    } else {
        console.log('ERROR IN FETCHALLEVENTS')
    }
}

export const fetchEventsByGroup = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/events`)

    if (response.ok) {
        const data = await response.json();
        dispatch(listByGroup(data));
        return data;
    } else {
        console.log('ERROR IN FETCHEVENTSBYGROUP')
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
        default:
            return state;
    }
}
