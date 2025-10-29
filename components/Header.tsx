import React, { useState, useRef, useEffect } from 'react';
import { AuthUser } from '../types';
import { LOGO_URL } from '../constants';
import { BookOpenIcon, ClipboardDocumentListIcon, BellIcon, KeyIcon, UserCircleIcon, ChevronDownIcon } from './Icons';

// Fix: Added 'grindingBills' to AppView to match the type in App.tsx.
type AppView = 'dashboard' | 'newBill' | 'allBills' | 'reports' | 'budget' | 'orders' | 'notifications' | 'grindingBills' | 'agOffice';

interface HeaderProps {
    currentUser: AuthUser;
    onLogout: () => void;
    setCurrentView: (view: AppView) => void;
    currentView: AppView;
    onChangePassword: () => void;
    onOpenSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, setCurrentView, currentView, onChangePassword, onOpenSidebar }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinkClass = "px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2";
    const activeNavLinkClass = "bg-[var(--color-primary)] text-white";
    const inactiveNavLinkClass = "text-[var(--color-text-light)] hover:bg-black/5 hover:text-[var(--color-text-main)]";

    return (
        <header className="no-print bg-white/80 backdrop-blur-lg border-b border-[var(--color-border)] sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-4">
                <button
                    onClick={onOpenSidebar}
                    className="p-2 rounded-md text-[var(--color-text-light)] hover:bg-black/10 md:hidden"
                    aria-label="Open sidebar"
                >
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Logo for mobile view */}
                <button 
                    onClick={() => setCurrentView('dashboard')} 
                    className="flex items-center gap-2 md:hidden"
                >
                    <img src={LOGO_URL} alt="AJK Logo" className="w-8 h-8"/>
                    <span className="font-bold text-lg text-[var(--color-text-main)]">FDBMS</span>
                </button>

                <div className="hidden md:flex items-center gap-2">
                    <button onClick={() => setCurrentView('budget')} className={`${navLinkClass} ${currentView === 'budget' ? activeNavLinkClass : inactiveNavLinkClass}`}><BookOpenIcon /> Budget</button>
                    <button onClick={() => setCurrentView('orders')} className={`${navLinkClass} ${currentView === 'orders' ? activeNavLinkClass : inactiveNavLinkClass}`}><ClipboardDocumentListIcon /> Orders</button>
                    <button onClick={() => setCurrentView('notifications')} className={`${navLinkClass} ${currentView === 'notifications' ? activeNavLinkClass : inactiveNavLinkClass}`}><BellIcon /> Notifications</button>
                </div>
            </div>
            
            <div ref={dropdownRef} className="relative">
                <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5">
                    <UserCircleIcon className="h-8 w-8 text-gray-600" />
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-bold text-[var(--color-text-main)]">{currentUser.username}</p>
                        <p className="text-xs text-[var(--color-text-light)]">{currentUser.role}</p>
                    </div>
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 hidden md:block" />
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-30 border border-[var(--color-border)]">
                        <button onClick={() => { onChangePassword(); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"><KeyIcon className="h-5 w-5"/> Change Password</button>
                        <button onClick={() => { onLogout(); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;