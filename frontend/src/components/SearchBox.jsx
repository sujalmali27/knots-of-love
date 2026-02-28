import React from 'react';
import { Form, Button } from 'react-bootstrap';

// ✅ Receive 'keyword' and 'setKeyword' as props from HomeScreen
const SearchBox = ({ keyword, setKeyword, onSearch }) => {
  
  const submitHandler = (e) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  return (
    <Form onSubmit={submitHandler} className='d-flex mb-3'>
      <Form.Control
        type='text'
        value={keyword} // ✅ This makes it controlled
        placeholder='Search crochet items...'
        className='mr-sm-2 ml-sm-5'
        onChange={(e) => setKeyword(e.target.value)} // ✅ Updates parent state directly
      ></Form.Control>
      <Button 
        type='submit' 
        variant='outline-success' 
        className='p-2 mx-2' 
        style={{borderColor: '#ff69b4', color: '#ff69b4'}}
      >
        Search
      </Button>
    </Form>
  );
};

export default SearchBox;