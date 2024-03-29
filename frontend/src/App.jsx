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
import * as sessionActions from './store/session';
import { Modal } from './context/Modal';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Modal/>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

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
      }
      // {
      //   path: 'login',
      //   element: <LoginFormPage />
      // },
      // {
      //   path: 'signup',
      //   element: <SignupFormPage />
      // }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
