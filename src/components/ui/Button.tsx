import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  children: React.ReactNode;
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-white text-black hover:bg-gray-200',
    outline: 'bg-transparent border border-white/10 hover:bg-white/5 text-white',
    ghost: 'bg-transparent hover:text-white text-gray-400',
  };

  return (
    <button 
      className={`px-6 py-2.5 rounded-full font-medium transition-all flex items-center justify-center gap-2 group ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};