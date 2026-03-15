import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost" | "link" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantClasses = {
  default:     "bg-emerald-700 text-white hover:bg-emerald-800 shadow-none",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline:     "border border-emerald-700 bg-transparent text-emerald-700 hover:bg-emerald-50",
  ghost:       "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  link:        "text-emerald-700 underline-offset-4 hover:underline bg-transparent",
  secondary:   "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

const sizeClasses = {
  default: "h-9 px-4 py-2 text-sm",
  sm:      "h-8 px-3 text-xs",
  lg:      "h-11 px-6 text-sm font-semibold",
  icon:    "h-9 w-9",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
