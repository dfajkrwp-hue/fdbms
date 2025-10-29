import React, { useState, useMemo } from 'react';
import { AuthUser, UserRole } from '../types';
import { CloseIcon, PlusIcon, TrashIcon, RefreshIcon } from './Icons';

interface UserManagementProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: AuthUser;
    users: AuthUser[];
    setUsers: (value: AuthUser[] | ((val: AuthUser[]) => AuthUser[])) => void;
    onSignup: (username: string, password: string, role: UserRole) => { success: boolean, message: string };
    logAction: (action: string, details?: Record<string, any>) => void;
    adminResetPassword: (userId: string, newPassword: string) => { success: boolean, message: string };
}

const UserManagement: React.FC<UserManagementProps> = ({ isOpen, onClose, currentUser, users, setUsers, onSignup, logAction, adminResetPassword }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<UserRole>('User');
    const [error, setError] = useState('');
    
    if (!isOpen) return null;

    const { adminExists, managerExists } = useMemo(() => ({
        adminExists: users.some(u => u.role === 'Admin'),
        managerExists: users.some(u => u.role === 'Manager')
    }), [users]);


    const handleRoleChange = (userId: string, newRole: UserRole) => {
        if (newRole === 'Admin' && users.some(u => u.id !== userId && u.role === 'Admin')) {
            alert('An Admin already exists. Cannot assign this role.');
            // Revert the dropdown visually if the change is invalid
            const selectEl = document.getElementById(`role-select-${userId}`) as HTMLSelectElement;
            if(selectEl) selectEl.value = users.find(u => u.id === userId)?.role || 'User';
            return;
        }
        if (newRole === 'Manager' && users.some(u => u.id !== userId && u.role === 'Manager')) {
            alert('A Manager user already exists. Cannot assign this role.');
            const selectEl = document.getElementById(`role-select-${userId}`) as HTMLSelectElement;
            if(selectEl) selectEl.value = users.find(u => u.id === userId)?.role || 'User';
            return;
        }

        const changedUser = users.find(u => u.id === userId);
        setUsers(prevUsers => prevUsers.map(user => 
            user.id === userId ? { ...user, role: newRole } : user
        ));
        logAction('User Role Changed', { targetUserId: userId, targetUsername: changedUser?.username, newRole });
        alert(`Role for ${changedUser?.username} updated to ${newRole}.`);
    };

    const handleDeleteUser = (userId: string) => {
        if (userId === currentUser.id) {
            alert("You cannot delete yourself.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this user?")) {
            const deletedUser = users.find(u => u.id === userId);
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            logAction('User Deleted', { deletedUserId: userId, deletedUsername: deletedUser?.username });
            alert(`User ${deletedUser?.username} has been deleted.`);
        }
    };

    const handleAddNewUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newRole === 'Admin' && adminExists) {
            setError('An Admin user already exists. Please select a different role.');
            return;
        }
        if (newRole === 'Manager' && managerExists) {
            setError('A Manager user already exists. Please select a different role.');
            return;
        }
        
        const result = onSignup(newUsername, newPassword, newRole);
        if (result.success) {
            logAction('User Created', { newUsername, newRole });
            alert(`User ${newUsername} created successfully.`);
            setNewUsername('');
            setNewPassword('');
            setNewRole('User');
            setIsAdding(false);
        } else {
            setError(result.message);
        }
    };

    const handleResetPassword = (userId: string, username: string) => {
        const newPassword = prompt(`Enter new password for user: ${username}`);
        if (newPassword) {
            const result = adminResetPassword(userId, newPassword);
            if (result.success) {
                logAction('Admin Password Reset', { targetUserId: userId, targetUsername: username });
                alert(result.message);
            } else {
                alert(`Error: ${result.message}`);
            }
        }
    }
    
    const sortedUsers = [...users].sort((a,b) => a.username.localeCompare(b.username));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-full max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">All Users ({users.length})</h3>
                        <button onClick={() => { setIsAdding(!isAdding); setError(''); }} className="flex items-center px-3 py-2 bg-[#00520A] text-white rounded-md shadow-sm hover:bg-[#469110] text-sm font-medium">
                            <PlusIcon /> {isAdding ? 'Cancel' : 'Add New User'}
                        </button>
                    </div>

                    {isAdding && (
                        <form onSubmit={handleAddNewUser} className="p-4 mb-4 border rounded-lg bg-gray-50 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Username</label>
                                    <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full mt-1 px-2 py-1.5 border rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Password</label>
                                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full mt-1 px-2 py-1.5 border rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Role</label>
                                    <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} className="w-full mt-1 px-2 py-1.5 border rounded bg-white">
                                        <option value="Admin" disabled={adminExists}>Admin {adminExists && '(Filled)'}</option>
                                        <option value="Manager" disabled={managerExists}>Manager {managerExists && '(Filled)'}</option>
                                        <option value="AG Office">AG Office</option>
                                        <option value="User">User</option>
                                        <option value="Viewer">Viewer</option>
                                    </select>
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="text-right">
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Create User</button>
                            </div>
                        </form>
                    )}

                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase">Username</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase">Role</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y">
                                {sortedUsers.map(user => {
                                    const isCurrentAdmin = users.some(u => u.role === 'Admin' && u.id !== user.id);
                                    const isCurrentManager = users.some(u => u.role === 'Manager' && u.id !== user.id);
                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium">{user.username} {user.id === currentUser.id && '(You)'}</td>
                                            <td className="px-4 py-2">
                                                <select
                                                    id={`role-select-${user.id}`}
                                                    value={user.role} 
                                                    onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                                                    disabled={user.role === 'Admin'}
                                                    className="p-1 border rounded-md bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                >
                                                    <option value="Admin" disabled={isCurrentAdmin}>Admin {isCurrentAdmin && '(Filled)'}</option>
                                                    <option value="Manager" disabled={isCurrentManager}>Manager {isCurrentManager && '(Filled)'}</option>
                                                    <option value="AG Office">AG Office</option>
                                                    <option value="User">User</option>
                                                    <option value="Viewer">Viewer</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-2 text-center space-x-2">
                                                {user.id !== currentUser.id && user.role !== 'Admin' && (
                                                    <>
                                                        <button onClick={() => handleResetPassword(user.id, user.username)} title="Reset Password" className="p-2 text-gray-400 hover:text-blue-600">
                                                            <RefreshIcon />
                                                        </button>
                                                        <button onClick={() => handleDeleteUser(user.id)} title="Delete User" className="p-2 text-gray-400 hover:text-[#660033]">
                                                            <TrashIcon />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;