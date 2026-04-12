import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Combine,
  Scissors,
  Zap,
  ShieldCheck,
  FileText,
  Home,
  Info,
  Shield,
  HelpCircle,
  Settings,
  Landmark,
  FileUser,
  Timer
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import Link from 'next/link';

const menuTools = [
  { name: 'Merge PDF', icon: Combine, href: '/merge', color: 'bg-blue-600' },
  { name: 'Split PDF', icon: Scissors, href: '/split', color: 'bg-orange-500' },
  { name: 'Compress PDF', icon: Zap, href: '/compress', color: 'bg-red-500' },
  { name: 'Safe PDF', icon: ShieldCheck, href: '/safepdf', color: 'bg-emerald-600' },
];

const generalLinks = [
  { name: 'All Tools', icon: Home, href: '/' },
  { name: 'Privacy Policy', icon: Shield, href: '/privacy' },
  { name: 'About SafePDF', icon: Info, href: '/about' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

const networkLinks = [
  {
    name: 'QPkendra',
    img: 'https://1.bp.blogspot.com/-t0yhya0oGio/X0UyQHWZ0XI/AAAAAAAAAG4/IHfVnKuyMckPci4AqMbgKGtVWbMJfSVxwCLcBGAsYHQ/logo.png',
    href: 'https://QPkendra.com'
  },
  {
    name: 'MSBTE Paper',
    img: 'https://play-lh.googleusercontent.com/LqfYWAz8SnxbQgLxiEvdvsn948DjVMfFYSVKJo2aditw2DbT6zylzpSTuq8E1R1ZuY-6ol8XFx5B9rP9fxBS=w240-h480-rw',
    href: 'https://play.google.com/store/apps/details?id=com.shyam.msbtemodelanswerpaper'
  },
  { name: 'IFSC Finder', icon: Landmark, href: 'https://bankifsccode.qpkendra.com' },
  { name: 'Resume Builder', icon: FileUser, href: 'https://resume-builder.qpkendra.com' },
  { name: 'Timer', icon: Timer, href: 'https://timer.qpkendra.com' },
];

const MobileMenu = ({ isOpen, onClose }) => {
  const { clearPreviewCache } = useSettings();

  const handleHomeClick = () => {
    clearPreviewCache();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] md:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-screen w-[320px] bg-background z-[110] md:hidden flex flex-col border-r border-border shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="pt-10 pb-6 px-6 flex flex-col gap-6 border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3" onClick={handleHomeClick}>
                  <div className="bg-[#2563eb] p-2 rounded-xl text-primary-foreground shadow-xl shadow-blue-500/20">
                    <FileText size={24} />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-black text-foreground tracking-tighter leading-none">myPDF</h1>
                    <span className="text-[10px] font-black text-[#2563eb] uppercase tracking-[0.3em]">Lite Suite</span>
                  </div>
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted rounded-xl border border-border"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                Privacy-Focused (Processed on your device)

              </p>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide bg-gradient-to-b from-transparent to-muted/10">

              {/* Navigation Section */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-6 px-1">
                  Navigation
                </h3>
                <nav className="space-y-1">
                  {generalLinks.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.03 }}
                    >
                      <Link
                        href={item.href}
                        onClick={item.href === '/' ? handleHomeClick : onClose}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-all group"
                      >
                        <div className="text-muted-foreground/60 group-hover:text-primary transition-colors">
                          <item.icon size={18} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-bold tracking-tight text-foreground group-hover:text-foreground transition-colors">
                          {item.name}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </section>

              {/* Network Section */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-6 px-1">
                  Network
                </h3>
                <nav className="grid grid-cols-2 gap-2">
                  {networkLinks.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + index * 0.03 }}
                    >
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/30 border border-border hover:border-amber-500/30 hover:bg-muted transition-all group text-center min-h-[80px]"
                      >
                        <div className="mb-2">
                          {item.img ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-1 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-border">
                              <Image src={item.img} alt="" width={32} height={32} className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="text-muted-foreground/60 group-hover:text-amber-500 transition-colors">
                              <item.icon size={16} strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold tracking-tight text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                          {item.name}
                        </span>
                      </a>
                    </motion.div>
                  ))}
                </nav>
              </section>

              {/* Tools Section */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-6 px-1">
                  Featured Tools
                </h3>
                <nav className="grid grid-cols-2 gap-2">
                  {menuTools.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-muted/30 border border-border hover:border-primary/30 hover:bg-muted transition-all group text-center h-24"
                      >
                        <div className={`p-2 rounded-xl ${item.color} text-white shadow-lg shadow-black/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mb-2`}>
                          <item.icon size={16} />
                        </div>
                        <span className="text-[10px] font-black tracking-tight text-foreground group-hover:text-foreground transition-colors leading-tight uppercase">
                          {item.name}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </section>
            </div>

            {/* Premium Footer */}
            <div className="p-2 border-t border-border bg-muted/20">
              <div className="flex flex-col items-center gap-5">
                <div className="flex items-center gap-1 opacity-30 hover:opacity-100 transition-opacity duration-700 cursor-default grayscale hover:grayscale-0">
                  <div className="w-7 h-7 bg-foreground rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs text-background font-black">QP</span>
                  </div>
                  <span className="text-xs font-black text-foreground tracking-[0.4em] uppercase">qpkendra</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                    Built for your Privacy
                  </p>
                  <p className="text-[8px] text-muted-foreground/80 font-bold uppercase">
                    Crafted with 💙 in India
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
