import Navbar from './Navbar';
import Footer from './Footer';
import SEO from '../SEO';
import JsonLd from '../JsonLd';
import AnimatedOutlet from '../motion/AnimatedOutlet';
import ScrollProgress from '../motion/ScrollProgress';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO />
      <JsonLd />
      <ScrollProgress />
      <Navbar />
      <main className="flex-1 min-h-[60vh]">
        <AnimatedOutlet />
      </main>
      <Footer />
    </div>
  );
}
