import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ToolLayout = ({ title, description, icon: Icon, color, children, onBack }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[80vh] py-4 md:py-8 px-2 sm:px-4 md:px-8 w-full max-w-7xl mx-auto"
    >
      <motion.button 
        variants={itemVariants}
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeft size={18} />
        Back to all tools
      </motion.button>

      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start gap-4 mb-8">
        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${color} flex items-center justify-center text-white shrink-0 shadow-lg`}>
          <Icon size={28} className="md:size-8" />
        </div>
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-1">{title}</h1>
          <p className="text-muted-foreground text-sm md:text-lg leading-snug">{description}</p>
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        className="bg-card border rounded-3xl p-4 md:p-6 shadow-sm"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ToolLayout;
