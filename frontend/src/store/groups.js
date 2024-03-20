import { csrfFetch } from './csrf.js';

const LIST_GROUPS = 'groupsReducer/listGroups';

const SINGLE_GROUP = 'groupsReducer/singleGroup';

const CREATE_NEW_GROUP = 'groupsReducer/createNewGroup';

const ADD_FIRST_IMAGE = 'groupsReducer/addGroupImage';

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

function createNewGroup(group) {
    return {
        type: CREATE_NEW_GROUP,
        group
    }
}

function addFirstImage(payload) {
    return {
        type: ADD_GROUP_IMAGE,
        payload
    }
}

export const fetchAllGroups = () => async (dispatch) => {
    const response = await csrfFetch('/api/groups');

    if(response.ok) {
        const data = await response.json()
        dispatch(listGroups(data));
    }
}

export const fetchSingleGroup = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}`);

    if (response.ok) {
        const data = await response.json();
        dispatch(singleGroup(data));
    }
}

export const postNewGroup = (payload) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups`, {
        method: 'POST',
        body: JSON.stringify(payload)
    })

    if (response.ok) {
        const data = await response.json();
        dispatch(createNewGroup(data));
    }
}

export const addGroupImage = (groupId, url) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/images`, {
        method: 'POST',
        body: JSON.stringify({url, preview: true})
    })

    if (response.ok) {
        const data = await response.json()
        dispatch(addFirstImage(data))
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
        case CREATE_NEW_GROUP: {
            return {...state, [action.group.id]: action.group}
        }
        case ADD_FIRST_IMAGE: {
            return {...state, [group.GroupImages[0]]: action.payload.url}
        }
        default:
            return state;
    }
}
