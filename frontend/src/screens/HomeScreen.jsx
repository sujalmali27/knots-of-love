import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Container } from 'react-bootstrap';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import SearchBox from '../components/SearchBox'; 
import { useGetProductsQuery } from "../slices/productApiSlice"; 

const HomeScreen = () => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');

  const { data: products, isLoading, error, refetch } = useGetProductsQuery({ 
    keyword, 
    category 
  });

  useEffect(() => {
    refetch();
  }, [category, keyword, refetch]);

  const categories = ['All', 'Flowers', 'Keychains', 'Hair Accessories', 'Accessories'];

  return (
    <>
      {/* 🌸 Hero & Brand Heading */}
      <div className="text-center my-5">
        <h1 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontWeight: '700', 
          color: '#4a4a4a',
          fontSize: '3rem'
        }}>
          Our Handcrafted Collection
        </h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', letterSpacing: '1px' }}>
          Handmade with love, one stitch at a time
        </p>
      </div>

      <SearchBox 
        keyword={keyword} 
        setKeyword={setKeyword} 
        onSearch={(k) => {
          setKeyword(k);
          setCategory('All'); 
        }} 
      />

      {/* 🏷️ Category Filters */}
      <div className='category-container mb-5 text-center'>
        {categories.map((c) => (
          <Button
            key={c}
            className='mx-1 rounded-pill px-4 m-1'
            onClick={() => {
              setCategory(c);
              setKeyword(''); 
            }}
            style={category === c 
              ? { backgroundColor: '#ff85a2', borderColor: '#ff85a2', color: 'white' } 
              : { backgroundColor: 'transparent', color: '#ff85a2', borderColor: '#ff85a2' }
            }
          >
            {c}
          </Button>
        ))}
      </div>

      {/* 🛍️ Product Grid */}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Row>
          {products && products.length > 0 ? (
            products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))
          ) : (
            <Col>
              <Message variant='info'>
                No products found in the "{category}" category.
              </Message>
            </Col>
          )}
        </Row>
      )}

      <hr className="my-5" style={{ opacity: '0.1' }} />

      {/* 📖 About Us Section */}
      <Container className="my-5 py-5" style={{ backgroundColor: 'white', borderRadius: '30px', boxShadow: 'var(--shadow-sm)' }}>
        <Row className="align-items-center">
          <Col md={5} className="text-center mb-4 mb-md-0">
            <img 
              src="/logo.png" 
              alt="Knots of Love Story" 
              style={{ 
                width: '100%', 
                maxWidth: '280px', 
                borderRadius: '50%', 
                border: '8px solid var(--secondary-blush)',
                padding: '5px'
              }} 
            />
          </Col>
          <Col md={7}>
            <h2 style={{ color: 'var(--primary-pink)', marginBottom: '20px' }}>The Heart Behind the Hook</h2>
            <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#666' }}>
              Welcome to <strong>Knots Of Love</strong>! What began as a simple passion for yarn has blossomed into a cozy boutique for all things handmade. 
            </p>
            <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#666' }}>
              We believe every stitch tells a story. From vibrant bouquets that never fade to tiny keychains that brighten your day, everything here is crafted with patience and a whole lot of love.
            </p>
          </Col>
        </Row>
      </Container>

      {/* 💌 Contact & Custom Orders Section */}
      <div className="text-center my-5 py-4">
        <h2 className="mb-3">Get in Touch</h2>
        <p className="text-muted mb-4">Want a custom color or a specific flower? We're just a message away!</p>
        <Row className="justify-content-center">
          <Col xs={10} md={4} className="mb-3">
            <div className="p-4" style={{ background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <h5 style={{ color: 'var(--primary-pink)' }}>Instagram DM</h5>
              <p className="small">Best for custom design photos</p>
              <Button href="https://www.instagram.com/knots_of_loveee_?igsh=a201cmt2d21wN25l" target="_blank" className="category-btn w-100">Open Instagram</Button>
            </div>
          </Col>
          <Col xs={10} md={4} className="mb-3">
            <div className="p-4" style={{ background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <h5 style={{ color: '#25d366' }}>WhatsApp Chat</h5>
              <p className="small">Best for quick pricing questions</p>
              <Button href="https://wa.me/917304236774" target="_blank" style={{ backgroundColor: '#25d366', border: 'none', borderRadius: '50px' }} className="w-100">Chat Now</Button>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default HomeScreen;