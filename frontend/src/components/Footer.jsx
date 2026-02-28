import { Container, Row, Col } from 'react-bootstrap';
import { FaInstagram, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className='py-5' style={{ backgroundColor: '#fdf0f3', marginTop: '50px' }}>
      <Container>
        <Row className='text-center'>
          <Col>
            <h4 style={{ color: '#ff85a2', fontWeight: 'bold' }}>Knots Of Love</h4>
            <p>
              Handmade with love, one stitch at a time. <FaHeart color='#ff85a2' />
            </p>
            <div className='py-3'>
              {/* Center Instagram Link */}
              <a 
                href='https://www.instagram.com/knots_of_loveee_?igsh=a201cmt2d21wN25l' 
                target='_blank' 
                rel='noreferrer' 
                className='mx-3 text-dark'
              >
                <FaInstagram size={30} />
              </a>
            </div>
            <p className='text-muted small'>&copy; {new Date().getFullYear()} Knots Of Love</p>
          </Col>
        </Row>
      </Container>
      
      {/* Floating IG Button - Appears on bottom right */}
      <a 
        href='https://www.instagram.com/knots_of_loveee_?igsh=a201cmt2d21wN25l' 
        target='_blank' 
        rel='noreferrer' 
        className='ig-float'
      >
        <FaInstagram />
      </a>
    </footer>
  );
};

// 🔴 CRITICAL: This line allows App.jsx to use this component
export default Footer;