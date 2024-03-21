import { csrfFetch } from './csrf.js';

const LIST_GROUPS = 'groupsReducer/listGroups';

const SINGLE_GROUP = 'groupsReducer/singleGroup';

const CREATE_NEW_GROUP = 'groupsReducer/createNewGroup';

const DELETE_GROUP = 'groupsReducer/deleteGroup';

const UPDATE_GROUP = 'groupsReducer/updateGroup';

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

function deleteGroup(groupId) {
    return {
        type: DELETE_GROUP,
        groupId
    }
}

function updateGroup(group) {
    return {
        type: UPDATE_GROUP,
        group
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
        body: JSON.stringify({
            name: payload.name,
            about: payload.about,
            type: payload.type,
            private: payload.private,
            city: payload.city,
            state: payload.state

        })
    })

    if (response.ok) {
        const data = await response.json();
        dispatch(addGroupImage(payload, data));
        return data;
    }
}

export const addGroupImage = ({url}, data) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${data.id}/images`, {
        method: 'POST',
        body: JSON.stringify({url, preview: true})
    })

    if (response.ok) {
        data.GroupImages = await response.json()
        dispatch(createNewGroup(data))
    }
}

export const removeGroup = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
    })

    if (response.ok) {
        dispatch(deleteGroup(groupId))
    }
}

export const submitUpdateGroup = (groupId, payload) => async (dispatch) => {
    const body = {
        name: payload.name,
        about: payload.about,
        type: payload.type,
        private: payload.private,
        city: payload.city,
        state: payload.state
    }

    const response = await csrfFetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        body: JSON.stringify(body)
    })

    if (response.ok) {
        const data = await response.json();
        data.GroupImages = payload.image
        dispatch(updateGroup(data))
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
        case DELETE_GROUP: {
            const newState = {...state}
            delete newState[action.groupId]
            newState.group = null;
            newState.Groups = null;
            return newState
        }
        case UPDATE_GROUP: {
            return {...state, [action.group.id]: action.group}
        }
        default:
            return state;
    }
}
