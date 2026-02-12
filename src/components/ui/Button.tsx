import React from "react";
import { Slot } from "@radix-ui/react-slot";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  children: React.ReactNode;
  asChild?: boolean; // Add this prop
}

export const Button = ({
  children,
  variant = "primary",
  className = "",
  asChild = false, // Default to false
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200",
    outline:
      "bg-transparent border border-white/10 hover:bg-white/5 text-white",
    ghost: "bg-transparent hover:text-white text-gray-400",
  };

  // If asChild is true, we render the 'Slot', otherwise we render 'button'
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={`px-6 py-2.5 rounded-full font-medium transition-all flex items-center justify-center gap-2 group ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
