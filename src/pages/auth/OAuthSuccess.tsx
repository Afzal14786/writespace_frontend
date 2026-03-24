import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // The type error is gone now because we added it to AuthContextType
  const { checkAuth } = useAuth(); 

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('accessToken', token);
      
      checkAuth().then(() => {
        navigate('/home', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Authenticating...</h2>
      </div>
    </div>
  );
};