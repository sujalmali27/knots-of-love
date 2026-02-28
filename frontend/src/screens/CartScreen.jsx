import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, ListGroup, Image, Form, Button, Card, Container } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import Message from '../components/Message';
import { addToCart, removeFromCart, saveCustomizationMessage } from '../slices/cartSlice';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems, customizationMessage } = cart;

  const addToCartHandler = async (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const customizationHandler = (e) => {
    dispatch(saveCustomizationMessage(e.target.value));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  return (
    <Container className="py-4">
      <Row>
        <Col md={8}>
          <h1 style={{ 
            fontFamily: "'Playfair Display', serif", 
            marginBottom: '30px', 
            color: '#4a4a4a',
            fontWeight: '700' 
          }}>
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <Message>
              Your cart is empty <Link to='/'>Go Back</Link>
            </Message>
          ) : (
            <>
              <ListGroup variant='flush'>
                {cartItems.map((item) => (
                  <ListGroup.Item 
                    key={item._id} 
                    className="mb-3 border-0 shadow-sm" 
                    style={{ borderRadius: '20px', padding: '20px' }}
                  >
                    <Row className='align-items-center'>
                      <Col md={2} xs={3}>
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fluid 
                          rounded 
                          style={{ border: '2px solid var(--secondary-blush)' }} 
                        />
                      </Col>
                      <Col md={4} xs={9}>
                        <Link 
                          to={`/product/${item._id}`} 
                          style={{ color: '#4a4a4a', fontWeight: '600', textDecoration: 'none' }}
                        >
                          {item.name}
                        </Link>
                      </Col>
                      <Col md={2} xs={4} className="mt-2 mt-md-0 fw-bold">
                        ₹{item.price}
                      </Col>
                      <Col md={2} xs={5} className="mt-2 mt-md-0">
                        <Form.Control
                          as='select'
                          value={item.qty}
                          onChange={(e) => addToCartHandler(item, Number(e.target.value))}
                          style={{ borderRadius: '10px', borderColor: 'var(--secondary-blush)' }}
                        >
                          {[...Array(item.countInStock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Control>
                      </Col>
                      <Col md={2} xs={3} className="text-end">
                        <Button
                          type='button'
                          variant='light'
                          className='cart-delete-btn'
                          onClick={() => removeFromCartHandler(item._id)}
                          style={{ color: '#e74c3c' }}
                        >
                          <FaTrash />
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {/* ✍️ Customization Request Card */}
              <Card className='mt-4 border-0 shadow-sm' style={{ borderRadius: '25px' }}>
                <Card.Body className="p-4">
                  <h4 style={{ fontFamily: "'Playfair Display', serif", color: '#4a4a4a' }}>Customization Request</h4>
                  <Form.Group controlId='customMessage'>
                    <Form.Label className='text-muted small'>
                      Add a gift note or specific crochet instructions (e.g., "Change yarn color to blue")
                    </Form.Label>
                    <Form.Control
                      as='textarea'
                      rows={3}
                      placeholder='Type your instructions here...'
                      value={customizationMessage}
                      onChange={customizationHandler}
                      style={{ borderRadius: '15px', border: '1px solid var(--secondary-blush)' }}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </>
          )}
        </Col>

        {/* 🛒 Summary Sidebar */}
        <Col md={4} className="mt-5 mt-md-0">
          <Card style={{ 
            border: 'none', 
            borderRadius: '25px', 
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>
            <ListGroup variant='flush'>
              <ListGroup.Item className="p-4 border-0">
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem' }}>
                  Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items
                </h2>
                <div style={{ fontSize: '1.8rem', color: 'var(--primary-pink)', fontWeight: '700' }}>
                  ₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
                </div>
              </ListGroup.Item>
              <ListGroup.Item className="p-4 border-0 pt-0">
                <Button
                  type='button'
                  className='w-100 py-3'
                  disabled={cartItems.length === 0}
                  onClick={checkoutHandler}
                  style={{ 
                    backgroundColor: 'var(--primary-pink)', 
                    borderColor: 'var(--primary-pink)', 
                    borderRadius: '50px',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 15px rgba(255, 133, 162, 0.3)'
                  }}
                >
                  Proceed To Checkout
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartScreen;