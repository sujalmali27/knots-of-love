import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormContainer from '../../components/FormContainer';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
  useUpdateProductMutation,
  useGetProductDetailsQuery,
  useUploadProductImageMutation,
} from '../../slices/productApiSlice';

const ProductEditScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');

  const { data: product, isLoading, error } = useGetProductDetailsQuery(productId);
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setImage(product.image);
      setBrand(product.brand);
      setCategory(product.category);
      setCountInStock(product.countInStock);
      setDescription(product.description);
    }
  }, [product]);

  // ✅ UPDATED: Optimized Upload Handler with 5MB Validation
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // 1. Client-side Pre-check for 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File is too large! Please upload an image under 5MB.');
    }

    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);

      // ✅ Path Cleaning Logic for local and production compatibility
      const cleanPath = res.image.replace(/\\/g, '/').replace('backend/', '');
      const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
      
      setImage(finalPath);
    } catch (err) {
      // ✅ This catches the "Image too large! Max limit is 5MB" error from backend
      toast.error(err?.data?.message || err.error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateProduct({
        productId,
        name,
        price,
        image,
        brand,
        category,
        countInStock,
        description,
      }).unwrap();
      toast.success('Product updated successfully');
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const headerStyle = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: '700',
    color: '#4a4a4a',
    marginBottom: '20px'
  };

  return (
    <>
      <Link to='/admin/productlist' className='btn btn-light my-3' style={{ borderRadius: '50px' }}>
        ← Go Back
      </Link>
      
      <FormContainer>
        <Card style={{ 
          borderRadius: '25px', 
          border: 'none', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          padding: '30px',
          backgroundColor: '#ffffff'
        }}>
          <h1 style={headerStyle}>Edit Product 🧶</h1>

          {loadingUpdate && <Loader />}
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>{error.data?.message || error.error}</Message>
          ) : (
            <Form onSubmit={submitHandler}>
              <Form.Group controlId='name' className='mb-3'>
                <Form.Label style={{ fontWeight: '600' }}>Product Name (Include Emojis! 🌹)</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='e.g. 🌹 Red Rose Bouquet'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ borderRadius: '12px', padding: '12px' }}
                />
              </Form.Group>

              <Form.Group controlId='price' className='mb-3'>
                <Form.Label style={{ fontWeight: '600' }}>Price (₹)</Form.Label>
                <Form.Control
                  type='number'
                  placeholder='Enter price'
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ borderRadius: '12px', padding: '12px' }}
                />
              </Form.Group>

              <Form.Group controlId='image' className='mb-3 text-center'>
                <div style={{ textAlign: 'left' }}>
                   <Form.Label style={{ fontWeight: '600' }}>Product Image</Form.Label>
                   <Form.Control
                    type='text'
                    placeholder='Image path'
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className='mb-2'
                    style={{ borderRadius: '12px' }}
                  />
                  {/* ✅ Added accept attribute for better UX */}
                  <Form.Control
                    type='file'
                    label='Choose File'
                    accept='image/png, image/jpeg, image/jpg'
                    onChange={uploadFileHandler}
                    style={{ borderRadius: '12px' }}
                  />
                </div>
                {loadingUpload && <Loader />}
                {image && (
                  <div className='mt-3'>
                    <img 
                      src={image} 
                      alt='preview' 
                      style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '15px', border: '2px solid #ff85a2' }} 
                    />
                    <p style={{ fontSize: '0.8rem', color: '#888' }} className='mt-1'>Live Preview</p>
                  </div>
                )}
              </Form.Group>

              <div className='row'>
                <div className='col-md-6'>
                  <Form.Group controlId='brand' className='mb-3'>
                    <Form.Label style={{ fontWeight: '600' }}>Brand</Form.Label>
                    <Form.Control
                      type='text'
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    />
                  </Form.Group>
                </div>
                <div className='col-md-6'>
                  <Form.Group controlId='countInStock' className='mb-3'>
                    <Form.Label style={{ fontWeight: '600' }}>Stock Quantity</Form.Label>
                    <Form.Control
                      type='number'
                      value={countInStock}
                      onChange={(e) => setCountInStock(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group controlId='category' className='mb-3'>
                <Form.Label style={{ fontWeight: '600' }}>Category</Form.Label>
                <Form.Select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ borderRadius: '12px', padding: '10px' }}
                >
                  <option value=''>Select Category</option>
                  <option value='Flowers'>Flowers 🌹</option>
                  <option value='Hair Accessories'>Hair Accessories 🎀</option>
                  <option value='Keychains'>Keychains 🔑</option>
                  <option value='Decor'>Home Decor 🏠</option>
                </Form.Select>
              </Form.Group>

              <Form.Group controlId='description' className='mb-4'>
                <Form.Label style={{ fontWeight: '600' }}>Description</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ borderRadius: '12px' }}
                />
              </Form.Group>

              <Button
                type='submit'
                className='w-100 py-3'
                style={{ 
                  backgroundColor: '#ff85a2', 
                  borderColor: '#ff85a2', 
                  borderRadius: '50px',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 15px rgba(255, 133, 162, 0.3)'
                }}
              >
                Update Product Details
              </Button>
            </Form>
          )}
        </Card>
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;