import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from '../../slices/usersApiSlice';

const UserEditScreen = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const { data: user, isLoading, error, refetch } = useGetUserDetailsQuery(userId);
  const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setIsAdmin(user.isAdmin);
      setIsVerified(user.isVerified);
    }
  }, [user]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ userId, name, email, isAdmin, isVerified }).unwrap();
      toast.success('User updated successfully');
      refetch();
      navigate('/admin/userlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link to='/admin/userlist' className='btn btn-light my-3' style={{ borderRadius: '50px' }}>
        ← Go Back
      </Link>
      <FormContainer>
        <Card style={{ 
          borderRadius: '25px', 
          border: 'none', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          padding: '30px'
        }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: '700', color: '#4a4a4a' }}>
            Edit User Settings 🧶
          </h1>

          {loadingUpdate && <Loader />}
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>{error?.data?.message || error.error}</Message>
          ) : (
            <Form onSubmit={submitHandler}>
              <Form.Group className='mb-3' controlId='name'>
                <Form.Label style={{ fontWeight: '600' }}>Full Name</Form.Label>
                <Form.Control
                  type='name'
                  placeholder='Enter name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ borderRadius: '12px', padding: '12px' }}
                />
              </Form.Group>

              <Form.Group className='mb-3' controlId='email'>
                <Form.Label style={{ fontWeight: '600' }}>Email Address</Form.Label>
                <Form.Control
                  type='email'
                  placeholder='Enter email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ borderRadius: '12px', padding: '12px' }}
                />
              </Form.Group>

              <Form.Group className='mb-3' controlId='isadmin'>
                <Form.Check
                  type='checkbox'
                  label='Grant Admin Privileges'
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
              </Form.Group>

              <Form.Group className='mb-4' controlId='isverified'>
                <Form.Check
                  type='checkbox'
                  label='Mark as Verified Customer'
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                />
              </Form.Group>

              <Button type='submit' className='w-100 py-3' style={{ 
                backgroundColor: '#ff85a2', 
                borderColor: '#ff85a2', 
                borderRadius: '50px',
                fontWeight: '700',
                fontSize: '1.1rem'
              }}>
                Update User Profile
              </Button>
            </Form>
          )}
        </Card>
      </FormContainer>
    </>
  );
};

export default UserEditScreen;