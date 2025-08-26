import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMagnetic } from "@/lib/magnetic";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  magnetic?: boolean;
  cursorType?: 'default' | 'magnet' | 'view';
  magneticOptions?: {
    strength?: number;
    radius?: number;
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    magnetic = false,
    cursorType = 'default',
    magneticOptions = {},
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Use magnetic effect if enabled
    const magneticEffect = useMagnetic(magneticOptions);
    const finalRef = magnetic ? magneticEffect.ref : ref;

    // Determine cursor type based on variant and magnetic state
    const getCursorType = () => {
      if (cursorType !== 'default') return cursorType;
      if (magnetic) return 'magnet';
      if (variant === 'link' || variant === 'ghost') return 'view';
      return 'default';
    };

    const buttonContent = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={finalRef}
        data-cursor={getCursorType()}
        style={magnetic ? {
          x: magneticEffect.x,
          y: magneticEffect.y,
          transform: 'translate3d(0, 0, 0)'
        } : undefined}
        {...props}
      />
    );

    // Wrap with motion.div if magnetic for smooth animations
    if (magnetic) {
      return (
        <motion.div
          style={{
            x: magneticEffect.x,
            y: magneticEffect.y
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {buttonContent}
        </motion.div>
      );
    }

    return buttonContent;
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

