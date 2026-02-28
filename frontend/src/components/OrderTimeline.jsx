import React from 'react';
import { FaBox, FaCogs, FaShippingFast, FaHome, FaCheckCircle } from 'react-icons/fa';
import './OrderTimeline.css'; // We'll create this next

const OrderTimeline = ({ currentStatus }) => {
  const statuses = ['Placed', 'Processing', 'Shipped', 'Arrived'];
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="timeline-container">
      {statuses.map((status, index) => (
        <div key={status} className={`timeline-step ${index <= currentIndex ? 'active' : ''}`}>
          <div className="icon-wrapper">
            {status === 'Placed' && <FaBox />}
            {status === 'Processing' && <FaCogs />}
            {status === 'Shipped' && <FaShippingFast />}
            {status === 'Arrived' && <FaHome />}
            {index <= currentIndex && <FaCheckCircle className="check-icon" />}
          </div>
          <p>{status}</p>
          {index < statuses.length - 1 && <div className="line"></div>}
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;