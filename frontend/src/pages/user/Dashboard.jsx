import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import Stock from './Stock';
import Navbar from '../Navbar';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const { user, loading } = useAuth(); // Use the custom hook
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
      navigate('/login'); // Redirect to login after logout
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
 

  if (loading) {
    return <div>Loading...</div>; // Show a loading state
  }

  return (
    <>
    <Navbar/>
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}!</h1>
      <p className="text-lg mb-4">Email: {user.email}</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
      
      <Stock/>
    </div>
    </>
  );
};

export default Dashboard;