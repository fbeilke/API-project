import { csrfFetch } from './csrf.js';

const LIST_EVENTS = 'eventsReducer/listEvents';

function listEvents(events) {
   return {
        type: LIST_EVENTS,
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

const initialState = {events: null}


export default function eventsReducer (state = initialState, action) {
    switch (action.type) {
        case LIST_EVENTS: {
            return {...state, ...action.events}
        }
        default:
            return state;
    }
}
