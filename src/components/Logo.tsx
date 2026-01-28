export default function Logo({ className = "w-40" }: { className?: string }) {
    /* 
       Renders the logo image directly. 
       Using h-auto w-auto or specific dimensions in className will now work correctly 
       without being constrained by a parent div wrapper.
    */
    return (
        <img
            src="/logo-new.png"
            alt="ApicBooks Logo"
            className={`${className} object-cover`}
        />
    );
}

export function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <img
            src="/icon.jpg"
            alt="ApicBooks Icon"
            className={`${className} object-cover rounded-xl`}
        />
    );
}

export function FlameIcon({ className = "w-6 h-6", animated = true }: { className?: string; animated?: boolean }) {
    return (
        <svg viewBox="0 0 24 24" className={`${className} ${animated ? 'animate-bounce-gentle' : ''}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
            </defs>
            <path
                d="M12 2C12 2 8 6 8 10C8 12.5 9.5 14 12 14C14.5 14 16 12.5 16 10C16 6 12 2 12 2ZM12 20C8.5 20 6 17.5 6 14C6 10 12 4 12 4C12 4 18 10 18 14C18 17.5 15.5 20 12 20Z"
                fill="url(#flameGradient)"
            />
            <path
                d="M12 16C10.5 16 9.5 15 9.5 13.5C9.5 12 12 10 12 10C12 10 14.5 12 14.5 13.5C14.5 15 13.5 16 12 16Z"
                fill="#fbbf24"
            />
        </svg>
    );
}
