// import { Link } from 'react-router-dom'

// function Login() {
//   return (
//     <div className="flex w-full h-screen">
//         <div className ="w-full flex items-center justify-center lg:w-1/2">
//             <div className="bg-white px-10 py-10 rounded-3xl border-2 border-gray-200">
//                 <h1 className = 'text-5xl font-semibold'>Welcome Back</h1>
//                 <p className='font-medium text-lg text-gray-500 mt-4'>Welcome back! Please enter your details.</p>
//                 <div className="mt-8">
//                     <div>
//                         <label htmlFor="email" className="text-lg font-medium">Email</label>
//                         <input className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
//                                type="email" 
//                                id="email" 
//                                placeholder="Enter your email" 
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="password">Password</label>
//                         <input className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparen"
//                                type="password" 
//                                id="password" 
//                                placeholder="Enter your password" 
//                         />
//                     </div>
//                     {/* <div className="mt-8 flex justify-between items-center">
//                         <div>
//                             <input type="checkbox" id="remember" />
//                             <label className='ml-2 font-medium text-base'htmlFor="remember">Remember me</label>
//                         </div>
//                         <button className='font-medium text-base text-violet'>forgotPassword</button>
//                     </div> */}
//                     <div className="mt-8 flex flex-col gap-y-4">
//                         <button className="active:scale-[.98] sctive:duration-75 transition-all hover:scale-[1.01] ease-in-out py-3 rounded-xl bg-violet-600 text-white text-lg font-bold">Sign in</button>
//                         <p className="flex justify-center align-center text-gray-700">Dont have an account? <Link to="/signup" className="text-violet-600">Signup</Link></p>
//                         {/* <button>Sign in with Google</button> */}
//                     </div>

//                 </div>
//             </div>
//         </div>
//         <div className="hidden relative lg:flex h-full w-1/2 items-center justify-center bg-gray-200 ">
//             <div className='w-60 h-60 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full animate-bounce'></div>
//             <div className="w-full h-1/2 absolute bottom-0 bg-white/10 backdrop-blur-lg"></div>
//         </div>
//     </div>
//   )
// }
// export default Login

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
      }, {
        withCredentials: true, // Ensure cookies are sent with the request
      });

      if (response.data.success) {
        navigate('/dashboard'); // Redirect to a protected route after login
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex w-full h-screen">
      <div className="w-full flex items-center justify-center lg:w-1/2">
        <div className="bg-white px-10 py-10 rounded-3xl border-2 border-gray-200">
          <h1 className="text-5xl font-semibold">Welcome Back</h1>
          <p className="font-medium text-lg text-gray-500 mt-4">
            Welcome back! Please enter your details.
          </p>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          <div className="mt-8">
            <form onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="text-lg font-medium">
                  Email
                </label>
                <input
                  className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className='text-lg font-medium'>Password</label>
                <input
                  className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent"
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mt-8 flex flex-col gap-y-4">
                <button
                  type="submit"
                  className="active:scale-[.98] active:duration-75 transition-all hover:scale-[1.01] ease-in-out py-3 rounded-xl bg-violet-600 text-white text-lg font-bold"
                >
                  Sign in
                </button>
                <p className="flex justify-center align-center text-gray-700">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-violet-600">
                    Signup
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="hidden relative lg:flex h-full w-1/2 items-center justify-center bg-gray-200">
        <div className="w-60 h-60 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full animate-bounce"></div>
        <div className="w-full h-1/2 absolute bottom-0 bg-white/10 backdrop-blur-lg"></div>
      </div>
    </div>
  );
}

export default Login;