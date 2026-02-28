import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  // 🎨 Style for the step the user is CURRENTLY on
  const activeStyle = {
    color: '#ff85a2', // primary-pink
    fontWeight: '700',
    borderBottom: '2px solid #ff85a2',
    transition: 'all 0.3s ease'
  };

  // ⚪ Style for steps not yet reached
  const disabledStyle = {
    color: '#ccc',
    cursor: 'not-allowed',
  };

  // ✅ Style for steps already completed (Finished but not current)
  const completedStyle = {
    color: '#ff85a2',
    fontWeight: '500',
    opacity: '0.8'
  };

  return (
    <Nav 
      className='justify-content-center mb-5 mt-2' 
      style={{ 
        fontFamily: "'Playfair Display', serif", 
        fontSize: '1.1rem',
        letterSpacing: '0.5px'
      }}
    >
      <Nav.Item>
        {step1 ? (
          <LinkContainer to='/login'>
            {/* If step2 isn't active yet, this is the current step */}
            <Nav.Link style={!step2 ? activeStyle : completedStyle}>Sign In</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link style={disabledStyle} disabled>Sign In</Nav.Link>
        )}
      </Nav.Item>

      <span className="mx-2 align-self-center text-muted" style={{ opacity: 0.3 }}>—</span>

      <Nav.Item>
        {step2 ? (
          <LinkContainer to='/shipping'>
            <Nav.Link style={step2 && !step3 ? activeStyle : completedStyle}>Shipping</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link style={disabledStyle} disabled>Shipping</Nav.Link>
        )}
      </Nav.Item>

      <span className="mx-2 align-self-center text-muted" style={{ opacity: 0.3 }}>—</span>

      <Nav.Item>
        {step3 ? (
          <LinkContainer to='/payment'>
            <Nav.Link style={step3 && !step4 ? activeStyle : completedStyle}>Payment</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link style={disabledStyle} disabled>Payment</Nav.Link>
        )}
      </Nav.Item>

      <span className="mx-2 align-self-center text-muted" style={{ opacity: 0.3 }}>—</span>

      <Nav.Item>
        {step4 ? (
          <LinkContainer to='/placeorder'>
            <Nav.Link style={activeStyle}>Place Order</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link style={disabledStyle} disabled>Place Order</Nav.Link>
        )}
      </Nav.Item>
    </Nav>
  );
};

export default CheckoutSteps;