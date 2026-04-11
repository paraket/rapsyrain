import React from 'react';
import { ArrowRight } from 'lucide-react';

const ToolCard = ({ title, description, icon: Icon, color, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col p-4 md:p-6 rounded-2xl border bg-card hover:shadow-2xl hover:border-primary/50 transition-all duration-300 cursor-pointer lg:p-8 overflow-hidden"
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${color} flex items-center justify-center text-white mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/10`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>

      <h3 className="text-sm md:text-xl font-bold mb-1.5 md:mb-3 group-hover:text-primary transition-colors leading-tight">{title}</h3>
      <p className="text-muted-foreground text-[11px] md:text-sm leading-relaxed mb-0 md:mb-6 flex-grow line-clamp-3 md:line-clamp-none">
        {description}
      </p>

      <div className="hidden md:flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform duration-300">
        Launch Tool <ArrowRight size={16} className="ml-2" />
      </div>

      {/* Subtle background decoration */}
      <div className={`absolute -right-4 -bottom-4 w-16 h-16 md:w-24 md:h-24 rounded-full ${color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300`} />
    </div>
  );
};

export default ToolCard;
