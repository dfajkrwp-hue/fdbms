import React from 'react';
import { CloseIcon, WhatsappIcon, FacebookIcon, WebsiteIcon, UserCircleIcon, MailIcon } from './Icons';

interface AboutDeveloperModalProps {
    onClose: () => void;
}

const AboutDeveloperModal: React.FC<AboutDeveloperModalProps> = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden transform transition-all duration-300 ease-out scale-95 hover:scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-hover)]">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-8">
                    <div className="text-center">
                        <div className="inline-block p-4 bg-[var(--color-primary-light)] rounded-full mb-4">
                           <UserCircleIcon className="h-10 w-10 text-[var(--color-primary)]" />
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                           Naseer Safder Mughal
                        </h2>
                        <p className="mt-2 text-md font-medium text-[var(--color-primary)]">
                           Full-Stack Developer & UI/UX Enthusiast
                        </p>
                        
                        <p className="mt-4 text-gray-500 max-w-xs mx-auto">
                            Passionate about creating elegant, efficient, and user-friendly applications. This FDBMS system was built to streamline billing processes with a focus on reliability and a clean user experience.
                        </p>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">Connect with me</h3>
                        <div className="mt-4 flex justify-center items-center space-x-6">
                            <a href="mailto:nsm.ajk@gmail.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[var(--color-primary)] transition-colors" title="Email">
                                <MailIcon className="w-8 h-8" />
                            </a>
                             <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[var(--color-primary)] transition-colors" title="WhatsApp">
                                <WhatsappIcon className="w-8 h-8" />
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[var(--color-primary)] transition-colors" title="Facebook">
                                <FacebookIcon className="w-8 h-8" />
                            </a>
                            <a href="http://www.nsm.ajk.gov.pk" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[var(--color-primary)] transition-colors" title="Website/Portfolio">
                                <WebsiteIcon className="w-8 h-8" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} FDBMS. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default AboutDeveloperModal;