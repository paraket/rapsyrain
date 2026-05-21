import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, EyeOff, ServerOff, Database, CheckCircle2 } from 'lucide-react';

const Privacy = ({ onBack }) => {
  const principles = [
    {
      icon: <ServerOff className="text-emerald-500" size={24} />,
      title: "No Server Transfer",
      text: "Your files never leave your browser window and are never transferred to any external server."
    },
    {
      icon: <EyeOff className="text-emerald-500" size={24} />,
      title: "Instant Auto-Clean",
      text: "Document data is wiped clean from your browser immediately as soon as you close the window."
    },
    {
      icon: <Database className="text-emerald-500" size={24} />,
      title: "Settings Sync",
      text: "Only your tool preferences (like theme or split depth) are stored locally. Document data is never persisted."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-3xl mx-auto py-8 md:py-12 px-4 space-y-8 md:space-y-12">
        {/* Top Guarantee */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 md:p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/20 space-y-4"
        >
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold">
            <Lock size={20} />
            <span className="uppercase tracking-widest text-xs">Our Absolute Guarantee</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground">100% Private: Your files never leave your browser window.</h2>
          <p className="text-muted-foreground leading-relaxed font-medium">
            myPDF Lite is a secure, "No-Upload" PDF editor. Everything you do
            happens right inside your own browser window and is wiped clean
            the moment you leave. Your documents are never seen by us or any server.
          </p>
        </motion.div>

        {/* Content Sections */}
        <section className="space-y-6 md:space-y-10">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={20} /> How It Works
            </h3>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p>
                Unlike other "Free PDF" sites that upload your private documents
                to their servers, we use your own computer's power to do the work.
                This is the only way to be 100% certain your data is safe.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {principles.map((item, i) => (
              <div key={i} className="p-4 md:p-6 rounded-2xl border bg-card flex gap-4">
                <div className="shrink-0 p-3 rounded-xl bg-muted bg-emerald-500/10">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={20} /> Transparency & Sustainability
            </h3>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
              <p>
                To keep myPDF Lite free for everyone, we use <strong>Google AdSense</strong> to show
                non-intrusive advertisements. We also use <strong>Google Analytics</strong> to
                understand how the product is used and identify areas for improvement.
              </p>
              <div className="p-4 rounded-xl bg-muted/50 border border-emerald-500/20">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Zero Access Guarantee</p>
                <p className="text-sm">
                  These services (like Google) help us keep the tool free, but they
                  have <strong>zero access</strong> to your files. Your document data
                  stays locked inside your private browser window.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-12 border-t text-center text-sm text-muted-foreground">
          <p>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p className="mt-2">myPDF Lite Policy v1.0 • Secure • No-Upload • Transparent</p>
        </section>
      </main>
    </div>
  );
};

export default Privacy;
