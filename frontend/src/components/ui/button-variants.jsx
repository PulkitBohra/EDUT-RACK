// src/components/ui/button-variants.js
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/80 hover:scale-105",
        destructive: "bg-red-600 text-white hover:bg-red-500 hover:scale-105",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-100 hover:text-gray-900 hover:scale-105",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:scale-105",
        ghost: "hover:bg-gray-100 hover:text-gray-900 hover:scale-105",
        link: "text-blue-600 underline hover:text-blue-800 hover:scale-105",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-10 px-6 text-lg",
        icon: "h-9 w-9 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
