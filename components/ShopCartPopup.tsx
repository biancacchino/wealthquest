import React, { useState } from "react";
import * as ShopReflections from "../data/shopData";
import * as Icons from "./PixelIcons";
import { useRetroAudio } from "../hooks/useRetroAudio";

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  iconName?: string;
  category?: 'need' | 'want' | 'social';
}

interface ShopCartPopupProps {
  title: string;
  items: ShopItem[];
  userBalance: number;
  bankBalance?: number;
  onPurchase: (items: ShopItem[]) => void;
  onCancel: () => void;
  shopType: ShopReflections.ShopType; // e.g. "COFFEE", "MALL"
}

export const ShopCartPopup: React.FC<ShopCartPopupProps> = ({
  title,
  items,
  userBalance,
  bankBalance = 0,
  onPurchase,
  onCancel,
  shopType
}) => {
  const [cart, setCart] = useState<ShopItem[]>([]);
  const [showReflection, setShowReflection] = useState(false);
  const { playBlip, playSelect, playStorePurchase, playError } = useRetroAudio();

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const canAfford = userBalance >= cartTotal;

  const handleAddToCart = (item: ShopItem) => {
    playSelect();
    setCart((prev) => [...prev, item]);
  };

  const handleRemoveFromCart = (index: number) => {
      playBlip();
      setCart(prev => prev.filter((_, i) => i !== index));
  }

  const handleCheckout = () => {
    if (cart.length > 0 && canAfford) {
      playSelect();
      setShowReflection(true);
    } else {
        playError();
    }
  };

  const handleConfirmPurchase = () => {
    playStorePurchase();
    onPurchase(cart); // Callback with full cart
  };

  const reflectionData = ShopReflections.SHOP_REFLECTIONS[shopType];

  if (showReflection) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-[#5a98b8] border-4 border-[#3a7a98] rounded-lg p-6 max-w-lg w-full font-[family-name:var(--font-press-start-2p)] text-white relative shadow-xl">
             <h2 className="text-xl mb-4 text-center leading-relaxed" style={{ textShadow: "2px 2px 0px #000" }}>{reflectionData.title}</h2>
             
             <div className="space-y-4 text-xs md:text-sm leading-relaxed mb-6 bg-black/20 p-4 rounded">
                 {reflectionData.lines.map((line, i) => (
                     <p key={i}>{line}</p>
                 ))}
             </div>

             <div className="flex justify-center gap-4">
                 <button 
                    onClick={handleConfirmPurchase}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 border-b-4 border-green-800 rounded active:border-b-0 active:translate-y-1 transition-all"
                 >
                     CONTINUE
                 </button>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-20 bg-black/80 flex items-center justify-center p-4 pointer-events-auto">
      <div className="w-full max-w-4xl h-[80vh] flex flex-col md:flex-row gap-4" style={{ fontFamily: '"Press Start 2P", monospace' }}>
        
        {/* SHOP AREA */}
        <div className="flex-1 bg-[#5a98b8] border-4 border-[#3a7a98] rounded-lg p-4 overflow-hidden flex flex-col shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
            <h2 className="text-xl text-white mb-4 text-center" style={{ textShadow: "2px 2px #000" }}>{title}</h2>
            
            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-3 custom-scrollbar">
                {items.map((item) => {
                    const IconComponent = (item.iconName && (Icons as any)[item.iconName]) 
                        ? (Icons as any)[item.iconName] 
                        : Icons.PixelIconWrapper; // Fallback?

                    return (
                        <div key={item.id} className="bg-white/10 p-3 rounded flex flex-col items-center gap-2 hover:bg-white/20 transition-colors border-2 border-transparent hover:border-white/50">
                            <div className="text-4xl text-white mb-1">
                                {IconComponent !== Icons.PixelIconWrapper ? <IconComponent className="w-12 h-12" /> : item.iconName || "?"}
                            </div>
                            <div className="text-white text-xs text-center h-8 flex items-center justify-center">{item.name}</div>
                            <div className="text-yellow-300 font-bold">${item.price.toFixed(2)}</div>
                            <button 
                                onClick={() => handleAddToCart(item)}
                                className="mt-auto w-full py-2 bg-blue-600 hover:bg-blue-500 text-[10px] text-white rounded border-b-2 border-blue-800 active:border-b-0 active:translate-y-[2px]"
                            >
                                ADD
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* CART AREA */}
        <div className="w-full md:w-80 bg-[#FFF8DC] border-4 border-[#8B4513] rounded-lg p-4 flex flex-col shadow-[8px_8px_0_rgba(0,0,0,0.5)] text-[#5C4033]">
            <h3 className="text-lg mb-4 text-center border-b-2 border-[#8B4513] pb-2">CART</h3>
            
            {cart.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs opacity-50 text-center">
                    Your cart is empty.
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
                    {cart.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex justify-between items-center bg-[#DEB887]/20 p-2 mb-1 rounded">
                            <span className="text-xs truncate flex-1">{item.name}</span>
                            <span className="text-xs font-bold mr-2">${item.price.toFixed(2)}</span>
                            <button 
                                onClick={() => handleRemoveFromCart(idx)}
                                className="text-red-500 hover:text-red-700 font-bold px-1"
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-auto border-t-2 border-[#8B4513] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Wallet:</span>
                    <span>${userBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                    <span>Total:</span>
                    <span className={canAfford ? 'text-green-700' : 'text-red-600'}>
                        ${cartTotal.toFixed(2)}
                    </span>
                </div>
                
                {!canAfford && (
                    <div className="text-[10px] text-red-600 text-center">
                        Insufficent funds!
                    </div>
                )}

                <button 
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || !canAfford}
                    className={`w-full py-3 mt-2 rounded border-b-4 text-white text-xs uppercase
                        ${cart.length > 0 && canAfford 
                            ? 'bg-green-600 hover:bg-green-500 border-green-800 active:border-b-0 active:translate-y-1' 
                            : 'bg-gray-400 border-gray-600 cursor-not-allowed'}
                    `}
                >
                    Checkout
                </button>

                <button 
                    onClick={onCancel}
                    className="w-full py-2 bg-red-500 hover:bg-red-400 text-white text-[10px] rounded border-b-4 border-red-700 active:border-b-0 active:translate-y-1 block md:hidden"
                >
                    EXIT SHOP
                </button>
            </div>
        </div>

        {/* Floating Close Button for Desktop */}
        <button 
            onClick={onCancel}
            className="absolute top-6 right-6 bg-red-500 text-white w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-lg z-30 hidden md:flex hover:bg-red-400"
        >
            X
        </button>

      </div>
    </div>
  );
};
