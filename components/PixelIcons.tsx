import React from "react";

export const PixelIconWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-8 h-8 ${className}`}
    fill="currentColor"
    style={{ imageRendering: "pixelated" }}
    shapeRendering="crispEdges"
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

export const BusIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M4 6V17H6V19H8V17H16V19H18V17H20V6H4ZM6 8H18V13H6V8ZM6 14H8V16H6V14ZM16 14H18V16H16V14Z" />
  </PixelIconWrapper>
);

export const MovieIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M4 4H20V20H4V4ZM6 6V8H8V6H6ZM10 6V8H12V6H10ZM14 6V8H16V6H14ZM18 6V8H20V6H18ZM6 10V18H18V10H6Z" />
  </PixelIconWrapper>
);

export const PizzaIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M12 2L4 20H20L12 2ZM11 6H13V8H11V6ZM9 12H11V14H9V12ZM13 12H15V14H13V12ZM10 16H14V18H10V16Z" />
  </PixelIconWrapper>
);

export const HomeIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M12 3L4 10V21H9V14H15V21H20V10L12 3ZM11 16H13V21H11V16Z" />
  </PixelIconWrapper>
);

export const CoffeeIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M4 4V16H18V14H20V6H18V4H4ZM6 6H16V14H6V6ZM18 6H20V12H18V6Z" />
  </PixelIconWrapper>
);

export const BankIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M4 4V8H20V4H4ZM6 10V18H9V10H6ZM11 10V18H14V10H11ZM16 10V18H19V10H16ZM4 20V22H20V20H4Z" />
  </PixelIconWrapper>
);

export const ArcadeIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M12 2C8 2 6 5 6 8V14H18V8C18 5 16 2 12 2ZM11 4H13V8H11V4ZM8 14V20H10V22H14V20H16V14H8ZM12 16C11.5 16 11 16.5 11 17C11 17.5 11.5 18 12 18C12.5 18 13 17.5 13 17C13 16.5 12.5 16 12 16Z" />
  </PixelIconWrapper>
);

export const MallIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M8 4V8H6V20H18V8H16V4H8ZM10 6H14V8H10V6ZM8 10H16V18H8V10Z" />
  </PixelIconWrapper>
);
