import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/check-auth', {
          withCredentials: true, // Include cookies in the request
        });
        if (response.data.success) {
          setUser(response.data.user); // Set user data
        }
      } catch (err) {
        navigate('/login'); // Redirect to login if not authenticated
      } finally {
        setLoading(false); // Set loading to false after the request is complete
      }
    };

    fetchUser();
  }, [navigate]);

  return { user, loading }; // Return user data and loading state
};

export default useAuth;