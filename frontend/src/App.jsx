import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile' // Add this component
import ProtectedRoute from './components/ProtectedRoute';
import Trade from './pages/user/Trade';
import Home from './pages/Home';
import StockAnalysis from './pages/dataScience/StockAnalysisPage';
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path='/' element={<Home />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/profile" element={<Profile />} /> 
             <Route path="/trade" element={<Trade />} />
             {/* <Route path="/Stock" element={<StockAnalysis />} />
              <Route path="/prediction" element={<StockPrediction />} /> */}
              <Route path="/Stock" element={<StockAnalysis />} />      
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;