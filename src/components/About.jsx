import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Globe, Heart, ChevronLeft, Lock, Award, EyeOff } from 'lucide-react';

const About = ({ onBack }) => {
  const features = [
    {
      icon: <ShieldCheck className="text-emerald-500" size={32} />,
      title: "No-Upload Tools",
      description: "Your files never leave your browser window and are never sent to any external server."
    },
    {
      icon: <Zap className="text-amber-500" size={32} />,
      title: "Blazing Fast",
      description: "Powered by WebAssembly and local processing, we process files at the speed of your hardware."
    },
    {
      icon: <EyeOff className="text-emerald-500" size={32} />,
      title: "Instant Auto-Clean",
      description: "Your documents are wiped clean from your browser as soon as you close the window."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <main className="container max-w-4xl mx-auto py-10 md:py-20 px-4 space-y-12 md:space-y-24 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"
          >
            <Lock size={14} /> No Uploads. 100% Private.
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-6xl font-black tracking-tight"
          >
            Rethinking How You <br />
            <span className="text-primary">Handle PDFs.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            myPDF Lite is built on a radical principle: you shouldn't have to trust anyone.
            By processing everything in your browser, your files never leave the window
            and are destroyed the moment you close the tab. We keep it free through
            non-intrusive advertising and non-personal analytics.
          </motion.p>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-6 md:p-8 rounded-3xl border bg-card/50 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/5 transition-all text-center space-y-4 group"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </section>

        {/* The "How it Works" Section */}
        <section className="p-6 md:p-12 rounded-[32px] md:rounded-[40px] border bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <EyeOff size={120} className="text-primary" />
          </div>
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">The Magic of WebAssembly</h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                We use industry-leading technology to bring high-quality PDF
                tools directly to your browser. Your computer does all the work—fast,
                private, and secure. No data ever leaves your window.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Files Uploaded', val: 'Never' },
                { label: 'Data Tracked', val: '0%' },
                { label: 'Browser Support', val: '100%' },
                { label: 'User Trust', val: '∞' }
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                  <p className="text-2xl font-black text-primary">{stat.val}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action section (Repurposed from footer) */}
        <section className="text-center py-8 space-y-6 border-t pt-10 md:pt-20">
          <div className="space-y-2">
            <p className="text-muted-foreground flex items-center justify-center gap-2 font-medium">
              Built with <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" /> for your security.
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-50">
              myPDF Lite v1.5
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
          >
            Start Processing Now
          </button>
        </section>
      </main>
    </div>
  );
};

export default About;
