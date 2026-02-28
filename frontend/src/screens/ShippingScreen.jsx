import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { saveShippingAddress } from '../slices/cartSlice';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  // Local state initialized with existing address if available
  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress?.country || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    navigate('/payment'); // Moves to the next step after saving
  };

  return (
    <FormContainer>
      {/* 🌸 Step 1 & 2 only for this screen */}
      <CheckoutSteps step1 step2 />

      <h1 style={{ 
        fontFamily: "'Playfair Display', serif", 
        color: '#4a4a4a', 
        marginBottom: '30px',
        textAlign: 'center',
        fontWeight: '700'
      }}>
        Shipping Details
      </h1>

      <Card className="p-4 shadow-sm" style={{ 
        borderRadius: '25px', 
        border: 'none',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)' 
      }}>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='address' className='mb-3'>
            <Form.Label style={{ fontWeight: '600' }}>Address</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter address'
              value={address}
              required
              onChange={(e) => setAddress(e.target.value)}
              style={{ borderRadius: '12px', border: '1px solid #eee' }}
            />
          </Form.Group>

          <Form.Group controlId='city' className='mb-3'>
            <Form.Label style={{ fontWeight: '600' }}>City</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter city'
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
              style={{ borderRadius: '12px', border: '1px solid #eee' }}
            />
          </Form.Group>

          <Form.Group controlId='postalCode' className='mb-3'>
            <Form.Label style={{ fontWeight: '600' }}>Postal Code</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter postal code'
              value={postalCode}
              required
              onChange={(e) => setPostalCode(e.target.value)}
              style={{ borderRadius: '12px', border: '1px solid #eee' }}
            />
          </Form.Group>

          <Form.Group controlId='country' className='mb-4'>
            <Form.Label style={{ fontWeight: '600' }}>Country</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter country'
              value={country}
              required
              onChange={(e) => setCountry(e.target.value)}
              style={{ borderRadius: '12px', border: '1px solid #eee' }}
            />
          </Form.Group>

          <Button 
            type='submit' 
            style={{ 
              backgroundColor: '#ff85a2', 
              borderColor: '#ff85a2', 
              borderRadius: '50px',
              width: '100%',
              padding: '12px',
              fontWeight: '700'
            }}
          >
            Continue to Payment
          </Button>
        </Form>
      </Card>
    </FormContainer>
  );
};

export default ShippingScreen;