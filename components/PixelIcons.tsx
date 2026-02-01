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

export const CloseIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z" />
  </PixelIconWrapper>
);
export const PortfolioIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M3 3H21V21H3V3ZM5 5V19H19V5H5ZM7 11H9V17H7V11ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z" />
  </PixelIconWrapper>
);
export const SavingsIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-2.75v-1.1h-2v.8c-1.1.25-2 .97-2 2.3 0 2.22 2.66 2.5 3.5 2.8.84.3 1.5.54 1.5 1.25 0 .61-.6 1.15-1.5 1.15s-1.5-.64-1.5-1.2h-2c0 1.54 1.24 2.59 2.5 2.75v1h2v-1c1.17-.22 2.5-1.02 2.5-2.55 0-2.22-2.75-2.45-3.5-2.75-.75-.3-1.5-.6-1.5-1.25 0-.61.64-1.15 1.5-1.15s1.46.64 1.54 1.2h2c0-1.29-.98-2.34-2.54-2.5z" /> 
    <path d="M11,6h2v3h-2V6z M11,15h2v3h-2V15z M7,11h3v2H7V11z M14,11h3v2h-3V11z" />
  </PixelIconWrapper>
);

export const HistoryIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
     <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </PixelIconWrapper>
);

export const DepositIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </PixelIconWrapper>
);

export const WithdrawIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M9 11h4v6h4v-6h4l-7-7-7 7zM5 18v2h14v-2H5z" />
  </PixelIconWrapper>
);

export const BreadIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M6 8C6 6.5 7.5 5 10 5H14C16.5 5 18 6.5 18 8V16C18 17.5 16.5 19 14 19H10C7.5 19 6 17.5 6 16V8ZM8 8V16H16V8H8Z" />
    </PixelIconWrapper>
);

export const MilkIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M7 4H17L19 7H5L7 4ZM5 8H19V20H5V8ZM9 12H15V14H9V12Z" />
    </PixelIconWrapper>
);

export const FruitIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M12 2C13 2 14 3 14 4C14 5 13 6 12 7C11 6 10 5 10 4C10 3 11 2 12 2ZM6 8C6 7 7 6 9 6H15C17 6 18 7 18 8V10C18 13.31 15.31 16 12 16C8.69 16 6 13.31 6 10V8Z" />
    </PixelIconWrapper>
);

export const EggIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M12 2C8 2 5 6 5 11C5 16 8 20 12 20C16 20 19 16 19 11C19 6 16 2 12 2ZM12 4C15 4 17 7 17 11C17 15 15 18 12 18C9 18 7 15 7 11C7 7 9 4 12 4Z" />
    </PixelIconWrapper>
);

export const MedicineIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M10 2H14V22H10V2ZM2 10H22V14H2V10Z" />
    </PixelIconWrapper>
);

export const WalletIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M4 4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H4ZM4 6H20V18H4V6ZM8 11H16V13H8V11Z" />
    </PixelIconWrapper>
);

export const EtfIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M4 18V6H6V18H4ZM8 18V10H10V18H8ZM12 18V8H14V18H12ZM16 18V12H18V18H16ZM2 20H22V22H2V20Z" />
    </PixelIconWrapper>
);

export const StockIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M3 3V21H21V19H5V3H3ZM7 15L11 11L15 15L19 7H15V9H16.2L15 11.4L11 7.4L7 11.4V15Z" />
    </PixelIconWrapper>
);

export const BondIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3ZM5 5V19H19V5H5ZM7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15ZM16 15H17V17H16V15Z" />
    </PixelIconWrapper>
);

export const MineralsIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M12 2L4 8L7 20H17L20 8L12 2ZM12 5L17 9H7L12 5ZM7.5 10H16.5L14.5 18H9.5L7.5 10Z" />
    </PixelIconWrapper>
);

export const CryptoIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM11 6H13V8H14C15.1 8 16 8.9 16 10V14C16 15.1 15.1 16 14 16H13V18H11V16H10V13H12V14H14V10H12V11H10V9C10 7.9 10.9 7 12 7V6Z" />
    </PixelIconWrapper>
);

export const RealEstateIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M12 3L2 12H5V20H11V14H13V20H19V12H22L12 3ZM11 10C11 9.45 11.45 9 12 9C12.55 9 13 9.45 13 10V12H11V10Z" />
    </PixelIconWrapper>
);

export const OptionsIcon = ({ className }: { className?: string }) => (
    <PixelIconWrapper className={className}>
        <path d="M4 12V20H20V12H4ZM2 8H22V10H2V8ZM10 2L12 4L14 2H10Z" />
        <path d="M11 6H13V7H11V6Z" />
    </PixelIconWrapper>
);

export const BookIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M6 4h10v16H6V4zm2 2v12h6V6H8z" />
  </PixelIconWrapper>
);

export const ShirtIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M12 2l-4 4h2v14h4V6h2L12 2zm-6 6v2h2v-2H6zm10 0v2h2v-2h-2z" />
  </PixelIconWrapper>
);

export const ShoeIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M4 14v6h16v-4l-4-4h-4l-4 4v-2H4z" />
  </PixelIconWrapper>
);

export const GameIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M2 8v8h20V8H2zm4 4H4v-2h2v2zm12 0h-2v-2h2v2z" />
  </PixelIconWrapper>
);

export const TicketIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M4 8h16v8H4V8zm2 2v4h2v-4H6zm4 0v4h2v-4h-2zm4 0v4h2v-4h-2z" />
  </PixelIconWrapper>
);

export const FoodIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M12 6a6 6 0 00-6 6v6h12v-6a6 6 0 00-6-6zm0 2a4 4 0 014 4H8a4 4 0 014-4z" />
  </PixelIconWrapper>
);

export const DrinkIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M6 4v16h12V4H6zm2 2h8v12H8V6z" />
  </PixelIconWrapper>
);

export const SweetIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M12 4a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12 6 6 0 010-12z" />
  </PixelIconWrapper>
);

export const GiftIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M12 2L8 6h3v14h2V6h3L12 2zm-4 6H4v12h4V8zm8 0h4v12h-4V8z" />
  </PixelIconWrapper>
);

export const BottleIcon = ({ className }: { className?: string }) => (
  <PixelIconWrapper className={className}>
    <path d="M10 2h4v4h-4V2zm-2 4h8v16H8V6zm2 2v12h4V8h-4z" />
  </PixelIconWrapper>
);
