import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Badge } from 'react-bootstrap';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Message from '../../components/Message'; 
import Loader from '../../components/Loader';
import { 
  useGetUsersQuery, 
  useDeleteUserMutation 
} from '../../slices/usersApiSlice';

const UserListScreen = () => {
  const { data: users, isLoading, error, refetch } = useGetUsersQuery();
  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        refetch();
        toast.success('User deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const headerStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: '700',
    color: '#4a4a4a',
    marginBottom: '30px'
  };

  return (
    <>
      <h1 style={headerStyle}>User Management 🧶</h1>
      
      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
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
                <th className='py-3'>NAME</th>
                <th className='py-3'>EMAIL</th>
                <th className='py-3'>ADMIN</th>
                <th className='py-3'>VERIFIED</th>
                <th className='py-3 text-center'>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ verticalAlign: 'middle' }}>
                  <td className='py-3'>{user._id}</td>
                  <td className='py-3' style={{ fontWeight: '500' }}>{user.name}</td>
                  <td className='py-3'>
                    <a href={`mailto:${user.email}`} style={{ color: '#ff85a2', textDecoration: 'none' }}>
                      {user.email}
                    </a>
                  </td>
                  <td className='py-3'>
                    {user.isAdmin ? (
                      <Badge bg='success' style={{ borderRadius: '50px', padding: '5px 12px' }}>
                        <FaCheck />
                      </Badge>
                    ) : (
                      <FaTimes style={{ color: '#dc3545', marginLeft: '12px' }} />
                    )}
                  </td>
                  <td className='py-3'>
                    {user.isVerified ? (
                      <Badge bg='info' style={{ borderRadius: '50px', padding: '5px 12px' }}>
                        <FaCheck />
                      </Badge>
                    ) : (
                      <FaTimes style={{ color: '#dc3545', marginLeft: '12px' }} />
                    )}
                  </td>
                  <td className='py-3 text-center'>
                    <LinkContainer to={`/admin/user/${user._id}/edit`}>
                      <Button variant='light' className='btn-sm mx-2' style={{ borderRadius: '8px' }}>
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      style={{ borderRadius: '8px' }}
                      onClick={() => deleteHandler(user._id)}
                    >
                      <FaTrash style={{ color: 'white' }} />
                    </Button>
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

export default UserListScreen;