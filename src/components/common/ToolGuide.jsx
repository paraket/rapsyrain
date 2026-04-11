import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const ToolGuide = ({ title = "Pro Tips", items = [], className }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!items || items.length === 0 || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "relative bg-primary/5 border border-primary/10 rounded-[1.5rem] p-4 sm:p-5 mt-4 group overflow-hidden",
            className
          )}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-primary/10 text-primary/40 hover:text-primary transition-all z-10"
            title="Dismiss Tips"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-[11px] font-bold tracking-tight text-foreground/90 uppercase">{title}</h4>
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Quick Onboarding</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2.5 group/item">
                <div className="mt-0.5 shrink-0 text-primary/40 group-hover/item:text-primary transition-colors">
                  <CheckCircle2 size={14} />
                </div>
                <p className="text-[13px] text-foreground/70 leading-relaxed font-medium group-hover/item:text-foreground transition-colors">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-primary/10 flex items-center gap-2 text-primary/50">
            <Info size={12} />
            <p className="text-[9px] font-bold uppercase tracking-tight">
              100% Secure: Files are processed entirely in your browser. No data ever leaves your device.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToolGuide;
