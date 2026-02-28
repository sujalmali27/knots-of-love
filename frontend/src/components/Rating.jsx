import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useState } from 'react';

const Rating = ({ value, text, color = '#ff85a2', readOnly = true, setRating }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className='rating d-inline-flex align-items-center'>
      {[1, 2, 3, 4, 5].map((index) => {
        const ratingValue = readOnly ? value : (hover || value);
        
        return (
          <span 
            key={index}
            style={{ 
              cursor: readOnly ? 'default' : 'pointer',
              transition: 'all 0.2s ease-in-out',
              display: 'inline-block',
              // 🌟 BIG STARS: Large for the form, standard for the product info
              fontSize: readOnly ? '1.2rem' : '2.8rem', 
              margin: readOnly ? '0 1px' : '0 6px',
              // Subtle "pop" effect when hovering on interactive stars
              transform: (!readOnly && (hover || value) >= index) ? 'scale(1.15)' : 'scale(1)'
            }}
            onMouseEnter={() => !readOnly && setHover(index)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && setRating(index)}
          >
            {ratingValue >= index ? (
              <FaStar style={{ color }} />
            ) : ratingValue >= index - 0.5 && readOnly ? (
              <FaStarHalfAlt style={{ color }} />
            ) : (
              // Grey color for empty stars in the form to make it clear they are unselected
              <FaRegStar style={{ color: readOnly ? color : '#e0e0e0' }} />
            )}
          </span>
        );
      })}
      {text && <span className='rating-text ms-2 small text-muted' style={{ fontSize: '0.9rem' }}>{text}</span>}
    </div>
  );
};

export default Rating;