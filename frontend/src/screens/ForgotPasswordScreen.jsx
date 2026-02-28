import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import { useForgotPasswordMutation } from '../slices/usersApiSlice'; // ✅ Hook imported

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');

  // ✅ Mutation hook initialized
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation(); 

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    try {
      // ✅ Actual API call triggered
      await forgotPassword({ email }).unwrap();
      toast.success('If an account exists, a reset link has been sent to your email.');
      setEmail(''); // Clear input on success
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <h1 className="mb-4" style={{ fontWeight: '700', color: '#333' }}>Reset Password</h1>
      <p className="text-muted mb-4">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <Form onSubmit={submitHandler}>
        <Form.Group className='my-3' controlId='email'>
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type='email'
            placeholder='Enter your registered email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ borderRadius: '10px', padding: '12px' }}
          ></Form.Control>
        </Form.Group>

        <Button
          disabled={isLoading}
          type='submit'
          variant='primary'
          className="w-100 mt-3"
          style={{ 
            padding: '12px', 
            borderRadius: '10px', 
            fontWeight: 'bold', 
            backgroundColor: '#ff91a4', 
            border: 'none' 
          }}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        {isLoading && <Loader />}
      </Form>
    </FormContainer>
  );
};

export default ForgotPasswordScreen;