import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // If userInfo exists (logged in), show the child components (Outlet)
  // Otherwise, redirect to the login page
  return userInfo ? <Outlet /> : <Navigate to='/login' replace />;
};

export default PrivateRoute;