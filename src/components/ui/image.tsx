"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hover?: boolean;
  lazy?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  fill = false,
  sizes,
  style,
  onClick,
  hover = true,
  lazy = true,
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  if (hasError) {
    return (
      <div 
        className={cn(
          "bg-gray-100 flex items-center justify-center text-gray-400",
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">Resim yüklenemedi</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={style}
      variants={imageVariants}
      initial="hidden"
      animate={inView || !lazy ? "visible" : "hidden"}
      whileHover={hover ? "hover" : undefined}
      onClick={onClick}
    >
      {!isLoaded && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </motion.div>
  );
}

// Hero Image Component
export function HeroImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={cn("object-cover", className)}
      priority
      quality={90}
      placeholder="empty"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

// Card Image Component
export function CardImage({ 
  src, 
  alt, 
  className,
  onClick 
}: { 
  src: string; 
  alt: string; 
  className?: string;
  onClick?: () => void;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={300}
      className={cn("rounded-lg object-cover cursor-pointer", className)}
      quality={80}
      placeholder="empty"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      onClick={onClick}
      hover
    />
  );
}

// Avatar Image Component
export function AvatarImage({ 
  src, 
  alt, 
  size = 40,
  className 
}: { 
  src: string; 
  alt: string; 
  size?: number;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      quality={90}
      placeholder="empty"
      sizes={`${size}px`}
    />
  );
}
