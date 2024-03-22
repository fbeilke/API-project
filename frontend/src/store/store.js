import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import sessionReducer from './session';
import groupsReducer from './groups';
import eventsReducer from './events';
import membershipsReducer from './memberships';

// the rootReducer that the app looks at with all the other reducers for each slice of state combined
const rootReducer = combineReducers({
  session: sessionReducer,
  groups: groupsReducer,
  events: eventsReducer,
  memberships: membershipsReducer
});

// allows us to use thunks and also gives us access to the redux logger in dev
let enhancer;
if (import.meta.env.MODE === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
