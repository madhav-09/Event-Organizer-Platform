import { Music, Laugh, Briefcase, BookOpen, PartyPopper, Palette, Trophy, Coffee } from 'lucide-react';

const categories = [
  { name: 'All', icon: PartyPopper, color: 'from-blue-500 to-purple-500' },
  { name: 'Music', icon: Music, color: 'from-pink-500 to-rose-500' },
  { name: 'Comedy', icon: Laugh, color: 'from-yellow-500 to-orange-500' },
  { name: 'Workshop', icon: BookOpen, color: 'from-green-500 to-emerald-500' },
  { name: 'Conference', icon: Briefcase, color: 'from-indigo-500 to-blue-500' },
  { name: 'Art', icon: Palette, color: 'from-purple-500 to-pink-500' },
  { name: 'Sports', icon: Trophy, color: 'from-red-500 to-orange-500' },
  { name: 'Food', icon: Coffee, color: 'from-amber-500 to-yellow-500' },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide">
            {categories.map(({ name, icon: Icon, color }) => (
              <button
                key={name}
                onClick={() => onSelect(name)}
                className={`flex-shrink-0 flex items-center space-x-2 px-5 py-3 rounded-full font-medium transition-all duration-200 ${
                  selected === name
                    ? `bg-gradient-to-r ${color} text-white shadow-lg scale-105`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="whitespace-nowrap">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
