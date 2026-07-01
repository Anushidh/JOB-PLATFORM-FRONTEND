import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { Briefcase } from 'lucide-react';
import { Text } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    heading: 'Where talent meets opportunity',
    body: 'Join thousands of professionals and companies building the future of work.',
  },
  {
    heading: 'Your next career move starts here',
    body: 'Discover roles that match your skills, values, and ambitions.',
  },
  {
    heading: 'Hire smarter, not harder',
    body: 'AI-powered matching connects you with the right candidates in minutes.',
  },
  {
    heading: 'Built for modern teams',
    body: 'From startups to enterprises — streamline your hiring pipeline end to end.',
  },
];

export function AuthLayout() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-xs xl:w-[560px] flex-col justify-between bg-neutral-950 p-10 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-600">
            <Briefcase className="size-4.5 text-white" />
          </div>
          <Text variant="h5" className="text-white tracking-tight">
            HireFlow
          </Text>
        </div>

        {/* Animated Tagline */}
        <div className="relative min-h-[120px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-4"
            >
              <Text variant="h2" className="text-white text-balance">
                {slides[currentSlide].heading}
              </Text>
              <Text variant="body" className="text-neutral-400 max-w-sm">
                {slides[currentSlide].body}
              </Text>
            </motion.div>
          </AnimatePresence>

          {/* Slide indicators */}
          <div className="flex gap-1.5 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? 'w-6 bg-primary-500'
                    : 'w-1.5 bg-neutral-700 hover:bg-neutral-600'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <Text variant="caption" className="text-neutral-500">
          © 2026 HireFlow. All rights reserved.
        </Text>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-600">
            <Briefcase className="size-4.5 text-white" />
          </div>
          <Text variant="h5" className="tracking-tight">
            HireFlow
          </Text>
        </div>

        <div className="w-full max-w-[400px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
