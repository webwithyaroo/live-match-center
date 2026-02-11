import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
};

const maxWidthClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-full",
};

/**
 * Container Component
 * 
 * Max-width container with responsive padding
 */
export default function Container({ children, maxWidth = "xl", className = "" }: ContainerProps) {
  const maxWidthClass = maxWidthClasses[maxWidth];
  
  return (
    <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
