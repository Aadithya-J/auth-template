import React from 'react'; // Ensure React is imported
import { ClassValue } from 'clsx';
import { cn } from './lib/utils';

// Define a TypeScript interface for your props
interface AvatarProps {
  className?: ClassValue;
  imageUrl: string;
  size?: string | number; // size can be a string (like '4rem', '100px') or a number (interpreted as pixels)
}

export default function Avatar({
  className,
  imageUrl,
  size = '4rem', // default size set to 4rem (64px)
}: AvatarProps) {
  // Calculate dynamic styles based on the `size` prop
  const dynamicStyle = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
  };

  return (
    <div
      className={cn(
        'rounded-full border-1 border-black dark:border-black',
        className,
      )}
      style={dynamicStyle} // Apply dynamic styling here
    >
      <img
        src={imageUrl}
        alt="Avatar"
        className="w-full h-full rounded-full object-cover border-2 border-black dark:border-black"
        style={dynamicStyle} // Apply dynamic styling here
      />
    </div>
  );
}
