import Link from 'next/link';
import AdUnit from './AdUnit';
import { 
  ShieldCheck, 
  Heart, 
  Timer, 
  Landmark, 
  FileUser,
  Merge,
  Scissors,
  Zap,
  FileText
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 pt-16 pb-12">
      <div className="container px-4 max-w-7xl mx-auto">
        <AdUnit format="horizontal" className="mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">myPDF <span className="text-[#2563eb]">Lite</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The secure PDF toolkit that runs entirely in your browser.
              No uploads. Processed locally. Wiped clean on close.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
              <ShieldCheck size={14} />
              100% Secure (On your device)

            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-5 text-foreground">Tools</h4>
            <ul className="space-y-4 text-sm text-muted-foreground flex flex-col items-start font-medium">
              <li>
                <Link href="/merge" className="hover:text-primary transition-colors flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/10 group-hover:scale-110 transition-transform">
                    <Merge size={12} />
                  </div>
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/split" className="hover:text-primary transition-colors flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-md bg-orange-500/10 flex items-center justify-center text-orange-600 border border-orange-500/10 group-hover:scale-110 transition-transform">
                    <Scissors size={12} />
                  </div>
                  Split PDF
                </Link>
              </li>
              <li>
                <Link href="/compress" className="hover:text-primary transition-colors flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-md bg-red-500/10 flex items-center justify-center text-red-600 border border-red-500/10 group-hover:scale-110 transition-transform">
                    <Zap size={12} />
                  </div>
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-to-word" className="hover:text-primary transition-colors flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-md bg-blue-600/10 flex items-center justify-center text-blue-700 border border-blue-600/10 group-hover:scale-110 transition-transform">
                    <FileText size={12} />
                  </div>
                  PDF to Word
                </Link>
              </li>
              <li>
                <Link href="/safepdf" className="hover:text-primary transition-colors flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={12} />
                  </div>
                  myPDF (Sanitizer)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-5 text-foreground">Network</h4>
            <div className="flex flex-wrap gap-2.5 items-center">
              <a
                href="https://bankifsccode.qpkendra.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-1 pr-3 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group w-fit"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600 border border-blue-500/20 shrink-0 shadow-sm">
                  <Landmark size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-none text-foreground group-hover:text-primary transition-colors">Indian Bank IFSC Finder</span>
                </div>
              </a>

              <a
                href="https://resume-builder.qpkendra.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-1 pr-3 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group w-fit"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shrink-0 shadow-sm">
                  <FileUser size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-tight text-[#2563eb]/70 leading-none mb-0.5">ATS Friendly</span>
                  <span className="text-xs font-bold leading-none text-foreground group-hover:text-primary transition-colors">Resume Builder</span>
                </div>
              </a>

              <a
                href="https://timer.qpkendra.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-1 pr-3 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group w-fit"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-500/10 text-orange-600 border border-orange-500/20 shrink-0 shadow-sm">
                  <Timer size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-tight text-[#2563eb]/70 leading-none mb-0.5">Focus</span>
                  <span className="text-xs font-bold leading-none text-foreground group-hover:text-primary transition-colors">Timer</span>
                </div>
              </a>

              <a
                href="https://QPkendra.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit QPkendra"
                className="flex items-center gap-1.5 p-1 pr-3 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group w-fit"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-border/50 shrink-0 bg-white p-1 shadow-sm">
                  <img
                    src="https://1.bp.blogspot.com/-t0yhya0oGio/X0UyQHWZ0XI/AAAAAAAAAG4/IHfVnKuyMckPci4AqMbgKGtVWbMJfSVxwCLcBGAsYHQ/logo.png"
                    alt="QPkendra Logo"
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-none text-foreground group-hover:text-primary transition-colors">QPkendra</span>
                </div>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.shyam.msbtemodelanswerpaper"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download MSBTE Paper App from Google Play"
                className="flex items-center gap-1.5 p-1 pr-3 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group w-fit"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-border/50 shrink-0 shadow-sm">
                  <img
                    src="https://play-lh.googleusercontent.com/LqfYWAz8SnxbQgLxiEvdvsn948DjVMfFYSVKJo2aditw2DbT6zylzpSTuq8E1R1ZuY-6ol8XFx5B9rP9fxBS=w240-h480-rw"
                    alt="MSBTE Paper App Icon"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-tight text-[#2563eb]/70 leading-none mb-0.5">Android App</span>
                  <span className="text-xs font-bold leading-none text-foreground group-hover:text-primary transition-colors">MSBTE Paper</span>
                </div>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-5 text-foreground">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground flex flex-col items-start">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Story</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><button className="hover:text-primary transition-colors cursor-not-allowed opacity-50">Help Center</button></li>
              <li><button className="hover:text-primary transition-colors cursor-not-allowed opacity-50 text-left">Feedback</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} myPDF Lite.</p>
          <div className="flex items-center gap-1">
            Crafted with <Heart size={14} className="text-blue-500 fill-blue-500" /> in India
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
