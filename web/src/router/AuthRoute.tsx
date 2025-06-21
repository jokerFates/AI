import { Navigate, useLocation } from 'react-router-dom';

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  // 已登录状态访问登录页则跳转首页
  if (location.pathname === '/login' && token) {
    return <Navigate to="/layout" replace />;
  }

  // 未登录状态访问受保护页面则跳转登录页
  if (!token && location.pathname !== '/login') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default AuthRoute;
