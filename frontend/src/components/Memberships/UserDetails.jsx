import { useSelector } from "react-redux"
import { useNavigate } from 'react-router-dom';

export default function UserDetails() {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.session)


    if (!user) {
        navigate('/');
        return null;
    }

    return (
        <div>User Details page</div>
    )
}
