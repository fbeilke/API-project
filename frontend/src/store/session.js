import { csrfFetch } from './csrf.js';

// const variables to prevent typos and guarantee unique cases for reducer
const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

// action creators to be used by the reducer
const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

const removeUser = () => ({
  type: REMOVE_USER
});

//thunks make fetch to the api routes in the backend then if the response is good, sends that data to the action creator, another thunk, and/or back to the component that dispatched it
export const login = ({ credential, password }) => async dispatch => {
  const response = await csrfFetch("/api/session", {
    method: "POST",
    body: JSON.stringify({ credential, password })
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

export const restoreUser = () => async dispatch => {
  const response = await csrfFetch("/api/session");
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

export const signup = (user) => async (dispatch) => {
  const { username, firstName, lastName, email, password } = user;
  const response = await csrfFetch("/api/users", {
    method: "POST",
    body: JSON.stringify({
      username,
      firstName,
      lastName,
      email,
      password
    })
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

export const logout = () => async (dispatch) => {
  const response = await csrfFetch("/api/session", {
    method: "DELETE"
  });
  dispatch(removeUser());
  return response;
};

const initialState = { user: null };

// reducer checks which case is being called by the action creators and creates a new reference in memory for the store of that slice of state
function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
}

export default sessionReducer;
