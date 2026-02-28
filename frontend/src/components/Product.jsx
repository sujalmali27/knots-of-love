import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Product = ({ product }) => {
  return (
    <Card className='my-3 p-3'>
      {/* Link around the image with the new framed boutique look */}
      <Link to={`/product/${product._id}`}>
        <Card.Img 
          src={product.image} 
          variant='top' 
          className='card-img-top' 
        />
      </Link>

      <Card.Body>
        {/* Product Category - subtle and professional */}
        <div className='text-muted small mb-1' style={{ letterSpacing: '1px' }}>
          {product.category.toUpperCase()}
        </div>

        <Link to={`/product/${product._id}`} className='text-decoration-none'>
          <Card.Title as='div' className='product-title mb-2'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        {/* Updated Pricing with the new Rose color theme */}
        <Card.Text as='h3' style={{ color: 'var(--primary-pink)', fontWeight: '600' }}>
          ₹{product.price}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Product;