import { csrfFetch } from './csrf.js';

const LIST_GROUPS = 'groupsReducer/listGroups';

const SINGLE_GROUP = 'groupsReducer/singleGroup';

function listGroups(groups) {
   return {
        type: LIST_GROUPS,
        groups
   }
}

function singleGroup(group) {
    return {
        type: SINGLE_GROUP,
        group
    }
}

export const fetchAllGroups = () => async (dispatch) => {
    const response = await csrfFetch('/api/groups');

    if(response.ok) {
        const data = await response.json()
        dispatch(listGroups(data));
    } else {
        console.log('ERROR IN FETCHALLGROUPS')
    }
}

export const fetchSingleGroup = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}`);

    if (response.ok) {
        const data = await response.json();
        dispatch(singleGroup(data));
    } else {
        console.log('ERROR IN FETCHSINGLEGROUP')
    }
}

const initialState = {groups: null}


export default function groupsReducer (state = initialState, action) {
    switch (action.type) {
        case LIST_GROUPS: {
            return {...state, ...action.groups}
        }
        case SINGLE_GROUP: {
            return {...state, group: action.group}
        }
        default:
            return state;
    }
}
