import React from 'react';
import { WhatsappIcon, FacebookIcon, WebsiteIcon, MailIcon } from './Icons';

const Footer: React.FC = () => {
    return (
        <footer className="no-print bg-white text-slate-300 border-t border-[var(--color-border)]">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-[var(--color-text-light)] text-center sm:text-left">
                    &copy; {new Date().getFullYear()} Food Department AJK. All Rights Reserved.
                </p>
                <div className="flex space-x-6 items-center">
                    <a href="https://wa.me/92519330725" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors duration-200" title="WhatsApp">
                        <span className="sr-only">WhatsApp</span>
                        <WhatsappIcon className="h-6 w-6" />
                    </a>
                    <a href="https://www.facebook.com/dfajkofficial" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors duration-200" title="Facebook">
                        <span className="sr-only">Facebook</span>
                        <FacebookIcon className="h-6 w-6" />
                    </a>
                    <a href="http://www.foodajk.gov.pk" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors duration-200" title="Website">
                        <span className="sr-only">Website</span>
                        <WebsiteIcon className="h-6 w-6" />
                    </a>
                    <a href="mailto:dfajkrwp@gmail.com" className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors duration-200" title="Email">
                        <span className="sr-only">Email</span>
                        <MailIcon className="h-6 w-6" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;