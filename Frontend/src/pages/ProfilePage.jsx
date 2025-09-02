import React, { useState, useRef } from 'react';
import { useAuthStore } from '../Store/useAuthStore';
import { Edit3, Save, Camera, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        username: authUser?.username || '',
        bio: authUser?.bio || '',
        profilePic: authUser?.profilePic || '/avatar-placeholder.png',
    });
    const fileInputRef = useRef(null);

    const handleGoBack = () => navigate(-1);

    const handleCancelEdit = () => {
        setFormData({
            username: authUser?.username || '',
            bio: authUser?.bio || '',
            profilePic: authUser?.profilePic || '/avatar-placeholder.png',
        });
        setIsEditMode(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData({ ...formData, profilePic: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarClick = () => {
        if (isEditMode) fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.username.length < 3) {
            return toast.error("Username must be at least 3 characters long.");
        }
        const payload = {
            username: formData.username,
            bio: formData.bio,
            ...(formData.profilePic.startsWith('data:') && { profilePic: formData.profilePic }),
        };
        const success = await updateProfile(payload);
        if (success) setIsEditMode(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                {/* Header Layout */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    {/* Back Button */}
                    <button onClick={handleGoBack} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    {/* Title */}
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {isEditMode ? 'Edit Profile' : 'My Profile'}
                    </h1>
                    {/* Action Buttons */}
                    <div className="w-24 text-right">
                        {!isEditMode ? (
                            <button onClick={() => setIsEditMode(true)} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                Edit
                            </button>
                        ) : (
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={handleCancelEdit} className="font-semibold text-slate-600 dark:text-slate-300 hover:underline">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="profile-form"
                                    disabled={isUpdatingProfile}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:bg-blue-400"
                                >
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <form id="profile-form" onSubmit={handleSubmit} className="p-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative">
                            <img src={formData.profilePic} alt="Profile Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-600" />
                            {isEditMode && (
                                <div onClick={handleAvatarClick} className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer">
                                    <Camera size={32} className="text-white" />
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg" />
                    </div>

                    {/* User Info Section */}
                    <div className="space-y-6 text-slate-800 dark:text-slate-200">
                        {/* Email (not editable) */}
                        <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-4">
                            <p className="text-lg font-semibold">{authUser?.username}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{authUser?.email}</p>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                disabled={!isEditMode}
                                className="w-full mt-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-transparent disabled:border-none disabled:p-0 disabled:mt-0"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            {/* CORRECTED LINE */}
                            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                disabled={!isEditMode}
                                placeholder={isEditMode ? "Tell us about yourself..." : "No bio yet."}
                                className="w-full mt-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-transparent disabled:border-none disabled:p-0 disabled:mt-0"
                                rows={3}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;