import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { QuickStart } from "@/components/docs/QuickStart";
import { DocSections } from "@/components/docs/DocSections";
import { FAQ } from "@/components/docs/FAQ";
import { navLinks } from "@/constants/navLinks";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <Navbar links={navLinks} />

      <main className="relative z-10 pt-32 pb-20">
        <header className="text-center max-w-4xl mx-auto px-4 mb-24">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
            Documentation <br />
            <span className="bg-clip-text text-transparent bg-linear-to-b from-white to-white/40">
              at your fingertips.
            </span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about ReadmeGenAI. From quick start
            guides to advanced configuration, we&apos;ve got you covered.
          </p>
        </header>

        <div className="space-y-8">
          <QuickStart />
          <DocSections />
          <FAQ />
        </div>
      </main>

      <Footer />
    </div>
  );
}
