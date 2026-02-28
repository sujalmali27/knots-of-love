import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Badge } from 'react-bootstrap';
import { FaTimes, FaCommentDots } from 'react-icons/fa'; // Added icon for requests
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  const headerStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: '700',
    color: '#4a4a4a',
    marginBottom: '30px'
  };

  return (
    <>
      <h1 style={headerStyle}>Manage Orders 🧶</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '25px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: '1px solid #f8f9fa'
        }}>
          <Table hover responsive className='table-sm mb-0'>
            <thead>
              <tr style={{ borderBottom: '2px solid #f4f4f4' }}>
                <th className='py-3'>ID</th>
                <th className='py-3'>USER</th>
                <th className='py-3'>DATE</th>
                <th className='py-3'>TOTAL</th>
                <th className='py-3'>PAID</th>
                <th className='py-3'>DELIVERED</th>
                <th className='py-3'>CUSTOM REQUEST</th>
                <th className='py-3 text-center'>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} style={{ verticalAlign: 'middle' }}>
                  <td className='py-3'>{order._id}</td>
                  <td className='py-3' style={{ fontWeight: '500' }}>{order.user && order.user.name}</td>
                  <td className='py-3'>{order.createdAt.substring(0, 10)}</td>
                  <td className='py-3' style={{ fontWeight: '600' }}>₹{order.totalPrice}</td>
                  <td className='py-3'>
                    {order.isPaid ? (
                      <Badge bg='success' style={{ borderRadius: '50px', padding: '5px 12px' }}>
                        {order.paidAt.substring(0, 10)}
                      </Badge>
                    ) : (
                      <FaTimes style={{ color: '#dc3545', marginLeft: '10px' }} />
                    )}
                  </td>
                  <td className='py-3'>
                    {order.isDelivered ? (
                      <Badge bg='success' style={{ borderRadius: '50px', padding: '5px 12px' }}>
                        {order.deliveredAt.substring(0, 10)}
                      </Badge>
                    ) : (
                      <FaTimes style={{ color: '#dc3545', marginLeft: '10px' }} />
                    )}
                  </td>
                  
                  {/* ✅ ENHANCED CUSTOM REQUEST COLUMN */}
                  <td className='py-3'>
                    {order.customizationMessage ? (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'start', 
                        gap: '8px',
                        backgroundColor: '#f0faff',
                        padding: '8px',
                        borderRadius: '10px',
                        borderLeft: '3px solid #03a9f4',
                        maxWidth: '220px'
                      }}>
                        <FaCommentDots style={{ color: '#03a9f4', marginTop: '3px' }} />
                        <span style={{ fontSize: '0.8rem', color: '#444', lineHeight: '1.2' }}>
                          {order.customizationMessage.length > 45 
                            ? `${order.customizationMessage.substring(0, 45)}...` 
                            : order.customizationMessage}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: '#ccc', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>

                  <td className='py-3 text-center'>
                    <LinkContainer to={`/order/${order._id}`}>
                      <Button variant='light' className='btn-sm' style={{ borderRadius: '50px', padding: '5px 15px' }}>
                        Details
                      </Button>
                    </LinkContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
};

export default OrderListScreen;