import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form } from 'react-bootstrap';
import { FaTrash, FaStar } from 'react-icons/fa'; 
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { addToCart } from '../slices/cartSlice';
import { 
  useGetProductDetailsQuery, 
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetRelatedProductsQuery // ✅ Added hook for recommendations
} from '../slices/productApiSlice';
import Rating from '../components/Rating'; 
import Loader from '../components/Loader';
import Message from '../components/Message';
import Product from '../components/Product'; // ✅ Import Product component for the grid

const ProductScreen = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0); 
  const [comment, setComment] = useState('');

  const { userInfo } = useSelector((state) => state.auth);

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);
  const [createReview, { isLoading: loadingReview }] = useCreateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  // ✅ Fetch related products based on the current product ID
  const { data: relatedProducts, isLoading: loadingRelated } = useGetRelatedProductsQuery(productId);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch(); 
      toast.success('Review submitted successfully');
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const deleteHandler = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview({ productId, reviewId }).unwrap();
        refetch();
        toast.success('Review deleted');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div style={{ paddingBottom: '50px' }}>
      <Link className='btn btn-light my-3 border' to='/'>← Back to Shop</Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <Row className="g-4">
            <Col lg={5} md={6}>
              <Card className="border-0 shadow-sm p-2" style={{ borderRadius: '20px' }}>
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fluid 
                  style={{ borderRadius: '15px', maxHeight: '500px', objectFit: 'contain', width: '100%' }} 
                />
              </Card>
            </Col>

            <Col lg={7} md={6}>
              <div className="ps-lg-4">
                <h2 className="mb-2" style={{ fontWeight: '700' }}>{product.name}</h2>
                <div className="mb-3">
                  <Rating value={product.rating} text={`${product.numReviews} reviews`} />
                </div>
                
                <h3 className="mb-4" style={{ fontWeight: '700', fontSize: '1.8rem' }}>₹{product.price}</h3>

                <div className="mb-4">
                  <h6 className="text-uppercase text-muted small fw-bold">Description</h6>
                  <p style={{ fontSize: '1.1rem', color: '#555' }}>{product.description}</p>
                </div>

                <Card className="shadow-sm border-0" style={{ borderRadius: '15px', maxWidth: '450px' }}>
                  <ListGroup variant='flush'>
                    <ListGroup.Item className="py-3">
                      <Row>
                        <Col>Price:</Col>
                        <Col className="text-end"><strong>₹{product.price}</strong></Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item className="py-3">
                      <Row>
                        <Col>Status:</Col>
                        <Col className="text-end" style={{ color: product.countInStock > 0 ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                          {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                        </Col>
                      </Row>
                    </ListGroup.Item>

                    {product.countInStock > 0 && (
                      <ListGroup.Item className="py-3">
                        <Row className="align-items-center">
                          <Col>Quantity:</Col>
                          <Col className="text-end">
                            <Form.Control 
                              as='select' 
                              value={qty} 
                              onChange={(e) => setQty(Number(e.target.value))}
                              style={{ width: '80px', marginLeft: 'auto' }}
                            >
                              {[...Array(product.countInStock).keys()].map((x) => (
                                <option key={x + 1} value={x + 1}>{x + 1}</option>
                              ))}
                            </Form.Control>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    )}

                    <ListGroup.Item className="p-3">
                      <Button 
                        className='w-100 py-3 fw-bold' 
                        disabled={product.countInStock === 0}
                        onClick={addToCartHandler}
                        style={{ backgroundColor: '#ff85a2', border: 'none', borderRadius: '10px' }}
                      >
                        Add To Cart
                      </Button>
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </div>
            </Col>
          </Row>

          {/* ✅ RECOMMENDATION SECTION */}
          <div className='mt-5 pt-5'>
            <h3 className="fw-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              You Might Also Love 🧶
            </h3>
            {loadingRelated ? (
              <Loader />
            ) : relatedProducts?.length > 0 ? (
              <Row>
                {relatedProducts.map((related) => (
                  <Col key={related._id} sm={12} md={6} lg={4} xl={3}>
                    <Product product={related} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Message variant='info'>Looking for more? Check out our other collections!</Message>
            )}
          </div>

          <Row className='mt-5 pt-4 border-top'>
            <Col md={6}>
              <h4 className="mb-4 fw-bold">Customer Reviews</h4>
              {product.reviews.length === 0 && <Message>No reviews yet</Message>}
              <ListGroup variant='flush'>
                {product.reviews.map((review) => (
                  <ListGroup.Item key={review._id} className="bg-transparent px-0 py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>{review.name}</strong>
                      {(userInfo?._id === review.user || userInfo?.isAdmin) && (
                        <Button 
                          variant='link' 
                          className='text-danger p-0' 
                          onClick={() => deleteHandler(review._id)}
                        >
                          <FaTrash size={14} />
                        </Button>
                      )}
                    </div>
                    <Rating value={review.rating} />
                    <p className="text-muted small">{review.createdAt.substring(0, 10)}</p>
                    <p>{review.comment}</p>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>

            <Col md={6}>
              <Card className="p-4 border-0 shadow-sm" style={{ borderRadius: '20px', backgroundColor: '#fff' }}>
                <h4 className="mb-3 fw-bold">Write a Review</h4>
                {loadingReview && <Loader />}
                {userInfo ? (
                  <Form onSubmit={submitHandler}>
                    <Form.Group className='mb-3'>
                      <Form.Label className="d-block">Rating</Form.Label>
                      <div className="d-flex">
                        {[...Array(5)].map((star, index) => {
                          const ratingValue = index + 1;
                          return (
                            <label key={index}>
                              <input 
                                type="radio" 
                                name="rating" 
                                style={{ display: 'none' }} 
                                value={ratingValue} 
                                onClick={() => setRating(ratingValue)} 
                              />
                              <FaStar 
                                size={28} 
                                style={{ cursor: 'pointer', marginRight: '5px' }} 
                                color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(0)}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </Form.Group>
                    <Form.Group className='mb-3'>
                      <Form.Label>Comment</Form.Label>
                      <Form.Control
                        as='textarea'
                        rows='4'
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did you think of your order?"
                        style={{ borderRadius: '10px' }}
                      ></Form.Control>
                    </Form.Group>
                    <Button
                      disabled={loadingReview}
                      type='submit'
                      className="w-100 fw-bold"
                      style={{ backgroundColor: '#ff85a2', border: 'none', padding: '12px' }}
                    >
                      Post Review
                    </Button>
                  </Form>
                ) : (
                  <Message>Please <Link to='/login'>sign in</Link> to write a review</Message>
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default ProductScreen;