import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { handleError, handleSuccess } from "../util";
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import PasswordChecklist from "react-password-checklist";  // Importing PasswordChecklist

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: ''
    });

    const navigate = useNavigate();
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);  // New state to track password validity

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copySignupInfo = { ...signupInfo };
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password } = signupInfo;

        if (!name || !email || !password) {
            return handleError('Name, email, password are required');
        }
        if (password !== confirmPassword) {
            return handleError('The passwords don\'t match. Try again!');
        }
        try {
            const url = `http://localhost:3000/api/auth/signup`;
            const response = await axios.post(url, signupInfo, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const { success, message, error } = response.data;

            if (success) {
                handleSuccess(message);
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else if (error) {
                const details = error?.details[0]?.message || message;
                handleError(details);
            } else {
                handleError(message);
            }
        } catch (err) {
            if (err.response && err.response.data) {
                const errorMessage = err.response.data.error?.details[0]?.message || 'An unexpected error occurred';
                handleError(errorMessage);
            } else {
                handleError(err.message || 'An unexpected error occurred');
            }
        }
    };

    return (
        <div className="flex w-full h-screen">
            <div className="w-full flex items-center justify-center lg:w-1/2">
                <div className="bg-white px-5 py-5 rounded-3xl border-2 border-gray-200 mt-4">
                    <h1 className="text-3xl font-semibold flex justify-center">Welcome!</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mt-8">
                            <div className='mt-3'>
                                <label htmlFor="name" className="text-base font-medium">Name</label>
                                <input
                                    className="w-full border-2 border-gray-100 rounded-xl p-2 mt-1 bg-transparent"
                                    type="text"
                                    name="name"
                                    placeholder="Enter your name"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='mt-3'>
                                <label htmlFor="email" className="text-base font-medium">Email</label>
                                <input
                                    className="w-full border-2 border-gray-100 rounded-xl p-2 mt-1 bg-transparent"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='mt-3'>
                                <label htmlFor="password" className='text-base font-medium'>Password</label>
                                <input
                                    className="w-full border-2 border-gray-100 rounded-xl p-2 mt-1 bg-transparent"
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='mt-3'>
                                <label htmlFor="confirm-password" className='text-base font-medium'>Confirm Password</label>
                                <input
                                    className="w-full border-2 border-gray-100 rounded-xl p-2 mt-1 mb-2 bg-transparent"
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Re-enter password"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            {/* Password Validation Checklist */}
                            <PasswordChecklist
                                rules={["minLength", "specialChar", "number", "capital", "match"]}
                                minLength={6}
                                value={signupInfo.password}
                                valueAgain={confirmPassword}
                                onChange={(isValid) => setIsPasswordValid(isValid)}
                                className="text-sm" // Adjust the font size of the text in the checklist
                                style={{ fontSize: "0.875rem" }} // Optional, to further control the font size
                                />


                            <div className="mt-5 flex flex-col gap-y-4">
                                <button
                                    className="active:scale-[.98] transition-all hover:scale-[1.01] py-2 rounded-xl bg-violet-600 text-white text-lg font-bold"
                                    type="submit"
                                    disabled={!isPasswordValid}  // Disable submit button if password is invalid
                                >
                                    Sign up
                                </button>
                                <p className="flex justify-center align-center text-gray-700">
                                    Already have an account? <Link to="/login" className="text-violet-600 hover:scale-[1.02]">Login</Link>
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="hidden relative lg:flex h-full w-1/2 items-center justify-center bg-gray-200">
                <div className='w-60 h-60 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full animate-bounce'></div>
                <div className="w-full h-1/2 absolute bottom-0 bg-white/10 backdrop-blur-lg"></div>
            </div>

            <ToastContainer />
        </div>
    );
}

export default Signup;
