"use client";

import React, { useMemo, useState } from "react";
import { RetroBox } from "./RetroBox";
import {
  TrendingUp,
  ShoppingCart,
  PiggyBank,
  Brain,
  Sprout,
  Coins,
  Building2,
  Puzzle,
  Factory,
  Hammer,
  ArrowUp,
  ArrowDown,
  Clock,
  TreeDeciduous,
  ShoppingBasket,
  Egg,
  Users,
  GraduationCap,
  Sandwich,
  Gamepad2,
  ClipboardList,
  Search,
  DollarSign,
  Timer,
  PieChart,
  Receipt,
  Gift,
  Smile,
  Check,
  Target,
  ArrowRight,
  Landmark,
  Lock,
  Umbrella,
  PartyPopper,
  Archive,
  LayoutGrid,
  Calendar,
  Carrot,
  Milk,
  Ticket,
  Heart,
  UserRound,
  CheckSquare,
  BookOpen
} from "lucide-react";

interface LibraryPopupProps {
  onClose: () => void;
}

interface BookPage {
  title: string;
  visual: React.ReactNode;
  body: string;
}

interface BookData {
  id: string;
  title: string;
  subtitle: string;
  coverIcon: React.ReactNode;
  pages: BookPage[];
}

const LIBRARY_BOOKS: BookData[] = [
  {
    id: "investing",
    title: "What is Investing",
    subtitle: "Grow your money over time",
    coverIcon: <TrendingUp size={48} />,
    pages: [
      {
        title: "What is investing?",
        visual: <div className="flex gap-2"><Sprout size={32} /><Coins size={32} /></div>,
        body: "Investing means putting some money into something so it can grow over time.",
      },
      {
        title: "Stocks are tiny pieces",
        visual: <div className="flex gap-2"><Building2 size={32} /><Puzzle size={32} /></div>,
        body: "A stock is a tiny piece of a company. If the company grows, your piece can grow too.",
      },
      {
        title: "Companies use money",
        visual: <div className="flex gap-2"><Factory size={32} /><Hammer size={32} /></div>,
        body: "Companies use money to make or sell things. When they do well, owners can earn more.",
      },
      {
        title: "Prices go up and down",
        visual: <div className="flex gap-2"><ArrowUp size={32} /><ArrowDown size={32} /></div>,
        body: "Stock prices can move up or down. That’s normal and it can happen many times.",
      },
      {
        title: "Think long-term",
        visual: <div className="flex gap-2"><Clock size={32} /><TreeDeciduous size={32} /></div>,
        body: "Investing is like planting a seed. It grows slowly, so patience helps.",
      },
      {
        title: "Don’t put all eggs",
        visual: <div className="flex gap-2"><ShoppingBasket size={32} /><Egg size={32} /></div>,
        body: "Putting a little in different companies can be safer than all in one place.",
      },
      {
        title: "Start small",
        visual: <Coins size={32} />,
        body: "You can start with a small amount and add more later when you’re ready.",
      },
      {
        title: "Learn with a grown-up",
        visual: <div className="flex gap-2"><Users size={32} /><BookOpen size={32} /></div>,
        body: "Ask a grown-up to learn with you and make smart choices together.",
      },
    ],
  },
  {
    id: "spending",
    title: "How to Spend Money",
    subtitle: "Make smart choices",
    coverIcon: <ShoppingCart size={48} />,
    pages: [
      {
        title: "Needs vs wants",
        visual: <div className="flex gap-2"><Sandwich size={32} /><Gamepad2 size={32} /></div>,
        body: "Needs are things you must have, like food. Wants are fun extras.",
      },
      {
        title: "Plan before buying",
        visual: <div className="flex gap-2"><ClipboardList size={32} /><ShoppingCart size={32} /></div>,
        body: "Make a simple plan so you don’t run out of money too fast.",
      },
      {
        title: "Compare prices",
        visual: <div className="flex gap-2"><Search size={32} /><DollarSign size={32} /></div>,
        body: "Looking at prices helps you find the best deal.",
      },
      {
        title: "Wait a little",
        visual: <Timer size={32} />,
        body: "If you’re not sure, wait a day. You might decide you don’t need it.",
      },
      {
        title: "Use a budget",
        visual: <PieChart size={32} />,
        body: "A budget is a plan for your money. It helps you choose wisely.",
      },
      {
        title: "Keep track",
        visual: <Receipt size={32} />,
        body: "Write down what you spend so you know where your money goes.",
      },
      {
        title: "Share and be kind",
        visual: <Gift size={32} />,
        body: "Spending a little on gifts or sharing can make others happy too.",
      },
      {
        title: "Feel good choices",
        visual: <div className="flex gap-2"><Smile size={32} /><Check size={32} /></div>,
        body: "Smart spending helps you feel proud and ready for tomorrow.",
      },
    ],
  },
  {
    id: "saving",
    title: "How to Save Money",
    subtitle: "Keep money for later",
    coverIcon: <PiggyBank size={48} />,
    pages: [
      {
        title: "Saving is keeping",
        visual: <div className="flex gap-2"><PiggyBank size={32} /><Coins size={32} /></div>,
        body: "Saving means keeping some money for later instead of spending it now.",
      },
      {
        title: "Set a goal",
        visual: <Target size={32} />,
        body: "Choose something you want. A goal makes saving exciting.",
      },
      {
        title: "Pay yourself first",
        visual: <div className="flex gap-2"><Coins size={32} /><ArrowRight size={32} /><PiggyBank size={32} /></div>,
        body: "Put a little into savings before you spend the rest.",
      },
      {
        title: "Banks keep money safe",
        visual: <div className="flex gap-2"><Landmark size={32} /><Lock size={32} /></div>,
        body: "A bank is like a safe place to store money so it doesn’t get lost.",
      },
      {
        title: "Emergency money",
        visual: <Umbrella size={32} />,
        body: "Saving helps you be ready for surprises, like a rainy day.",
      },
      {
        title: "Watch it grow",
        visual: <TrendingUp size={32} />,
        body: "Check your savings sometimes. Watching it grow feels great.",
      },
      {
        title: "Small adds up",
        visual: <div className="flex gap-2"><Coins size={32} /><Coins size={32} /></div>,
        body: "Even tiny amounts grow over time when you keep saving.",
      },
      {
        title: "Celebrate progress",
        visual: <PartyPopper size={32} />,
        body: "Every step counts. Celebrate when you reach your goal.",
      },
    ],
  },
  {
    id: "managing",
    title: "How to Manage Money",
    subtitle: "Balance, plan, and grow",
    coverIcon: <Brain size={48} />,
    pages: [
      {
        title: "Money buckets",
        visual: <div className="flex gap-2"><Archive size={32} /><Archive size={32} /></div>,
        body: "Managing money means deciding where it should go.",
      },
      {
        title: "Four jars idea",
        visual: <div className="flex gap-2 items-center"><span>Spend</span><ShoppingCart size={24} /> <span>Save</span><PiggyBank size={24} /></div>,
        body: "You can split money into jars: spend, save, share, and invest.",
      },
      {
        title: "Check your balance",
        visual: <div className="flex gap-2"><Search size={32} /><DollarSign size={32} /></div>,
        body: "Look at how much money you have so you can plan well.",
      },
      {
        title: "Make a plan",
        visual: <Calendar size={32} />,
        body: "A simple plan helps you feel ready for today and tomorrow.",
      },
      {
        title: "Needs first",
        visual: <div className="flex gap-2"><Carrot size={32} /><Milk size={32} /></div>,
        body: "Spend on needs before wants. That keeps you safe.",
      },
      {
        title: "Fun money too",
        visual: <div className="flex gap-2"><Ticket size={32} /><Gamepad2 size={32} /></div>,
        body: "It’s okay to enjoy some fun spending when you plan for it.",
      },
      {
        title: "Share a little",
        visual: <Heart size={32} />,
        body: "Sharing helps other people and feels good inside.",
      },
      {
        title: "Invest for later",
        visual: <div className="flex gap-2"><Sprout size={32} /><TrendingUp size={32} /></div>,
        body: "Investing can help your money grow for big future goals.",
      },
      {
        title: "Ask for help",
        visual: <UserRound size={32} />,
        body: "Talk with a grown-up when you have questions.",
      },
      {
        title: "Review and repeat",
        visual: <CheckSquare size={32} />,
        body: "Check your plan often and make small changes as you learn.",
      },
    ],
  },
];

export const LibraryPopup: React.FC<LibraryPopupProps> = ({ onClose }) => {
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [spreadIndex, setSpreadIndex] = useState(0);

  const activeBook = useMemo(
    () => LIBRARY_BOOKS.find((book) => book.id === activeBookId) || null,
    [activeBookId],
  );

  const spreadCount = activeBook
    ? Math.ceil(activeBook.pages.length / 2)
    : 0;
  const leftPage = activeBook
    ? activeBook.pages[spreadIndex * 2]
    : null;
  const rightPage = activeBook
    ? activeBook.pages[spreadIndex * 2 + 1]
    : null;

  const goBackToShelf = () => {
    setActiveBookId(null);
    setSpreadIndex(0);
  };

  const handleOpenBook = (bookId: string) => {
    setActiveBookId(bookId);
    setSpreadIndex(0);
  };

  const handlePrevSpread = () => {
    setSpreadIndex((current) => Math.max(0, current - 1));
  };

  const handleNextSpread = () => {
    if (!activeBook) return;
    setSpreadIndex((current) => Math.min(spreadCount - 1, current + 1));
  };

  return (
    <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-4">
      <RetroBox title="Library" className="max-w-5xl w-full text-black">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase">
                {activeBook ? activeBook.title : "Choose a Book"}
              </h2>
              <p className="text-[10px] text-gray-600">
                {activeBook
                  ? activeBook.subtitle
                  : "Pick a book and learn something new!"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 text-[10px] font-bold uppercase border-2 border-black transition-colors"
            >
              Exit Library
            </button>
          </div>

          {!activeBook && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LIBRARY_BOOKS.map((book) => (
                <button
                  key={book.id}
                  onClick={() => handleOpenBook(book.id)}
                  className="relative bg-[#c55a42] hover:bg-[#d4654d] border-4 border-black p-4 text-left shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-6 bg-[#8b3e2f] border-r-4 border-black"></div>
                  <div className="absolute inset-y-2 right-1 w-2 bg-[#f6e8c8] border border-black"></div>
                  <div className="absolute inset-y-4 right-3 w-1 bg-[#f6e8c8] border border-black"></div>
                  <div className="flex items-center gap-3 pl-6">
                    <div className="text-white">{book.coverIcon}</div>
                    <div>
                      <div className="text-xs font-bold uppercase text-white">
                        {book.title}
                      </div>
                      <div className="text-[10px] text-white/80">
                        {book.subtitle}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeBook && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] text-gray-500">
                  Spread {spreadIndex + 1} of {spreadCount}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={goBackToShelf}
                    className="bg-slate-200 hover:bg-slate-300 text-black px-3 py-2 text-[10px] font-bold uppercase border-2 border-black transition-colors"
                  >
                    Back to Shelf
                  </button>
                  <button
                    onClick={handlePrevSpread}
                    disabled={spreadIndex === 0}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white px-3 py-2 text-[10px] font-bold uppercase border-2 border-black transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextSpread}
                    disabled={spreadIndex >= spreadCount - 1}
                    className="bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white px-3 py-2 text-[10px] font-bold uppercase border-2 border-black transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="relative bg-[#7a4b2a] border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.45)]">
                <div className="absolute inset-y-4 left-1/2 w-3 -translate-x-1/2 bg-[#caa472] border-x-2 border-black"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
                  {[leftPage, rightPage].map((page, index) => (
                    <div
                      key={`${activeBook.id}-${spreadIndex}-${index}`}
                      className="relative bg-[#fff8e8] border-4 border-black p-4 min-h-[260px] flex flex-col justify-between shadow-[inset_0_0_0_2px_#e8d8b8,0_4px_0_rgba(0,0,0,0.2)]"
                    >
                      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-black"></div>
                      {page ? (
                        <>
                          <div>
                            <div className="text-[10px] font-bold uppercase mb-2">
                              {page.title}
                            </div>
                            <div className="mb-3 text-[#334155] flex justify-center items-center h-16">{page.visual}</div>
                            <p className="text-[10px] text-gray-700 leading-relaxed">
                              {page.body}
                            </p>
                          </div>
                          <div className="text-[10px] text-gray-500 text-right">
                            Page {spreadIndex * 2 + index + 1} of {activeBook.pages.length}
                          </div>
                        </>
                      ) : (
                        <div className="text-[10px] text-gray-500">(Blank Page)</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </RetroBox>
    </div>
  );
};
