import { useState, useEffect } from 'react';
import { Form, Button, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod } from '../slices/cartSlice';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  // 🛡️ Safety Check: Redirect if shipping address is missing
  useEffect(() => {
    if (!shippingAddress || !shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  // Pre-fill logic ensures the selection is remembered if the user clicks 'Back'
  const [paymentMethod, setPaymentMethod] = useState(cart.paymentMethod || 'Razorpay');

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <FormContainer>
      {/* 🌸 Step indicator: Sign In, Shipping, and Payment are active (1, 2, 3) */}
      <CheckoutSteps step1 step2 step3 />
      
      <h1 style={{ 
        fontFamily: "'Playfair Display', serif", 
        color: '#4a4a4a', 
        textAlign: 'center',
        margin: '30px 0' 
      }}>
        Payment Method
      </h1>
      
      <Card className="p-4 shadow-sm" style={{ borderRadius: '25px', border: 'none' }}>
        <Form onSubmit={submitHandler}>
          <Form.Group>
            <Form.Label as='legend' className='mb-4 text-muted' style={{ fontWeight: '600' }}>
                Select Preferred Method
            </Form.Label>
            <Col>
              {/* Highlighted Radio Box for better UX */}
              <div style={{
                backgroundColor: '#fff5f7', 
                padding: '20px',
                borderRadius: '15px',
                border: '1px solid #ff85a2',
                marginBottom: '20px'
              }}>
                <Form.Check
                  type='radio'
                  label='Razorpay (UPI, Cards, NetBanking)'
                  id='Razorpay'
                  name='paymentMethod'
                  value='Razorpay'
                  checked={paymentMethod === 'Razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ fontWeight: '500', color: '#4a4a4a' }}
                />
              </div>
            </Col>
          </Form.Group>

          <div className='d-flex justify-content-between mt-4'>
            <Button 
              type='button' 
              variant='light' 
              onClick={() => navigate('/shipping')}
              style={{ borderRadius: '50px', padding: '10px 25px' }}
            >
              ← Back
            </Button>
            <Button 
              type='submit' 
              style={{ 
                backgroundColor: '#ff85a2', 
                borderColor: '#ff85a2', 
                borderRadius: '50px', 
                padding: '10px 30px',
                fontWeight: '600'
              }}
            >
              Continue
            </Button>
          </div>
        </Form>
      </Card>
    </FormContainer>
  );
};

export default PaymentScreen;