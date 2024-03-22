import { csrfFetch } from "./csrf";

// const variables to prevent typos and guarantee unique cases for reducer
const MEMBER_OF_THESE_GROUPS = 'membershipsReducer/memberOfTheseGroups';

const JOIN_GROUP = 'membershipsReducer/joinGroup';

const LEAVE_GROUP = 'membershipReducer/leaveGroup';

const MEMBERS_OF_THIS_GROUP = 'membershipReducer/membersOfThisGroup';


// action creators to be used by the reducer
function memberOfTheseGroups(groups) {
    return {
        type: MEMBER_OF_THESE_GROUPS,
        groups
    }
}

function joinGroup(membership) {
    return {
        type: JOIN_GROUP,
        membership
    }
}

function leaveGroup(groupId) {
    return {
        type: LEAVE_GROUP,
        groupId
    }
}

function membersOfThisGroup(members) {
    return {
        type: MEMBERS_OF_THIS_GROUP,
        members
    }
}


//thunks make fetch to the api routes in the backend then if the response is good, sends that data to the action creator, another thunk, and/or back to the component that dispatched it
export const allGroupMemberships = () => async (dispatch) => {
    const response = await csrfFetch('/api/groups/current')

    if (response.ok) {
        const data = await response.json();
        dispatch(memberOfTheseGroups(data))
    }
}

export const joinExistingGroup = (groupId) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/groups/${groupId}/membership`, {
            method: 'POST'
        })

        if (response.ok) {
            const data = await response.json();
            dispatch(joinGroup(data))
        }
    } catch (err) {
        return err;
    }
}

export const leaveThisGroup = (groupId, memberId) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/groups/${groupId}/membership/${memberId}`, {
            method: 'DELETE'
        })

        if (response.ok) {
            const data = await response.json();
            dispatch(leaveGroup(groupId))
            return data
        }
    } catch (err) {
        return err;
    }
}

export const fetchMembershipsOfGroup = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/members`)

    if (response.ok) {
        const data = await response.json();
        dispatch(membersOfThisGroup(data))
    }
}

const initialState = {memberships: null}

// reducer checks which case is being called by the action creators and creates a new reference in memory for the store of that slice of state
export default function membershipsReducer (state = initialState, action) {
    switch (action.type) {
        case MEMBER_OF_THESE_GROUPS: {
            return {...state, ...action.groups};
        }
        case JOIN_GROUP: {
            return {...state, membership: action.membership}
        }
        case LEAVE_GROUP: {
            const newState = {...state};
            newState.membership = null;
            const specificGroup = state.Groups.find(group => action.groupId === group.id)
            const indexOfGroup = state.Groups.indexOf(specificGroup);
            state.Groups.splice(indexOfGroup, 1);
            return newState;
        }
        case MEMBERS_OF_THIS_GROUP: {
            return {...state, ...action.members}
        }
        default:
            return state;
    }
}
