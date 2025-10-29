import React, { useState } from 'react';
import { LOGO_URL } from '../constants';
import { UserRole } from '../types';

interface AuthProps {
    onLogin: (username: string, password: string) => { success: boolean, message: string };
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const result = onLogin(username, password);
        if (!result.success) {
            setError(result.message);
        }
    };

    const backgroundImageUrl = "https://i.dawn.com/large/2023/12/10095146b5a2a53.jpg";

    return (
        <div 
            className="flex items-center justify-center min-h-screen p-4 relative bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <main className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto gap-10">
                
                <div className="w-full lg:w-1/2 p-8 animate-fade-in hidden lg:block">
                    <h1 
                        className="text-5xl font-bold leading-tight text-white"
                    >
                        Food Department Billing Management
                    </h1>
                    <p 
                        className="mt-6 text-lg text-gray-200 max-w-lg"
                        style={{ lineHeight: 1.6 }}
                    >
                        Efficiently manage and track all your transportation billing needs with our comprehensive system designed for the Food Department.
                    </p>
                </div>

                <div className="w-full max-w-md lg:w-1/2 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <div className="card p-8">
                        <button onClick={() => window.location.reload()} className="block mx-auto mb-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] rounded-full">
                            <img src={LOGO_URL} alt="FDBMS Logo" className="w-20 h-20" />
                        </button>
                        
                        <div className="text-center mb-6">
                            <h2 
                                className="text-3xl font-bold text-[var(--color-text-main)]"
                            >
                                Welcome to <span style={{color: 'var(--color-primary)'}}>F</span>DBMS
                            </h2>
                            <p className="mt-2 text-[var(--color-text-light)]">
                                Sign in to access your account
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-light)] mb-1.5">Username</label>
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    required 
                                    className="w-full py-3 px-4"
                                    placeholder="Enter your username"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-light)] mb-1.5">Password</label>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="w-full py-3 px-4"
                                    placeholder="Enter your password"
                                />
                            </div>

                            {error && <p className="text-sm text-center text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</p>}
                            
                            <button 
                                type="submit" 
                                className="w-full py-3 mt-4 text-white bg-[var(--color-primary)] rounded-xl font-bold text-lg hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Login
                            </button>
                        </form>
                        
                        <p className="text-center mt-6 text-sm text-[var(--color-text-light)]">
                            Don't have an account? Please contact the system administrator to get access.
                        </p>

                         <p className="text-center mt-8 text-xs text-gray-500">
                            © {new Date().getFullYear()} Food Department AJK. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Auth;