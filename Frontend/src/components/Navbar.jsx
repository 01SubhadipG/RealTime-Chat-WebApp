import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../Store/useAuthStore';
import assets from '../assets/assets';
import { Phone, Video, User, Settings, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { authUser, logout } = useAuthStore();
    const navigate = useNavigate();
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            setIsDropdownOpen(false);
            navigate('/login');
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-white dark:bg-slate-800 shadow-md p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-2">
                    <img src={assets.logo_icon} alt="logo" className="w-9 h-9 rounded-full" />
                    <span className="text-xl font-bold text-gray-800 dark:text-slate-200 hidden sm:block">WeChat</span>
                </Link>
            </div>

            {/* Center Section */}
            

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {authUser ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            {isDropdownOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg border border-slate-200 dark:border-slate-600 z-20">
                                <ul className="p-2 text-sm text-slate-700 dark:text-slate-300">
                                    <li>
                                        {/* This link opens the ProfilePage */}
                                        <Link to={`/profile`} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600">
                                            <User size={16} />
                                            <span>Profile</span>
                                        </Link>
                                    </li>
                                    <li>
                                        {/* This link opens the SettingPage */}
                                        <Link to="/setting" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600">
                                            <Settings size={16} />
                                            <span>Settings</span>
                                        </Link>
                                    </li>
                                    <li className="border-t border-slate-200 dark:border-slate-600 my-1"></li>
                                    <li>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 text-red-500 dark:text-red-400">
                                            <LogOut size={16} />
                                            <span>Logout</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    // Unauthenticated user view
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Login</Link>
                        <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;