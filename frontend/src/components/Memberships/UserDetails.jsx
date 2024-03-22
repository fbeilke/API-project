import { useSelector } from "react-redux"

export default function UserDetails() {
    const { user } = useSelector(state => state.session)


    if (!user) {
        navigate('/');
        return null;
    }

    return (
        <div>User Details page</div>
    )
}
