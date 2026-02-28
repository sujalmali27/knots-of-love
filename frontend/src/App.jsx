import React from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { FaInstagram } from 'react-icons/fa'; // Added for the IG button
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';

const App = () => {
  return (
    <>
      <Header />
      <main className='py-3'>
        <Container>
          <Outlet /> 
        </Container>
      </main>
      <Footer />

      {/* 📸 Instagram Floating Button */}
      {/* This uses the .ig-float class from your index.css */}
      <a 
        href='https://www.instagram.com/knots_of_loveee_?igsh=a201cmt2d21wN25l' 
        target='_blank' 
        rel='noreferrer' 
        className='ig-float'
        aria-label="Visit our Instagram"
      >
        <FaInstagram />
      </a>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default App;