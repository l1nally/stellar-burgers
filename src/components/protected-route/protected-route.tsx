import { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  selectIsAuthenticated,
  selectAuthRequest
} from '../../slices/stellarBurgerSlice';
import { useAppSelector } from '../../services/store';
import { Preloader } from '../ui/preloader';
import { ProtectedRouteProps } from './type';

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  onlyUnAuth = false
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authRequest = useAppSelector(selectAuthRequest);
  const location = useLocation();

  if (authRequest && (!onlyUnAuth || (onlyUnAuth && isAuthenticated))) {
    return <Preloader />;
  }

  if (onlyUnAuth && isAuthenticated) {
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }

  if (!onlyUnAuth && !isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
};
