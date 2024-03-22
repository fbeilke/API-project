import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
// import LoginFormPage from './components/LoginFormPage';
// import SignupFormPage from './components/SignupFormPage';
import Navigation from './components/Navigation/Navigation-bonus';
import LandingPage from './components/LandingPage/LandingPage'
import Groups from './components/Groups/Groups';
import Events from './components/Events/Events'
import GroupDetails from './components/Groups/GroupDetails'
import EventDetails from './components/Events/EventDetails';
import CreateNewGroup from './components/Groups/CreateNewGroup';
import CreateNewEvent from './components/Events/CreateNewEvent';
import UpdateGroupForm from './components/Groups/UpdateGroupForm';
import UpdateEventForm from './components/Events/UpdateEventForm';
import * as sessionActions from './store/session';
import { Modal } from './context/Modal';

// holds our entire app layout
function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  // loads after 1st render, restores previously logged in session user in case of navigation away from page or hard refresh
  // also sets isLoaded, confirming the restoreUser thunk has been run
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  // returns modal component used for login and signup, as well as nav bar and outlet for the children, rest of app components
  return (
    <>
      <Modal/>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

// layout with children, all of app components
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/groups',
        element: <Groups />
      },
      {
        path: '/events',
        element: <Events />
      },
      {
        path: '/groups/:groupId',
        element: <GroupDetails />
      },
      {
        path: '/events/:eventId',
        element: <EventDetails />
      },
      {
        path: '/groups/new',
        element: <CreateNewGroup />
      },
      {
        path: '/groups/:groupId/events/new',
        element: <CreateNewEvent />
      },
      {
        path: '/groups/:groupId/update',
        element: <UpdateGroupForm />
      },
      {
        path: '/events/:eventId/update',
        element: <UpdateEventForm />
      }
    ]
  }
]);

// the actual app component that holds all the others, returns RouterProvider with router from above passed in as prop.
function App() {
  return <RouterProvider router={router} />;
}

export default App;
