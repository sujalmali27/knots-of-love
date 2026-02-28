import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate
import { Row, Col, ListGroup, Image, Card, Button, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti'; 
import Message from '../components/Message';
import Loader from '../components/Loader';
import OrderTimeline from '../components/OrderTimeline';
import { 
  useGetOrderDetailsQuery, 
  usePayOrderMutation, 
  useCreateRazorpayOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation // ✅ Import the new mutation
} from '../slices/ordersApiSlice';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate(); // ✅ Initialize navigate
  const { userInfo } = useSelector((state) => state.auth);
  const [paymentJustCompleted, setPaymentJustCompleted] = useState(false);

  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);

  const [createRazorpayOrder, { isLoading: loadingRazorpay }] = useCreateRazorpayOrderMutation();
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [updateStatus, { isLoading: loadingStatus }] = useUpdateOrderStatusMutation();
  const [cancelOrder, { isLoading: loadingCancel }] = useCancelOrderMutation(); // ✅ Initialize hook

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const paymentHandler = async () => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      const res = await createRazorpayOrder(orderId).unwrap();
      const options = {
        key: 'rzp_test_RzqsCUqkjx1MRl', 
        amount: res.amount,
        currency: 'INR',
        name: 'Knots Of Love',
        description: 'Handmade Crochet Order',
        order_id: res.id,
        handler: async function (response) {
          try {
            await payOrder({ orderId, details: response }).unwrap();
            setPaymentJustCompleted(true);
            refetch();
            
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#ff85a2', '#ffffff', '#ffd1dc']
            });

            toast.success('Payment Successful');
          } catch (err) {
            toast.error(err?.data?.message || err.error);
          }
        },
        prefill: {
          name: order?.user?.name, 
          email: order?.user?.email,
        },
        theme: { color: '#ff85a2' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // ✅ New Cancel Handler
  const cancelOrderHandler = async () => {
    if (window.confirm('Are you sure you want to cancel this order? This will release your items back into the shop.')) {
      try {
        await cancelOrder(orderId).unwrap();
        toast.success('Order cancelled successfully');
        navigate('/profile'); // Redirect user back to profile after cancellation
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const statusHandler = async (status) => {
    try {
      await updateStatus({ orderId, status });
      refetch();
      toast.success(`Order updated to ${status}`);
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

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error?.data?.message || error.error}</Message>
  ) : (
    <>
      <h1 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '10px' }}>
        Order {order._id}
      </h1>

      {(!order.isPaid && !paymentJustCompleted) && (
        <Message variant='danger' style={{ borderRadius: '15px', marginBottom: '25px' }}>
          <strong>Action Required:</strong> Your order is recorded, but <strong>not yet confirmed</strong>. 
          Please complete the payment below to reserve your crochet items.
        </Message>
      )}
      
      {(order.isPaid || paymentJustCompleted) && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#fff5f7',
          borderRadius: '30px',
          border: '2px dashed #ff85a2',
          marginBottom: '40px',
          boxShadow: '0 10px 20px rgba(255, 133, 162, 0.1)'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🧶</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#ff85a2', fontWeight: '700' }}>
            Thank You for the Love!
          </h2>
          <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '600px', margin: '10px auto' }}>
            Your payment was successful. We've picked up our hooks and are starting on your handmade treasures!
          </p>
          <Link to='/'>
            <Button style={{ 
              backgroundColor: '#ff85a2', borderColor: '#ff85a2', 
              borderRadius: '50px', padding: '10px 30px',
              marginTop: '15px', fontWeight: '600'
            }}>
              Continue Shopping
            </Button>
          </Link>
        </div>
      )}

      <OrderTimeline currentStatus={order.status} />

      <Row className="mt-4">
        <Col md={8}>
          <ListGroup variant='flush' className="shadow-sm" style={{ borderRadius: '25px', overflow: 'hidden' }}>
            <ListGroup.Item className="p-4 border-0">
              <h2 style={sectionHeaderStyle}>Shipping</h2>
              <p className="mt-3"><strong>Name: </strong> {order?.user?.name}</p>
              <p><strong>Email: </strong> {order?.user?.email}</p>
              <p>
                <strong>Address: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant='success'>Delivered on {new Date(order.deliveredAt).toLocaleString()}</Message>
              ) : (
                <Message variant='danger'>Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item className="p-4 border-0">
              <h2 style={sectionHeaderStyle}>Payment Method</h2>
              <p className="mt-3"><strong>Method: </strong>{order.paymentMethod}</p>
              
              {(order.isPaid || paymentJustCompleted) ? (
                <Message variant='success'>
                  Paid {order.paidAt ? `on ${new Date(order.paidAt).toLocaleString()}` : 'Just Now'}
                </Message>
              ) : (
                <Message variant='danger'>
                  <strong>Unpaid:</strong> Order will be automatically cancelled if payment is not received.
                </Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item className="p-4 border-0">
              <h2 style={sectionHeaderStyle}>Customization Request</h2>
              <div style={{ 
                backgroundColor: '#f0faff', padding: '15px', borderRadius: '15px', 
                marginTop: '15px', borderLeft: '5px solid #03a9f4' 
              }}>
                <strong>Note from customer:</strong> {order.customizationMessage || 'No special instructions provided.'}
              </div>
            </ListGroup.Item>

            <ListGroup.Item className="p-4 border-0">
              <h2 style={sectionHeaderStyle}>Order Items</h2>
              <ListGroup variant='flush' className="mt-3">
                {order.orderItems.map((item, index) => (
                  <ListGroup.Item key={index} className="px-0 border-0">
                    <Row className="align-items-center">
                      <Col md={1} xs={2}>
                        <Image src={item.image} alt={item.name} fluid rounded />
                      </Col>
                      <Col>{item.name}</Col>
                      <Col md={4} xs={10} className="text-end text-muted">
                        {item.qty} x ₹{item.price} = <strong>₹{(item.qty * item.price).toFixed(2)}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card style={{ borderRadius: '25px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <ListGroup variant='flush'>
              <ListGroup.Item style={{ borderRadius: '25px 25px 0 0' }} className="p-4">
                <h2 style={{ fontFamily: "'Playfair Display', serif", textAlign: 'center' }}>
                  Order Summary
                </h2>
              </ListGroup.Item>
              <ListGroup.Item className="px-4">
                <Row><Col>Items</Col><Col className="text-end">₹{order.itemsPrice}</Col></Row>
              </ListGroup.Item>
              <ListGroup.Item className="px-4">
                <Row><Col>Shipping</Col><Col className="text-end">₹{order.shippingPrice}</Col></Row>
              </ListGroup.Item>
              <ListGroup.Item className="px-4 py-3">
                <Row style={{ fontSize: '1.3rem', fontWeight: '700', color: '#ff85a2' }}>
                  <Col>Total</Col>
                  <Col className="text-end">₹{order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>

              {/* Payment & Cancellation Buttons */}
              {(!order.isPaid && !paymentJustCompleted) && (
                <ListGroup.Item style={{ borderRadius: '0 0 25px 25px' }} className="p-4 bg-light">
                  {loadingRazorpay || loadingPay ? (
                    <Loader />
                  ) : (
                    <>
                      <Button
                        type='button'
                        className='w-100 py-3 mb-3'
                        onClick={paymentHandler}
                        style={{ 
                          backgroundColor: '#ff85a2', borderColor: '#ff85a2', 
                          borderRadius: '50px', fontWeight: '700', fontSize: '1.1rem',
                          boxShadow: '0 4px 15px rgba(255, 133, 162, 0.4)'
                        }}
                      >
                        Pay Now with Razorpay
                      </Button>

                      {/* ✅ Cancel Button */}
                      {loadingCancel ? (
                        <Loader />
                      ) : (
                        <Button
                          variant="outline-danger"
                          className="w-100 py-2"
                          onClick={cancelOrderHandler}
                          style={{ borderRadius: '50px', fontWeight: '600' }}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </>
                  )}
                  <p className="text-center mt-3 mb-0 text-muted small">
                    <i className="fas fa-shield-alt"></i> Secure Payment via Razorpay
                  </p>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>

          {/* Admin Tools Section */}
          {userInfo && userInfo.isAdmin && (order.isPaid || paymentJustCompleted) && (
            <Card className="mt-4 p-3" style={{ borderRadius: '25px', border: '1px solid #eee' }}>
              <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>Admin: Tracking</h4>
              {loadingStatus && <Loader />}
              <Form.Control
                as='select'
                value={order.status}
                onChange={(e) => statusHandler(e.target.value)}
                className="mt-2"
                style={{ borderRadius: '10px' }}
              >
                <option value='Placed'>Placed</option>
                <option value='Processing'>Processing</option>
                <option value='Shipped'>Shipped</option>
                <option value='Arrived'>Arrived</option>
              </Form.Control>
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;