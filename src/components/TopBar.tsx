import { BookOpen, Eraser, ImagePlus, Images, Sparkles, Type, Wand2 } from "lucide-react";
import { PageId } from "../types/studio";

interface TopBarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  photoCount: number;
  onOpenPhotoHall: () => void;
}

const NAV_ITEMS: { id: PageId; label: string; mobileLabel: string; icon: typeof Sparkles }[] = [
  { id: "design", label: "Image Design", mobileLabel: "Design", icon: Sparkles },
  { id: "erase", label: "Select & Erase", mobileLabel: "Erase", icon: Eraser },
  { id: "create", label: "Photo Create", mobileLabel: "Create", icon: ImagePlus },
  { id: "ai-edit", label: "AI Edit", mobileLabel: "AI Edit", icon: Wand2 },
  { id: "book", label: "Book Builder", mobileLabel: "Book", icon: BookOpen },
  { id: "text", label: "Text Studio", mobileLabel: "Text", icon: Type },
];

export function TopBar({ activePage, onNavigate, photoCount, onOpenPhotoHall }: TopBarProps) {
  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F7F7F5]/90 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Title */}
          <button
            type="button"
            onClick={() => onNavigate("design")}
            className="text-lg md:text-xl font-bold tracking-tight text-zinc-950 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
          >
            Lumina Studio
          </button>

          {/* Zone 2: 4 Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    isActive
                      ? "text-zinc-950 border-zinc-950 font-semibold"
                      : "text-zinc-500 border-transparent hover:text-zinc-900"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenPhotoHall}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
            >
              <Images className="w-4 h-4" />
              <span>Photo Hall ({photoCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Thumb-Zone Navigation Bar (6 pages) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 pb-safe"
      >
        <div className="grid grid-cols-6 h-16 items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] py-1.5 transition-colors cursor-pointer ${
                  isActive ? "text-blue-600" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
