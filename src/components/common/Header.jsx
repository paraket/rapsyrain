import { useState } from 'react';
import { FileText, HelpCircle, Sun, Moon, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MobileMenu from './MobileMenu';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { clearPreviewCache } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleToolsClick = (e) => {
    e.preventDefault();
    clearPreviewCache();
    router.push('/');
    setTimeout(() => {
      const toolsSection = document.getElementById('tools');
      if (toolsSection) {
        toolsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>

          <Link 
            href="/" 
            className="flex items-center gap-2 cursor-pointer"
            onClick={clearPreviewCache}
          >
            <div className="bg-[#2563eb] p-1.5 rounded-lg text-white">
              <FileText size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">myPDF <span className="text-[#2563eb]">Lite</span></span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={handleToolsClick}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Tools
          </button>
          <Link
            href="/privacy"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Privacy
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <Link
            href="/settings"
            className="hidden md:flex p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Settings"
          >
            <SettingsIcon size={20} />
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-muted transition-colors relative h-10 w-10 flex items-center justify-center overflow-hidden"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDarkMode ? 'dark' : 'light'}
                initial={{ y: 20, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-muted-foreground" />}
              </motion.div>
            </AnimatePresence>
          </button>

          <Link
            href="/about"
            className="hidden md:flex p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Help"
          >
            <HelpCircle size={20} />
          </Link>
        </div>
      </div>
      
      {/* Mobile Drawer */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
};

export default Header;
