import { useParams, Link } from 'react-router-dom';

export default function EventDetails () {
    const { eventId } = useParams();

    return (
        <>
            <Link to='/events'>Back to events</Link>
            <div>Hello from event {eventId}</div>
        </>
    )
}
