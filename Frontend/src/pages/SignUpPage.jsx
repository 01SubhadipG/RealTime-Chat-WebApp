import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 1. Import the Link component
import { useAuthStore } from '../Store/useAuthStore';
import assets from '../assets/assets';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.username) {
      return toast.error("Please enter a username");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return toast.error("Please enter a valid email");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();

    if (success === true) signup(formData);
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
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Sign Up</h2>
          
          <input 
            type="text" 
            name="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Username" 
            className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />

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

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="terms" 
              className="h-4 w-4 bg-white border border-gray-400 rounded accent-blue-600" 
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-600">I agree to the terms and conditions</label>
          </div>
          
          <button 
            type="submit" 
            disabled={isSigningUp}
            // 2. Removed the redundant onClick handler from the button
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-300 disabled:bg-blue-400"
          >
            {isSigningUp ? "Signing Up..." : "Sign Up"}
          </button> 
          
          <div className="text-center text-sm text-gray-600">
            <p>
              Already have an account?{' '}
              {/* 3. Replaced <a> tag with <Link> for client-side navigation */}
              <Link to="/login" className="font-semibold text-blue-600 hover:underline cursor-pointer">
                Click Here..
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUpPage;