import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile' // Add this component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/profile" element={<Profile />} /> 
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;