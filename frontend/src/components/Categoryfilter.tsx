import { Music, Laugh, Briefcase, BookOpen, PartyPopper, Palette, Trophy, Coffee, Cpu } from 'lucide-react';

const categories = [
  { name: 'All', icon: PartyPopper, color: 'from-brand-500 to-indigo-600', glow: 'rgba(108,71,236,0.5)' },
  { name: 'Music', icon: Music, color: 'from-pink-500 to-rose-600', glow: 'rgba(236,72,153,0.5)' },
  { name: 'Comedy', icon: Laugh, color: 'from-yellow-500 to-orange-500', glow: 'rgba(245,158,11,0.5)' },
  { name: 'Workshop', icon: BookOpen, color: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.5)' },
  { name: 'Conference', icon: Briefcase, color: 'from-blue-500 to-indigo-600', glow: 'rgba(59,130,246,0.5)' },
  { name: 'Technology', icon: Cpu, color: 'from-cyan-500 to-teal-600', glow: 'rgba(6,182,212,0.5)' },
  { name: 'Art', icon: Palette, color: 'from-purple-500 to-violet-600', glow: 'rgba(139,92,246,0.5)' },
  { name: 'Sports', icon: Trophy, color: 'from-red-500 to-orange-600', glow: 'rgba(239,68,68,0.5)' },
  { name: 'Food', icon: Coffee, color: 'from-amber-500 to-yellow-500', glow: 'rgba(245,158,11,0.5)' },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="sticky top-0 z-40 border-b border-white/5"
      style={{ background: 'rgba(11,15,26,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-4">
          {categories.map(({ name, icon: Icon, color, glow }) => {
            const isActive = selected === name;
            return (
              <button
                key={name}
                onClick={() => onSelect(name)}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                  transition-all duration-300 whitespace-nowrap border
                  ${isActive
                    ? `bg-gradient-to-r ${color} text-white border-transparent`
                    : 'text-slate-400 hover:text-white border-white/10 hover:border-white/20'
                  }
                `}
                style={{
                  background: isActive ? undefined : 'rgba(255,255,255,0.04)',
                  boxShadow: isActive ? `0 0 20px -4px ${glow}` : undefined,
                  transform: isActive ? 'translateY(-1px)' : undefined,
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
