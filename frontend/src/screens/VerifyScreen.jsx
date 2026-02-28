import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useVerifyEmailMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice'; // ✅ Import setCredentials

const VerifyScreen = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const dispatch = useDispatch();
  
  // ✅ Prevent double execution in React Strict Mode
  const verifyCalled = useRef(false);

  const [verifyEmailApi] = useVerifyEmailMutation();

  useEffect(() => {
    const verify = async () => {
      // ✅ Lock the function so it only runs once
      if (verifyCalled.current) return;
      verifyCalled.current = true;

      if (!token) {
        setStatus('error');
        return;
      }

      try {
        // ✅ The backend now returns user data for auto-login
        const res = await verifyEmailApi(token).unwrap();
        
        // ✅ Save user info to Redux/LocalStorage to show name in Navbar
        dispatch(setCredentials({ ...res }));
        
        setStatus('success');
      } catch (err) {
        console.error("Verification error:", err);
        setStatus('error');
      }
    };

    verify();
  }, [token, verifyEmailApi, dispatch]);

  return (
    <Container className='text-center mt-5'>
      {status === 'verifying' && (
        <>
          <h2>Verifying your email...</h2>
          <Loader />
        </>
      )}
      
      {status === 'success' && (
        <div className='mt-4'>
          <Message variant='success'>
            <h2>Email Verified Successfully!</h2>
            <p>Your account is now active. You are automatically logged in.</p>
          </Message>
          {/* ✅ Change label to Home since they are already logged in */}
          <Link to="/" className="btn btn-primary mt-3">
            Go to Home
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className='mt-4'>
          <Message variant='danger'>
            <h2>Verification Failed</h2>
            <p>The link may be invalid or has already expired.</p>
          </Message>
          <Link to="/register" className='btn btn-light mt-3'>
            Try Registering Again
          </Link>
        </div>
      )}
    </Container>
  );
};

export default VerifyScreen;