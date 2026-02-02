import { forwardRef, type ImgHTMLAttributes, type CSSProperties } from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  name?: string;
  showBorder?: boolean;
  borderColor?: string;
  src?: string | null;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
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

    const pixelSizes = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
    };

    const initials = name ? getInitials(name) : "?";

    const borderStyle: CSSProperties | undefined = borderColor
      ? { ["--tw-ring-color" as string]: borderColor }
      : undefined;

    if (!src) {
      return (
        <div
          ref={ref}
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-primary-light text-primary font-medium",
            sizes[size],
            showBorder && "ring-2 ring-offset-2 ring-primary",
            className
          )}
          style={borderStyle}
        >
          {initials}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-block rounded-full overflow-hidden",
          sizes[size],
          showBorder && "ring-2 ring-offset-2 ring-primary",
          className
        )}
        style={borderStyle}
      >
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          className="w-full h-full object-cover"
          {...(props as Record<string, unknown>)}
        />
      </div>
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
