import React, { useState } from 'react';
import { Bell, Palette, ShieldCheck, HelpCircle, ChevronRight, UserCircle, LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../Store/useAuthStore';
import { useNavigate } from 'react-router-dom';

// A reusable toggle switch component for on/off settings
const ToggleSwitch = ({ enabled, setEnabled }) => {
    return (
        <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                ${enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'}`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    );
};

// A reusable row component for each setting item
const SettingRow = ({ icon, title, subtitle, onClick, children }) => {
    const Icon = icon;
    return (
        <div onClick={onClick} className={`flex items-center p-4 ${onClick ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700' : ''}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                <Icon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            </div>
            <div className="ml-4 flex-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{title}</p>
                {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
            </div>
            <div>{children}</div>
        </div>
    );
};


// --- Main Settings Page Component ---
const SettingPage = () => {
    const { authUser, logout } = useAuthStore();
    const navigate = useNavigate();

    // State for interactive settings
    const [notifications, setNotifications] = useState(true);
    const [previews, setPreviews] = useState(true);
    const [theme, setTheme] = useState('system'); // 'light', 'dark', 'system'

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center mb-8">
                    <button onClick={handleGoBack} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <ArrowLeft size={28} />
                    </button>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white ml-4">
                        Settings
                    </h1>
                </div>

                {/* Account Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden mb-6">
                    <SettingRow icon={UserCircle} title="Edit Profile" subtitle={authUser?.username} onClick={() => navigate(`/profile`)}>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                    </SettingRow>
                    <SettingRow icon={ShieldCheck} title="Change Password" onClick={() => alert('Navigate to change password page')}>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                    </SettingRow>
                </div>

                {/* Notifications Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden mb-6">
                    <SettingRow icon={Bell} title="Notifications">
                        <ToggleSwitch enabled={notifications} setEnabled={setNotifications} />
                    </SettingRow>
                    <SettingRow icon={Bell} title="Show Previews" subtitle="Display message text in notifications">
                        <ToggleSwitch enabled={previews} setEnabled={setPreviews} />
                    </SettingRow>
                </div>

                {/* Appearance Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden mb-6">
                    <SettingRow icon={Palette} title="Appearance" subtitle={`Theme is set to ${theme}`}>
                        <button onClick={() => navigate('/setting/theme')} className="font-semibold text-sm text-blue-600 dark:text-blue-400">Change</button>
                    </SettingRow>
                </div>

                {/* Help Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden mb-6">
                    <SettingRow icon={HelpCircle} title="Help Center" onClick={() => alert('Navigate to help center')}>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                    </SettingRow>
                    <SettingRow icon={HelpCircle} title="Terms and Privacy Policy" onClick={() => alert('Navigate to privacy policy')}>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                    </SettingRow>
                </div>

                {/* Logout Button */}
                <div className="mt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingPage;