import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header>
      <Navbar 
        style={{ 
          backgroundColor: '#fffafb', 
          borderBottom: '1px solid #fce4ec', 
          padding: '12px 0' 
        }} 
        variant='light' 
        expand='lg' 
        collapseOnSelect
      >
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand className='d-flex align-items-center' style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: '2rem', /* Larger font for boutique feel */
              fontWeight: '700', 
              color: '#ff85a2',
              letterSpacing: '1px'
            }}>
              <img
                src='/logo.png' 
                alt='Knots Of Love'
                style={{ 
                  width: '65px',  /* Increased from 45px for visibility */
                  height: '65px', 
                  marginRight: '15px',
                  borderRadius: '50%', 
                  border: '2px solid #fce4ec',
                  objectFit: 'cover'
                }}
              />
              Knots Of Love
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto align-items-center'>
              <LinkContainer to='/cart'>
                <Nav.Link className='mx-2' style={{ color: '#4a4a4a', fontWeight: '500' }}>
                  <FaShoppingCart /> Cart
                  {cartItems.length > 0 && (
                    <Badge pill style={{ 
                      marginLeft: '5px', 
                      backgroundColor: '#ff85a2', 
                      fontSize: '0.7rem' 
                    }}>
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>

              {userInfo ? (
                <NavDropdown title={userInfo.name} id='username' style={{ fontWeight: '500' }}>
                  <LinkContainer to='/profile'>
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to='/login'>
                  <Nav.Link style={{ color: '#4a4a4a', fontWeight: '500' }}>
                    <FaUser /> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}

              {userInfo && userInfo.isAdmin && (
                <NavDropdown title='Admin' id='adminmenu' style={{ fontWeight: '500' }}>
                  <LinkContainer to='/admin/productlist'>
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/orderlist'>
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/userlist'>
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;