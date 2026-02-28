import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
} from '../../slices/productApiSlice';

const ProductListScreen = () => {
  const navigate = useNavigate();

  const { data: products, isLoading, error, refetch } = useGetProductsQuery({});
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();
  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        refetch();
        toast.success('Product deleted');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const createProductHandler = async () => {
    if (window.confirm('Are you sure you want to create a new product?')) {
      try {
        const res = await createProduct().unwrap();
        refetch();
        navigate(`/admin/product/${res._id}/edit`);
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const headerStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: '700',
    color: '#4a4a4a',
  };

  return (
    <>
      <Row className='align-items-center mb-4'>
        <Col>
          <h1 style={headerStyle}>Products</h1>
        </Col>
        <Col className='text-end'>
          <Button 
            className='my-3' 
            onClick={createProductHandler}
            style={{ 
              backgroundColor: '#007bff', 
              borderRadius: '10px',
              fontWeight: '600',
              padding: '10px 20px'
            }}
          >
            <FaPlus className='mb-1' /> Create Product
          </Button>
        </Col>
      </Row>

      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '25px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: '1px solid #f8f9fa'
        }}>
          <Table hover responsive className='table-sm mb-0'>
            <thead>
              <tr style={{ borderBottom: '2px solid #f4f4f4' }}>
                <th className='py-3'>ID</th>
                <th className='py-3'>NAME</th>
                <th className='py-3'>PRICE</th>
                <th className='py-3'>CATEGORY</th>
                <th className='py-3'>BRAND</th>
                <th className='py-3 text-center'>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} style={{ verticalAlign: 'middle' }}>
                  <td className='py-3'>{product._id}</td>
                  <td className='py-3' style={{ fontWeight: '500' }}>
                    {product.name}
                  </td>
                  <td className='py-3'>₹{product.price}</td>
                  <td className='py-3'>{product.category}</td>
                  <td className='py-3'>{product.brand}</td>
                  <td className='py-3 text-center'>
                    <LinkContainer to={`/admin/product/${product._id}/edit`}>
                      <Button variant='light' className='btn-sm mx-2' style={{ borderRadius: '8px' }}>
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      style={{ borderRadius: '8px' }}
                      onClick={() => deleteHandler(product._id)}
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

export default ProductListScreen;