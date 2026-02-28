import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import CheckoutSteps from '../components/CheckoutSteps';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { clearCartItems } from '../slices/cartSlice';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);
  const itemsPrice = addDecimals(cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0));
  const shippingPrice = addDecimals(40);
  const totalPrice = (Number(itemsPrice) + Number(shippingPrice)).toFixed(2);

  useEffect(() => {
    if (!cart.shippingAddress.address) navigate('/shipping');
    else if (!cart.paymentMethod) navigate('/payment');
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    try {
      // 1. Create the order in MongoDB
      const orderData = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice: 0,
        totalPrice,
        customizationMessage: cart.customizationMessage,
      }).unwrap();

      // 2. Success: Clear the cart immediately
      dispatch(clearCartItems());

      // 3. Move to the Order Details screen to handle the actual payment
      // This stops the app from looking for a "/success" page that doesn't exist
      navigate(`/order/${orderData._id}`); 
      
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const sectionHeaderStyle = { 
    fontFamily: "'Playfair Display', serif", 
    color: '#4a4a4a', 
    borderBottom: '1px solid #eee', 
    paddingBottom: '10px', 
    marginTop: '20px' 
  };

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant='flush' className="bg-transparent">
            <ListGroup.Item className="border-0 bg-transparent">
              <h2 style={sectionHeaderStyle}>Shipping Details</h2>
              <p className="mt-3">
                <strong>Address: </strong>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item className="border-0 bg-transparent">
              <h2 style={sectionHeaderStyle}>Payment Method</h2>
              <p className="mt-3"><strong>Method: </strong> {cart.paymentMethod}</p>
            </ListGroup.Item>

            <ListGroup.Item className="border-0 bg-transparent">
              <h2 style={sectionHeaderStyle}>Customization</h2>
              <p className="mt-3">{cart.customizationMessage || "No specific instructions provided."}</p>
            </ListGroup.Item>

            <ListGroup.Item className="border-0 bg-transparent">
              <h2 style={sectionHeaderStyle}>Order Items</h2>
              {cart.cartItems.map((item, index) => (
                <Row key={index} className="align-items-center mb-2">
                  <Col md={1}><Image src={item.image} alt={item.name} fluid rounded /></Col>
                  <Col><Link to={`/product/${item.product}`} className="text-dark">{item.name}</Link></Col>
                  <Col md={4} className="text-end">
                    {item.qty} x ₹{item.price} = ₹{addDecimals(item.qty * item.price)}
                  </Col>
                </Row>
              ))}
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '25px' }}>
            <ListGroup variant='flush'>
              <ListGroup.Item className="text-center pt-4">
                <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item><Row><Col>Items</Col><Col className="text-end">₹{itemsPrice}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col>Shipping</Col><Col className="text-end">₹{shippingPrice}</Col></Row></ListGroup.Item>
              <ListGroup.Item className="fw-bold fs-5">
                <Row><Col>Total</Col><Col className="text-end">₹{totalPrice}</Col></Row>
              </ListGroup.Item>
              <ListGroup.Item className="pb-4">
                <Button 
                  onClick={placeOrderHandler} 
                  className="w-100 rounded-pill py-3" 
                  style={{ backgroundColor: '#ff85a2', border: 'none' }}
                  disabled={cart.cartItems.length === 0}
                >
                  Place Order
                </Button>
                {isLoading && <Loader />}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderScreen;