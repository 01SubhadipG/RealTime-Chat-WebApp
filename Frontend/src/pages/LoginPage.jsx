import React, { useState } from 'react';
// 1. Import the useNavigate hook
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../Store/useAuthStore';
import assets from '../assets/assets';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const { login, isLoggingIn } = useAuthStore();
  // 2. Initialize the navigate function
  const navigate = useNavigate();

  const validateForm = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return toast.error("Please enter a valid email");
    }
    if (!formData.password) {
      return toast.error("Please enter your password");
    }
    return true;
  };

  // 3. Make the handleSubmit function asynchronous
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();

    if (success === true) {
      // 4. Await the result of the login function
      const loginSuccessful = await login(formData);

      // 5. If login was successful, navigate to the home page
      if (loginSuccessful) {
        navigate('/');
      }
      // Note: If login fails, an error toast is likely already handled within your useAuthStore's login function.
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row items-center justify-evenly p-4 bg-cover bg-center" style={{ backgroundImage: `url("/background.png")` }}>
      
      {/* Logo Section */}
      <div className="mb-8 md:mb-0 text-center">
        <img src={assets.logo_icon} alt="logo" className="w-48 md:w-64 lg:w-80 mx-auto" />
        <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">WeChat</h1>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Login</h2>
          
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email" 
            className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          
          <div className="relative w-full">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              placeholder="Password" 
              className="w-full px-4 py-3 pr-10 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <div 
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} className="text-gray-500" /> : <Eye size={20} className="text-gray-500" />}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-300 disabled:bg-blue-400"
          >
            {isLoggingIn ? "Logging In..." : "Login"}
          </button> 
          
          <div className="text-center text-sm text-gray-600">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-blue-600 hover:underline cursor-pointer">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;