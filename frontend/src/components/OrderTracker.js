import React from 'react';
import { Nav } from 'react-bootstrap';

const OrderTracker = ({ status }) => {
  // Map your backend enum to a visual list
  const steps = ['Placed', 'Processing', 'Shipped', 'Arrived'];
  
  // Find the index of the current status (e.g., 'Processing' is index 1)
  const currentStepIndex = steps.indexOf(status);

  return (
    <Nav className='justify-content-center mb-4 status-tracker'>
      {steps.map((step, index) => (
        <Nav.Item key={step} className='text-center px-3'>
          {index <= currentStepIndex ? (
            // Completed or Current Steps
            <div className='d-flex flex-column align-items-center'>
              <span style={{ color: '#28a745', fontSize: '1.2rem' }}>
                {index === 3 ? '🏁' : '●'}
              </span>
              <Nav.Link className='p-0 text-success font-weight-bold' style={{ cursor: 'default' }}>
                {step}
              </Nav.Link>
            </div>
          ) : (
            // Future Steps
            <div className='d-flex flex-column align-items-center'>
              <span style={{ color: '#dee2e6', fontSize: '1.2rem' }}>○</span>
              <Nav.Link disabled className='p-0 text-muted' style={{ cursor: 'default' }}>
                {step}
              </Nav.Link>
            </div>
          )}
        </Nav.Item>
      ))}
    </Nav>
  );
};

export default OrderTracker;