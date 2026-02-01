import { forwardRef, type ImgHTMLAttributes } from "react";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  name?: string;
  showBorder?: boolean;
  borderColor?: string;
}

const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      size = "md",
      name,
      showBorder = false,
      borderColor,
      ...props
    },
    ref
  ) => {
    const sizes = {
      xs: "h-6 w-6 text-xs",
      sm: "h-8 w-8 text-sm",
      md: "h-10 w-10 text-base",
      lg: "h-12 w-12 text-lg",
      xl: "h-16 w-16 text-xl",
    };

    const initials = name ? getInitials(name) : "?";

    if (!src) {
      return (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-primary-light text-primary font-medium",
            sizes[size],
            showBorder && "ring-2 ring-offset-2",
            className
          )}
          style={borderColor ? { ringColor: borderColor } : undefined}
        >
          {initials}
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt || name || "Avatar"}
        className={cn(
          "inline-block rounded-full object-cover",
          sizes[size],
          showBorder && "ring-2 ring-offset-2",
          className
        )}
        style={borderColor ? { ringColor: borderColor } : undefined}
        {...props}
      />
    );
  }
);

Avatar.displayName = "Avatar";

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarProps["size"];
}

function AvatarGroup({ children, max = 4, size = "md" }: AvatarGroupProps) {
  const avatars = Array.isArray(children) ? children : [children];
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleAvatars}
      {remainingCount > 0 && (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-surface text-text-secondary font-medium border-2 border-white",
            size === "xs" && "h-6 w-6 text-xs",
            size === "sm" && "h-8 w-8 text-xs",
            size === "md" && "h-10 w-10 text-sm",
            size === "lg" && "h-12 w-12 text-base",
            size === "xl" && "h-16 w-16 text-lg"
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup };
