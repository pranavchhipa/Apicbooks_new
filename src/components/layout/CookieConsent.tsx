'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={`
            fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6
            transform transition-transform duration-500
            ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}>
            <div className="max-w-4xl mx-auto glass rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-shrink-0 p-2 rounded-xl bg-accent-500/20">
                        <Cookie className="w-6 h-6 text-accent-400" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">We value your privacy</h3>
                        <p className="text-slate-400 text-sm">
                            We use cookies to enhance your browsing experience.
                            By continuing to use our site, you agree to our{' '}
                            <a href="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors">
                                Privacy Policy
                            </a>.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleDecline}
                            className="flex-1 sm:flex-initial btn-ghost text-sm px-4 py-2"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex-1 sm:flex-initial btn-primary text-sm px-4 py-2"
                        >
                            Accept All
                        </button>
                    </div>

                    <button
                        onClick={handleDecline}
                        className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto p-2 text-slate-400 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
