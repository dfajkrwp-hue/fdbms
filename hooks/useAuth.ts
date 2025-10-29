import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { AuthUser, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

type AuthResult = {
    success: boolean;
    message: string;
    user?: AuthUser;
}

export function useAuth() {
    const [users, setUsers] = useLocalStorage<AuthUser[]>('auth_users', []);
    const [currentUser, setCurrentUser] = useLocalStorage<AuthUser | null>('auth_currentUser', null);
    
    // On initial load, create a default admin if no users exist.
    useEffect(() => {
        if (users.length === 0) {
            const adminUser: AuthUser = {
                id: uuidv4(),
                username: 'admin',
                password: 'admin',
                role: 'Admin',
            };
            setUsers([adminUser]);
        }
    }, []);


    const signup = (username: string, password: string, role: UserRole): AuthResult => {
        if (!username || !password) {
            return { success: false, message: 'Username and password cannot be empty.' };
        }
        
        const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (existingUser) {
            return { success: false, message: 'Username already exists.' };
        }

        const newUser: AuthUser = {
            id: uuidv4(),
            username,
            password, // This should be hashedPassword
            role: role,
        };

        setUsers([...users, newUser]);
        
        return { success: true, message: 'Signup successful!' };
    };

    const login = (username: string, password: string): AuthResult => {
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (user && user.password === password) {
            const userToStore = { ...user };
            delete userToStore.password;
            setCurrentUser(userToStore);
            return { success: true, message: 'Login successful!', user: userToStore };
        }

        return { success: false, message: 'Invalid username or password.' };
    };

    const logout = () => {
        setCurrentUser(null);
    };
    
    const changePassword = (userId: string, oldPassword: string, newPassword: string): AuthResult => {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'User not found.' };
        }
        
        const user = users[userIndex];
        if (user.password !== oldPassword) {
            return { success: false, message: 'Incorrect current password.' };
        }
        
        if (!newPassword) {
             return { success: false, message: 'New password cannot be empty.' };
        }

        const updatedUsers = [...users];
        updatedUsers[userIndex] = { ...user, password: newPassword };
        setUsers(updatedUsers);

        return { success: true, message: 'Password changed successfully.' };
    };

    const adminResetPassword = (userId: string, newPassword: string): AuthResult => {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'User not found.' };
        }

        if (!newPassword) {
             return { success: false, message: 'New password cannot be empty.' };
        }
        
        const updatedUsers = [...users];
        updatedUsers[userIndex] = { ...users[userIndex], password: newPassword };
        setUsers(updatedUsers);

        return { success: true, message: `Password for ${users[userIndex].username} has been reset.` };
    };

    return { currentUser, users, setUsers, login, signup, logout, changePassword, adminResetPassword };
}