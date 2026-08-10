import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDefaultRoute, hasPermission } from '../utils/permissions.js';

export default function PermissionRoute({ permissions, children }) {
  const user = useSelector((state) => state.auth.user);

  if (!hasPermission(user, permissions)) {
    return <Navigate to={getDefaultRoute(user)} replace />;
  }

  return children;
}
