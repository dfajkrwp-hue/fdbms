import React, { useState } from 'react';
import { AuthUser } from '../types';
import { CloseIcon, KeyIcon } from './Icons';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: AuthUser;
    onChangePassword: (userId: string, oldPass: string, newPass: string) => { success: boolean, message: string };
    logAction: (action: string, details?: Record<string, any>) => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, currentUser, onChangePassword, logAction }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        const result = onChangePassword(currentUser.id, currentPassword, newPassword);

        if (result.success) {
            setSuccess(result.message);
            logAction('Password Changed');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(onClose, 2000);
        } else {
            setError(result.message);
        }
    };
    
    const handleClose = () => {
        // Reset state on close
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        onClose();
    }
    
    const inputClass = "w-full px-3 py-2 mt-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center"><KeyIcon className="mr-2 h-5 w-5"/> Change Your Password</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputClass} />
                    </div>

                    {error && <p className="text-sm text-center text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}
                    {success && <p className="text-sm text-center text-green-600 bg-green-50 p-2 rounded-md">{success}</p>}

                    <div className="pt-2">
                        <button type="submit" className="w-full px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-md shadow-sm hover:bg-[var(--color-primary-hover)]">
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;