import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Form, Button, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useUpdateProfileMutation } from '../slices/usersApiSlice';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { setCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] = useUpdateProfileMutation();
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          name,
          email,
          password,
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success('Profile updated successfully!');
        setPassword('');
        setConfirmPassword('');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const sectionHeaderStyle = {
    fontFamily: "'Playfair Display', serif",
    color: '#4a4a4a',
    marginBottom: '30px',
    textAlign: 'center',
    fontWeight: '700'
  };

  const labelGroupTitle = {
    fontSize: '0.75rem',
    color: '#ff85a2',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontWeight: '700',
    marginBottom: '20px',
    borderBottom: '1px solid #fce4ec',
    paddingBottom: '5px'
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return 'First time today!';
    const date = new Date(dateString);
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="py-3">
      <Row className="justify-content-center">
        {/* --- SECTION 1: USER IDENTITY CARD --- */}
        <Col md={10} lg={8} xl={7}>
          <div className="text-center mb-5 p-5" style={{ 
            backgroundColor: '#fff', 
            borderRadius: '30px', 
            boxShadow: '0 15px 35px rgba(0,0,0,0.02)',
            border: '1px solid #f1f1f1'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              backgroundColor: '#ff85a2',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 auto 20px auto',
              boxShadow: '0 10px 20px rgba(255, 133, 162, 0.3)'
            }}>
              {getInitials(userInfo.name)}
            </div>
            
            <h2 style={{ fontWeight: '800', marginBottom: '8px', color: '#2d2d2d' }}>{userInfo.name}</h2>
            
            <Badge bg="light" text="dark" className="mb-3" style={{ fontWeight: '500', borderRadius: '50px', border: '1px solid #eee', padding: '8px 16px' }}>
              Member since {userInfo.createdAt ? new Date(userInfo.createdAt).getFullYear() : '2026'}
            </Badge>

            <div style={{ fontSize: '0.8rem', color: '#999' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.65rem' }}>Account Status: </span>
              <span style={{ color: '#ff85a2', fontWeight: '600' }}>Active</span>
              <span className="mx-3" style={{ color: '#eee' }}>|</span>
              <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.65rem' }}>Last Login: </span>
              <span style={{ color: '#666', fontWeight: '600' }}>{formatLastLogin(userInfo.lastLogin)}</span>
            </div>
          </div>

          {/* --- SECTION 2: EDIT PROFILE FORM --- */}
          <h3 style={sectionHeaderStyle}>Update Your Details</h3>
          <Form onSubmit={submitHandler} className="mb-5">
            <Row>
              <Col md={6} className="pe-md-4">
                <p style={labelGroupTitle}>General Info</p>
                <Form.Group className='mb-4' controlId='name'>
                  <Form.Label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Display Name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ borderRadius: '15px', border: '1px solid #eee', padding: '14px', backgroundColor: '#fafafa' }}
                  ></Form.Control>
                </Form.Group>

                <Form.Group className='mb-4' controlId='email'>
                  <Form.Label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Email Address</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Enter email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ borderRadius: '15px', border: '1px solid #eee', padding: '14px', backgroundColor: '#fafafa' }}
                  ></Form.Control>
                </Form.Group>
              </Col>

              <Col md={6} className="ps-md-4">
                <p style={labelGroupTitle}>Security</p>
                <Form.Group className='mb-4' controlId='password'>
                  <Form.Label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>New Password</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Leave blank to keep current'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ borderRadius: '15px', border: '1px solid #eee', padding: '14px', backgroundColor: '#fafafa' }}
                  ></Form.Control>
                </Form.Group>

                <Form.Group className='mb-4' controlId='confirmPassword'>
                  <Form.Label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>Confirm Password</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Confirm new password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ borderRadius: '15px', border: '1px solid #eee', padding: '14px', backgroundColor: '#fafafa' }}
                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <div className="text-center mt-3">
              <Button 
                type='submit' 
                disabled={loadingUpdateProfile}
                style={{ 
                  backgroundColor: '#ff85a2', 
                  borderColor: '#ff85a2', 
                  borderRadius: '50px',
                  fontWeight: '700',
                  padding: '15px 50px',
                  boxShadow: '0 8px 20px rgba(255, 133, 162, 0.25)',
                  fontSize: '1rem'
                }}
              >
                Save Profile Changes
              </Button>
            </div>
            {loadingUpdateProfile && <Loader />}
          </Form>
        </Col>
      </Row>

      <hr className="my-5" style={{ opacity: '0.08' }} />

      {/* --- SECTION 3: MY ORDERS TABLE --- */}
      <Row className="justify-content-center">
        <Col md={12} xl={11}>
          <h2 style={{ ...sectionHeaderStyle, textAlign: 'left', marginBottom: '40px' }}>Purchase History</h2>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>{error?.data?.message || error.error}</Message>
          ) : (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '40px', 
              borderRadius: '35px', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
              border: '1px solid #f8f8f8'
            }}>
              <Table hover responsive className='table-sm mb-0'>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f9f9f9' }}>
                    <th className="pb-3" style={{ borderTop: 'none', color: '#bbb', fontWeight: '700', fontSize: '0.7rem', letterSpacing: '1.5px' }}>ORDER ID</th>
                    <th className="pb-3" style={{ borderTop: 'none', color: '#bbb', fontWeight: '700', fontSize: '0.7rem', letterSpacing: '1.5px' }}>DATE</th>
                    <th className="pb-3" style={{ borderTop: 'none', color: '#bbb', fontWeight: '700', fontSize: '0.7rem', letterSpacing: '1.5px' }}>TOTAL</th>
                    <th className="pb-3" style={{ borderTop: 'none', color: '#bbb', fontWeight: '700', fontSize: '0.7rem', letterSpacing: '1.5px' }}>PAYMENT</th>
                    <th className="pb-3" style={{ borderTop: 'none', color: '#bbb', fontWeight: '700', fontSize: '0.7rem', letterSpacing: '1.5px' }}>SHIPPING</th>
                    <th className="pb-3 text-end" style={{ borderTop: 'none', color: '#bbb', fontWeight: '700', fontSize: '0.7rem', letterSpacing: '1.5px' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} style={{ verticalAlign: 'middle' }}>
                      <td className="py-4" style={{ color: '#444', fontWeight: '600', fontSize: '0.9rem' }}>
                        #{order._id.substring(18, 24).toUpperCase()}
                      </td>
                      <td style={{ color: '#777', fontSize: '0.9rem' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ fontWeight: '800', color: '#2d2d2d', fontSize: '1rem' }}>
                        ₹{order.totalPrice.toLocaleString()}
                      </td>
                      <td>
                        {order.isPaid ? (
                          <Badge bg='' style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '50px', fontWeight: '600', padding: '8px 16px', fontSize: '0.7rem' }}>
                            Settled
                          </Badge>
                        ) : (
                          <Badge bg='' style={{ backgroundColor: '#ffebee', color: '#c62828', borderRadius: '50px', fontWeight: '600', padding: '8px 16px', fontSize: '0.7rem' }}>
                            Awaiting
                          </Badge>
                        )}
                      </td>
                      <td>
                        {order.isDelivered ? (
                          <Badge bg='' style={{ backgroundColor: '#e3f2fd', color: '#1565c0', borderRadius: '50px', fontWeight: '600', padding: '8px 16px', fontSize: '0.7rem' }}>
                            Delivered
                          </Badge>
                        ) : (
                          <Badge bg='' style={{ backgroundColor: '#f5f5f5', color: '#616161', borderRadius: '50px', fontWeight: '600', padding: '8px 16px', fontSize: '0.7rem' }}>
                            Processing
                          </Badge>
                        )}
                      </td>
                      <td className="text-end">
                        <LinkContainer to={`/order/${order._id}`}>
                          <Button className='btn-sm' variant='light' style={{ borderRadius: '50px', padding: '8px 20px', border: '1px solid #eee', fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s' }}>
                            View Details
                          </Button>
                        </LinkContainer>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProfileScreen;