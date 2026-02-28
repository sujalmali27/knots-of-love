import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Login successful!');
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <h1 className="mb-4" style={{ fontWeight: '700', color: '#333' }}>Sign In</h1>
      
      <Form onSubmit={submitHandler}>
        <Form.Group className='my-3' controlId='email'>
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type='email'
            placeholder='Enter email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ borderRadius: '10px', padding: '12px' }} // Custom rounded style
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-3' controlId='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Enter password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ borderRadius: '10px', padding: '12px' }} // Custom rounded style
          ></Form.Control>
        </Form.Group>

        <div className="d-flex justify-content-between align-items-center mt-4">
          <Button 
            disabled={isLoading} 
            type='submit' 
            variant='primary' 
            style={{ padding: '10px 30px', borderRadius: '10px', fontWeight: 'bold' }}
          >
            Sign In
          </Button>

          {/* 🚀 NEW: Forgot Password Link */}
          <Link 
            to='/forgot-password' 
            style={{ color: '#ff91a4', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}
          >
            Forgot Password?
          </Link>
        </div>

        {isLoading && <Loader />}
      </Form>

      <Row className='py-4'>
        <Col>
          New Customer?{' '}
          <Link 
            to={redirect !== '/' ? `/register?redirect=${redirect}` : '/register'}
            style={{ fontWeight: '600', color: '#333' }}
          >
            Register
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginScreen;