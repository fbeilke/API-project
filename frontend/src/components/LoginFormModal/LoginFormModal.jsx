import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();


    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors)
        }
      });
  };

  return (
    <>
      <h1>Log In</h1>
      { errors.message === 'Invalid credentials' ? <p className='errors'>The provided credentials were invalid</p> : null}
      <form onSubmit={handleSubmit} className='login'>
          <input
            placeholder='Username or email'
            className='login-input'
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
          <input
            placeholder='password'
            className='login-input'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        <button className='submit-button' type="submit" disabled={credential.length < 4 || password.length < 6 ? true : false}>Log In</button>
        <button
          type="submit"
          className='demo-user'
          onClick={() => {
            setCredential('mikeschmidt87')
            setPassword('mikepassword')
            handleSubmit
          }}
        >
          Login as a demo user
        </button>
      </form>
    </>
  );
}

export default LoginFormModal;
