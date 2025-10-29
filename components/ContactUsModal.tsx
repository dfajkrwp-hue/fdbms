import React from 'react';
import { CloseIcon, BuildingOfficeIcon, MailIcon, WebsiteIcon } from './Icons';

interface ContactUsModalProps {
    onClose: () => void;
}

const ContactUsModal: React.FC<ContactUsModalProps> = ({ onClose }) => {
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
                           <BuildingOfficeIcon className="h-10 w-10 text-[var(--color-primary)]" />
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                           Contact Us
                        </h2>
                        <p className="mt-2 text-md font-medium text-[var(--color-primary)]">
                           Food Department GoAJ&amp;K
                        </p>
                    </div>

                    <div className="mt-8 space-y-4 text-gray-700">
                        <div className="flex items-start">
                            <span className="mt-1 font-semibold w-20">Address:</span>
                            <span className="flex-1">D151, Satellite Town Rawalpindi</span>
                        </div>
                         <div className="flex items-start">
                            <span className="font-semibold w-20">Phone:</span>
                            <span className="flex-1">051-9330725</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-semibold w-20">Website:</span>
                            <a href="http://www.foodajk.gov.pk" target="_blank" rel="noopener noreferrer" className="flex-1 text-[var(--color-primary)] hover:underline">
                                www.foodajk.gov.pk
                            </a>
                        </div>
                         <div className="flex items-start">
                            <span className="font-semibold w-20">Email:</span>
                            <a href="mailto:dfajkrwp@gmail.com" className="flex-1 text-[var(--color-primary)] hover:underline">
                                dfajkrwp@gmail.com
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

export default ContactUsModal;