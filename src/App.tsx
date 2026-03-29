/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, FormEvent } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Fuse from 'fuse.js';
import './types.d.ts';
import { TestimonialsSection } from './components/blocks/testimonials';
import { Footer } from './components/blocks/footer';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { Toaster, toast } from 'sonner';

import { Typewriter } from './components/ui/typewriter';
import { MagneticButton } from './components/ui/magnetic-button';
import { TextReveal } from './components/ui/text-reveal';

function Home() {
  const COMPANY_PHONE = '0411 099 994'; // Updated company phone number
  const [activeTab, setActiveTab] = useState<'booking' | 'contact'>('booking');
  const [bookingStep, setBookingStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    fromLocation: '',
    toLocation: '',
    pickupDate: '',
    pickupTime: '',
    driverOption: 'with-driver',
    service: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null);
  const [bookingReference, setBookingReference] = useState<string>('');
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerTheme, setHeaderTheme] = useState<'light' | 'dark'>('light');
  const { scrollYProgress } = useScroll();
  const textY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const imageY = useTransform(scrollYProgress, [0, 0.2], [0, 50]);

  const melbourneLocations = [
    'Melbourne Airport (MEL)',
    'Melbourne CBD',
    'Southbank, Melbourne',
    'Docklands, Melbourne',
    'St Kilda, Melbourne',
    'Richmond, Melbourne',
    'South Yarra, Melbourne',
    'Fitzroy, Melbourne',
    'Carlton, Melbourne',
    'Brunswick, Melbourne',
    'Footscray, Melbourne',
    'Box Hill, Melbourne',
    'Glen Waverley, Melbourne',
    'Dandenong, Melbourne',
    'Frankston, Melbourne',
    'Geelong, Victoria',
    'Mornington Peninsula',
    'Yarra Valley',
    'Phillip Island',
    'Great Ocean Road',
    'Melborne CBD',
    'Tullamarine Airport',
    'Avalon Airport',
    'Southern Cross Station',
    'Flinders Street Station',
    'MCG (Melbourne Cricket Ground)',
    'Marvel Stadium',
    'St Kilda Beach',
    'Chadstone Shopping Centre',
    'Chaddy',
    'The G'
  ];

  const fuse = new Fuse(melbourneLocations, {
    threshold: 0.4,
    distance: 100,
    ignoreLocation: true,
    minMatchCharLength: 2
  });

  const servicesAvailability: Record<string, boolean> = {
    'vehicle-hire': true,
    'accessible': true,
    'corporate': true,
    'tour': true,
    'school': true,
    'disruption': false,
    'removal': false,
    'civil': true
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, name, value } = e.target;
    const fieldId = id || name;
    if (!fieldId) return;

    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }

    // Handle location suggestions
    if (fieldId === 'fromLocation') {
      if (value.length > 1) {
        const results = fuse.search(value);
        setFromSuggestions(results.map(r => r.item));
      } else {
        setFromSuggestions([]);
      }
    }

    if (fieldId === 'toLocation') {
      if (value.length > 1) {
        const results = fuse.search(value);
        setToSuggestions(results.map(r => r.item));
      } else {
        setToSuggestions([]);
      }
    }
  };

  const selectSuggestion = (field: 'fromLocation' | 'toLocation', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'fromLocation') setFromSuggestions([]);
    if (field === 'toLocation') setToSuggestions([]);

    // Clear error when a valid suggestion is selected
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Blur the input to hide keyboard on mobile and signal selection
    const element = document.getElementById(field);
    if (element) {
      (element as HTMLInputElement).blur();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.location-input-container')) {
        setFromSuggestions([]);
        setToSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nextStep = () => {
    const newErrors: Record<string, string> = {};

    if (bookingStep === 1) {
      if (!formData.fromLocation.trim()) newErrors.fromLocation = 'Pickup location required.';
      if (!formData.toLocation.trim()) newErrors.toLocation = 'Destination required.';
      if (!formData.service) newErrors.service = 'Please select a service.';
    } else if (bookingStep === 2) {
      if (!formData.pickupDate) newErrors.pickupDate = 'Date required.';
      if (!formData.pickupTime) newErrors.pickupTime = 'Time required.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setBookingStep(prev => prev + 1);
    }
  };

  const prevStep = () => setBookingStep(prev => prev - 1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // If it's a "Call Us" service, trigger the call instead of submitting
    if (activeTab === 'booking' && formData.service && servicesAvailability[formData.service] === false) {
      window.location.href = `tel:${COMPANY_PHONE}`;
      return;
    }

    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Please enter your full name.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required for confirmation.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (activeTab === 'booking') {
      if (!formData.phone.trim()) newErrors.phone = 'We need your phone number to coordinate.';
      if (!formData.fromLocation.trim()) newErrors.fromLocation = 'Please specify your pickup location.';
      if (!formData.toLocation.trim()) newErrors.toLocation = 'Please specify your destination.';
      if (!formData.pickupDate) newErrors.pickupDate = 'Please select a pickup date.';
      if (!formData.pickupTime) newErrors.pickupTime = 'Please select a pickup time.';
      if (!formData.service) newErrors.service = 'Please select a service category.';
    } else {
      if (!formData.message.trim()) newErrors.message = 'Please let us know how we can help.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSubmitStatus('loading');
      const reference = `CT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, reference })
        });

        if (!response.ok) throw new Error('Failed to save booking');

        setBookingReference(reference);
        setSubmittedData({ ...formData });
        setSubmitStatus('success');
        setBookingStep(1);

        toast.success(activeTab === 'booking' ? 'Booking request sent successfully!' : 'Message sent successfully!');

        setFormData({
          fullName: '',
          email: '',
          phone: '',
          fromLocation: '',
          toLocation: '',
          pickupDate: '',
          pickupTime: '',
          driverOption: 'with-driver',
          service: '',
          message: ''
        });
      } catch (error) {
        console.error('Error submitting booking:', error);
        setSubmitStatus('error');
        toast.error('Failed to submit request. Please try again.');
      }
    } else {
      const firstErrorId = Object.keys(newErrors)[0];
      document.getElementById(firstErrorId)?.focus();
    }
  };

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (href?.startsWith('#')) {
        const id = href.substring(1);
        const element = id ? document.getElementById(id) : document.body;

        if (element) {
          e.preventDefault();
          const headerOffset = 100; // Offset for the fixed luxury navbar
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: id === "" ? 0 : offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      setIsScrolled(window.scrollY > 50);
    };

    // Header Theme Observer
    const sections = document.querySelectorAll('[data-header-theme]');
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -85% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const theme = entry.target.getAttribute('data-header-theme') as 'light' | 'dark';
          if (theme) setHeaderTheme(theme);
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));
    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Ultra-Modern Split Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${isScrolled
          ? 'py-4 px-4 md:px-8'
          : 'p-4 md:p-8'
          } flex justify-between items-center pointer-events-none`}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute top-0 left-0 h-0.5 bg-white origin-left z-[60]"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Left: Logo */}
        <motion.a
          href="/"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="pointer-events-auto group flex items-center justify-center transition-all duration-500"
        >
          <div className="h-14 md:h-18 flex items-center justify-center">
            <img
              src={headerTheme === 'dark' ? "/images/CT LOGO WHITE.png" : "/images/CT LOGO.png"}
              alt="Commuter Transit Logo"
              className={`h-full w-auto object-contain transition-all duration-500 ${headerTheme === 'light' ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]' : 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]'}`}
            />
          </div>
        </motion.a>

        {/* Center: Magnetic Nav (Desktop) */}
        <nav className={`pointer-events-auto hidden md:flex items-center p-1.5 backdrop-blur-xl border rounded-full transition-all duration-500 shadow-lg ${headerTheme === 'dark'
            ? 'bg-black/20 border-white/10'
            : 'bg-zinc-100/80 border-black/5'
          }`}>
          {['About', 'Services', 'Standards', 'Clients'].map((item, idx) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              onMouseEnter={() => setHoveredNav(item)}
              onMouseLeave={() => setHoveredNav(null)}
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={`relative px-6 py-2.5 text-[10px] font-bold transition-all duration-300 tracking-[0.2em] uppercase ${headerTheme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-brand-blue'
                }`}
            >
              {hoveredNav === item && (
                <motion.div
                  layoutId="nav-pill"
                  className={`absolute inset-0 rounded-full ${headerTheme === 'dark' ? 'bg-white/10' : 'bg-brand-blue/5'
                    }`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item}</span>
            </motion.a>
          ))}
        </nav>

        {/* Right: CTA & Status */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className={`hidden lg:flex items-center gap-2 backdrop-blur-xl border rounded-full px-4 py-2.5 transition-all duration-500 shadow-lg ${headerTheme === 'dark'
              ? 'bg-black/20 border-white/10'
              : 'bg-zinc-100/80 border-black/5'
            }`}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            <span className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${headerTheme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>Available 24/7</span>
          </div>
          <a href="#contact" className={`hidden md:flex group items-center gap-2 backdrop-blur-xl border px-8 py-3 rounded-full transition-all duration-500 shadow-lg ${headerTheme === 'dark'
              ? 'bg-white text-brand-blue border-white hover:bg-zinc-100'
              : 'bg-brand-blue text-white border-brand-blue hover:bg-brand-blue-light'
            }`}>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500">Book</span>
            <iconify-icon icon="solar:arrow-right-up-linear" width="16" className="transition-transform duration-500 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"></iconify-icon>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden w-12 h-12 backdrop-blur-xl border rounded-full flex items-center justify-center shadow-lg transition-all duration-500 pointer-events-auto ${headerTheme === 'dark'
                ? 'bg-black/20 border-white/10 text-white'
                : 'bg-zinc-100/80 border-black/5 text-brand-blue'
              }`}
          >
            <iconify-icon icon={isMobileMenuOpen ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"} width="20"></iconify-icon>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-brand-blue/95 backdrop-blur-3xl pt-24 px-6 pb-6 flex flex-col"
          >
            <nav className="flex flex-col gap-8 text-center mt-12">
              {['About', 'Services', 'Standards', 'Clients'].map((item, idx) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.5 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-3xl font-medium text-zinc-300 hover:text-white transition-colors tracking-widest uppercase"
                >
                  {item}
                </motion.a>
              ))}
              <motion.a
                href="#contact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-8 mx-auto inline-flex items-center gap-2 bg-white text-black px-10 py-5 rounded-full hover:bg-zinc-200 transition-colors shadow-2xl"
              >
                <span className="text-sm font-bold uppercase tracking-widest">Book Now</span>
                <iconify-icon icon="solar:arrow-right-up-linear" width="18"></iconify-icon>
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Modern Minimalist */}
      <section id="hero" data-header-theme="dark" className="relative min-h-[100svh] flex items-center bg-brand-blue overflow-hidden pt-24 md:pt-32">
        {/* Minimalist Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-blue-light/20 to-transparent pointer-events-none"></div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center">

            {/* Typography Focus */}
            <motion.div
              style={{ y: textY }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1"
            >
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "3rem" }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="mb-6 md:mb-8 hidden md:block"
              ></motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-medium leading-[1.05] tracking-tight text-white mb-6 md:mb-8"
              >
                <TextReveal>Accessible</TextReveal>
                <TextReveal delay={0.1}><span className="text-zinc-500">Transport &</span></TextReveal>
                <TextReveal delay={0.2}>Charters.</TextReveal>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-zinc-400 font-light leading-relaxed max-w-md text-base sm:text-lg md:text-xl mb-8 md:mb-12"
              >
                Melbourne's reliable provider for transport work, corporate event shuttles, civil project crew buses, and professional logistics.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6"
              >
                <MagneticButton href="#contact" className="px-8 py-4 bg-gradient-to-r from-brand-orange to-[#ff8c33] shadow-[inset_0_1px_rgba(255,255,255,0.3),0_4px_20px_rgba(252,108,3,0.3)] text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:shadow-[0_8px_32px_rgba(252,108,3,0.6)] transition-all duration-500 text-center">
                  Book Transport
                </MagneticButton>
                <MagneticButton href="#services" className="px-8 py-4 bg-transparent text-white border border-white/20 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-white/5 hover:border-white/40 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] transition-all duration-500 text-center">
                  Explore Services
                </MagneticButton>
              </motion.div>

              {/* Mobile Quick Nav */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-12 flex md:hidden flex-wrap gap-3"
              >
                {['About', 'Services', 'Standards', 'Clients'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </motion.div>
            </motion.div>

            {/* Striking Visual Element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative h-[40vh] sm:h-[50vh] lg:h-[80vh] w-full rounded-2xl md:rounded-3xl overflow-hidden order-1 lg:order-2 group shadow-2xl"
            >
              <motion.img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2017&auto=format&fit=crop"
                alt="Commuter Transit vehicle for accessible and corporate transport in Melbourne"
                initial={{ scale: 1.1 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[1.5s]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue via-transparent to-transparent lg:hidden"></div>

              {/* Minimalist Floating Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute bottom-4 right-4 md:bottom-8 md:right-8 bg-black/40 backdrop-blur-2xl border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                  <p className="text-white text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">Operating 24/7</p>
                </div>
                <p className="text-zinc-400 text-[8px] sm:text-[9px] md:text-[10px] mt-1 md:mt-2 uppercase tracking-widest pl-3 sm:pl-4 md:pl-6">Melbourne & Interstate</p>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 hidden lg:flex"
        >
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] [writing-mode:vertical-lr] rotate-180">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent"></div>
        </motion.div>
      </section>

      {/* Section Divider Marquee */}
      <div className="bg-brand-blue py-8 sm:py-12 overflow-hidden border-t sm:border-y border-white/5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 sm:gap-12 mx-4 sm:mx-6">
              <span className="text-3xl sm:text-5xl md:text-7xl font-black text-brand-orange uppercase tracking-tighter">Accessible Transport</span>
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-brand-blue-light"></div>
              <span className="text-3xl sm:text-5xl md:text-7xl font-black text-brand-orange uppercase tracking-tighter">Civil Crew Bus Hire</span>
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-brand-blue-light"></div>
              <span className="text-3xl sm:text-5xl md:text-7xl font-black text-brand-orange uppercase tracking-tighter">Corporate Charters</span>
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-brand-blue-light"></div>
            </div>
          ))}
        </div>
      </div>

      {/* About Us Section - Oversized Typographic */}
      <section id="about" data-header-theme="light" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[#fafafa] relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-6 md:mb-12 block"
            >
              01 — The Standard
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl text-brand-blue font-medium leading-[1.3] md:leading-[1.1] tracking-tight md:tracking-tighter"
            >
              Melbourne's most trusted transport provider for <span className="text-brand-orange italic serif">NDIS accessible transport, corporate charters,</span> civil crew buses, and professional removals.
            </motion.h2>
            <div className="mt-12 md:mt-20 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
              <div className="text-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="block text-4xl sm:text-5xl font-medium tracking-tighter text-brand-blue mb-1 md:mb-2"
                >
                  1
                </motion.span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Year in Business</span>
              </div>
              <div className="hidden sm:block w-px h-12 bg-zinc-200"></div>
              <div className="text-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
                  className="block text-4xl sm:text-5xl font-medium tracking-tighter text-brand-blue mb-1 md:mb-2"
                >
                  24/7
                </motion.span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Scalable Solutions</span>
              </div>
              <div className="hidden sm:block w-px h-12 bg-zinc-200"></div>
              <div className="text-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                  className="block text-4xl sm:text-5xl font-medium tracking-tighter text-brand-blue mb-1 md:mb-2"
                >
                  100%
                </motion.span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Safe & Compliant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section - Sticky Editorial Layout */}
      <section id="services" data-header-theme="dark" className="relative bg-brand-blue py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 lg:sticky lg:top-32"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
                <span className="text-xl sm:text-2xl font-black text-brand-orange leading-none tracking-tighter">02</span>
                <div className="h-px w-12 sm:w-24 bg-gradient-to-r from-brand-orange/50 to-transparent"></div>
                <span className="text-[10px] sm:text-xs font-bold text-brand-orange uppercase tracking-[0.3em]">Capabilities</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white tracking-tighter font-medium leading-[0.9] mb-4 sm:mb-6 md:mb-8">
                Intelligent <br />
                <span className="text-brand-orange italic serif">Mobility.</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-white/70 font-light leading-relaxed mb-6 sm:mb-8 md:mb-12 max-w-sm">
                We provide the high-performance fleet layer that Melbourne's most critical operations rely on.
              </p>
              <a href="#contact" className="inline-flex items-center gap-2 sm:gap-3 text-white font-medium text-[10px] sm:text-xs uppercase tracking-widest hover:text-brand-orange transition-colors group">
                Request Service
                <iconify-icon icon="solar:arrow-right-linear" className="group-hover:translate-x-2 transition-transform" width="16"></iconify-icon>
              </a>
            </motion.div>

            <div className="lg:col-span-7 space-y-4 sm:space-y-6 md:space-y-8 mt-8 sm:mt-12 lg:mt-0">
              {[
                { title: "Vehicle Hire Melbourne", desc: "Short and long-term vehicle hire for individuals and businesses across Melbourne.", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop" },
                { title: "Wheelchair Accessible Transport", desc: "Wheelchair-accessible vehicles for individuals and group travel. Safe, compliant transport solutions designed for NDIS and accessibility needs.", img: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=800&auto=format&fit=crop" },
                { title: "Corporate Event Shuttles", desc: "Corporate shuttle services, event transport coordination, airport transfers and professional group movements.", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" },
                { title: "Group Transport", desc: "Private and group tours throughout Melbourne and regional Victoria. Charter transport for organisations, visitors, and events.", img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop" },
                { title: "School Transport", desc: "Reliable school bus services. Group transport including safe airport pickup and drop-off services.", img: "https://images.unsplash.com/photo-1557223562-6c77ef16210f?q=80&w=800&auto=format&fit=crop" },
                { title: "Disruption Support", desc: "Temporary shuttle and replacement transport services during public transport network disruptions.", img: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop" },
                { title: "Melbourne Removalists", desc: "Professional residential and commercial removals within Melbourne and interstate logistics.", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop" },
                { title: "Civil Crew Bus Hire", desc: "Crew bus services designed to meet civil construction and infrastructure project specifications. Safe workforce transport.", img: "https://images.unsplash.com/photo-1581094751227-43b4852bb2f7?q=80&w=800&auto=format&fit=crop" }
              ].map((service, idx) => (
                <motion.div
                  key={idx}
                  tabIndex={0}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative block overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[2rem] bg-white/[0.03] border border-white/10 p-6 sm:p-8 md:p-10 hover:-translate-y-2 focus:-translate-y-2 active:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] focus:shadow-2xl active:shadow-2xl hover:border-brand-orange/40 transition-all duration-500 cursor-pointer outline-none"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100 transition-opacity duration-700">
                    <img src={service.img} alt={service.title} loading="lazy" className="w-full h-full object-cover scale-110 group-hover:scale-100 group-focus:scale-100 group-active:scale-100 transition-transform duration-[1.5s]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-blue via-brand-blue/80 to-transparent backdrop-blur-[1px]"></div>
                  </div>
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 md:gap-8">
                    <div className="flex-1 max-w-lg">
                      <div className="flex items-center gap-3 mb-2 sm:mb-4">
                        <span className="text-[10px] sm:text-xs font-bold text-brand-orange/50 uppercase tracking-[0.2em]">0{idx + 1}</span>
                        <div className="h-px w-8 bg-brand-orange/20"></div>
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-white mb-2 sm:mb-3 md:mb-4 tracking-tight group-hover:translate-x-2 transition-transform duration-500">{service.title}</h3>
                      <p className="text-xs sm:text-sm md:text-base text-zinc-400 font-light leading-relaxed group-hover:translate-x-2 transition-transform duration-500 delay-75">{service.desc}</p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 45 }}
                      whileTap={{ scale: 1.1, rotate: 45 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-brand-orange group-focus:bg-brand-orange group-hover:border-brand-orange group-hover:text-white transition-all duration-500 shrink-0 self-end sm:self-auto"
                    >
                      <iconify-icon icon="solar:arrow-right-up-linear" width="20" className="sm:w-[24px]"></iconify-icon>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Standards & Commitment Section */}
      <section id="standards" data-header-theme="light" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row justify-between items-end mb-12 sm:mb-20 md:mb-24"
          >
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xl sm:text-2xl font-black text-zinc-200 leading-none tracking-tighter">03</span>
                <div className="h-px w-12 sm:w-24 bg-gradient-to-r from-zinc-200 to-transparent"></div>
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">Our Standards</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-brand-blue tracking-tighter font-medium leading-[0.9]">
                Safe, compliant <br />& <span className="text-brand-orange italic serif">dependable.</span>
              </h2>
            </div>
            <div className="mt-8 md:mt-0 max-w-sm">
              <p className="text-sm sm:text-base md:text-lg text-zinc-500 font-light leading-relaxed border-l-2 border-brand-orange/30 pl-6">
                We are committed to delivering safe, compliant, and dependable transport solutions, supported by professional drivers and well-maintained vehicles.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-8 bg-zinc-50 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-16 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 sm:p-8 md:p-12 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <span className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter">01</span>
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center text-brand-blue mb-6 sm:mb-8 md:mb-12 shadow-sm">
                  <iconify-icon icon="solar:shield-user-linear" width="24" className="w-[20px] sm:w-[24px]"></iconify-icon>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-brand-blue mb-3 sm:mb-4 md:mb-6 tracking-tight">Professional Drivers</h3>
                <p className="text-sm sm:text-base md:text-lg text-zinc-500 font-light leading-relaxed max-w-md">
                  Expertly trained professionals prioritizing your safety, comfort, and timely arrivals on every journey.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-4 bg-brand-blue rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-16 relative overflow-hidden group text-white"
            >
              <div className="absolute top-0 right-0 p-6 sm:p-8 md:p-12 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <span className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter text-white">02</span>
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-white/10 flex items-center justify-center text-white mb-6 sm:mb-8 md:mb-12 backdrop-blur-md">
                  <iconify-icon icon="solar:settings-linear" width="24" className="w-[20px] sm:w-[24px]"></iconify-icon>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-white mb-3 sm:mb-4 md:mb-6 tracking-tight mt-auto">Well-Maintained Vehicles</h3>
                <p className="text-sm sm:text-base md:text-lg text-zinc-400 font-light leading-relaxed">
                  A modern, rigorously serviced fleet ensuring reliability, performance, and accessibility for all.
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-12 bg-zinc-100 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-16 relative overflow-hidden group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8 md:gap-12"
            >
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                <iconify-icon icon="solar:heart-bold" width="150" className="w-[100px] sm:w-[200px] md:w-[300px]"></iconify-icon>
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center text-brand-blue shadow-sm">
                    <iconify-icon icon="solar:heart-linear" width="24" className="w-[20px] sm:w-[24px]"></iconify-icon>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg font-black text-brand-blue/20 leading-none tracking-tighter uppercase">03</span>
                    <div className="h-px w-8 bg-brand-blue/10"></div>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-medium text-brand-blue mb-3 sm:mb-4 md:mb-6 tracking-tight">Customer Service Focus</h3>
                <p className="text-sm sm:text-base md:text-xl text-zinc-500 font-light leading-relaxed">
                  Dedicated to seamless experiences, scalable solutions, and dependable support for individuals and enterprises.
                </p>
              </div>
              <div className="relative z-10 shrink-0 self-start md:self-auto mt-4 md:mt-0">
                <a href="#contact" className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-brand-orange text-white flex flex-col items-center justify-center gap-1 md:gap-2 hover:bg-brand-orange-light transition-colors group/btn shadow-xl">
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold">Connect</span>
                  <iconify-icon icon="solar:arrow-right-up-linear" width="16" className="w-[12px] md:w-[20px] group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"></iconify-icon>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sectors We Serve (Clients) Section */}
      <section id="clients" data-header-theme="light" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-zinc-50 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row justify-between items-end mb-12 sm:mb-20 md:mb-24"
          >
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xl sm:text-2xl font-black text-zinc-200 leading-none tracking-tighter">04</span>
                <div className="h-px w-12 sm:w-24 bg-gradient-to-r from-zinc-200 to-transparent"></div>
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">Sectors We Serve</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-brand-blue tracking-tighter font-medium leading-[0.9]">
                Powering Victoria's <br /><span className="text-brand-orange italic serif">Critical Projects.</span>
              </h2>
            </div>
            <div className="mt-8 md:mt-0 max-w-sm">
              <p className="text-sm sm:text-base md:text-lg text-zinc-500 font-light leading-relaxed border-l-2 border-brand-orange/30 pl-6">
                From major civil construction sites to high-stakes corporate movements, we provide the reliable transport backbone for Victoria's most vital sectors.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
            {[
              { name: "Civil Construction", icon: "solar:buildings-linear" },
              { name: "Corporate", icon: "solar:case-linear" },
              { name: "Healthcare", icon: "solar:medical-kit-linear" },
              { name: "Education", icon: "solar:notebook-linear" },
              { name: "Tourism", icon: "solar:camera-linear" },
              { name: "Logistics", icon: "solar:delivery-linear" }
            ].map((sector, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col items-center justify-center p-6 sm:p-8 md:p-10 bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl hover:border-brand-blue hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500 text-center"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-zinc-50 flex items-center justify-center text-brand-blue group-hover:bg-brand-orange group-hover:text-white group-hover:scale-110 transition-all duration-500 mb-4 sm:mb-6">
                  <iconify-icon icon={sector.icon} width="24" className="sm:w-[32px] group-hover:rotate-12 transition-transform duration-500"></iconify-icon>
                </div>
                <h3 className="text-[10px] sm:text-xs md:text-sm font-bold text-brand-blue uppercase tracking-widest leading-tight">{sector.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sleek Testimonials */}
      <TestimonialsSection />

      {/* Luxury Contact Section */}
      <section id="contact" data-header-theme="light" className="bg-[#fafafa] py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-32">
            {/* Left Side: Typography & Info */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col gap-6 mb-12 sm:mb-16 md:mb-20">
                <div className="flex items-center gap-4">
                  <span className="text-xl sm:text-2xl font-black text-zinc-200 leading-none tracking-tighter uppercase">06</span>
                  <div className="h-px w-12 sm:w-24 bg-gradient-to-r from-zinc-200 to-transparent"></div>
                  <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">Connect</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-brand-blue tracking-tighter font-medium leading-[0.9]">
                  Let's coordinate <br />
                  <span className="text-zinc-400 italic serif">your next move.</span>
                </h2>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-zinc-500 font-light leading-relaxed max-w-md mb-8 sm:mb-12 md:mb-16">
                Whether you require immediate executive transport or are planning a large-scale logistical operation, our team is ready to assist.
              </p>

              <div className="space-y-6 sm:space-y-8 md:space-y-10">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 sm:mb-2 md:mb-3">Direct Inquiry</p>
                  <a href="mailto:info@commutertransit.com.au" className="text-base sm:text-lg md:text-2xl font-medium text-brand-blue hover:text-zinc-500 transition-colors break-all">
                    info@commutertransit.com.au
                  </a>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 sm:mb-2 md:mb-3">Concierge Desk</p>
                  <a href="tel:0411099994" className="text-base sm:text-lg md:text-2xl font-medium text-brand-blue hover:text-zinc-500 transition-colors">
                    0411 099 994
                  </a>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 sm:mb-2 md:mb-3">Headquarters</p>
                  <p className="text-xs sm:text-sm md:text-lg text-zinc-600 font-light">
                    8 Langridge Drive<br />
                    Epping VIC 3076
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Side: The Form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-zinc-100">
                {/* Tabs */}
                <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-zinc-100/50 rounded-2xl mb-6 sm:mb-8 md:mb-10">
                  <button
                    onClick={() => setActiveTab('booking')}
                    className={`flex-1 py-3 sm:py-3.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'booking' ? 'bg-white text-brand-blue shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                  >
                    Book Transport
                  </button>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className={`flex-1 py-3 sm:py-3.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'contact' ? 'bg-white text-brand-blue shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                  >
                    General Inquiry
                  </button>
                </div>

                {submitStatus === 'success' && submittedData ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="py-6 sm:py-8 md:py-10"
                  >
                    <div className="text-center mb-8 md:mb-12">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                        className="w-16 h-16 md:w-20 md:h-20 bg-brand-orange text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-zinc-200"
                      >
                        <iconify-icon icon="solar:check-read-linear" width="32" className="md:w-[40px]"></iconify-icon>
                      </motion.div>
                      <h3 className="text-2xl md:text-3xl font-medium text-brand-blue mb-2 tracking-tight">
                        {submittedData.service ? 'Booking Confirmed' : 'Request Received'}
                      </h3>
                      <p className="text-zinc-500 text-sm font-light">Reference: <span className="text-brand-blue font-bold tracking-widest">{bookingReference}</span></p>
                    </div>

                    {submittedData.service && (
                      <div className="bg-zinc-50 rounded-3xl p-6 md:p-8 mb-8 md:mb-12 border border-zinc-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 text-left">
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Pickup</p>
                            <p className="text-sm text-brand-blue font-medium">{submittedData.fromLocation}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Destination</p>
                            <p className="text-sm text-brand-blue font-medium">{submittedData.toLocation}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Date & Time</p>
                            <p className="text-sm text-brand-blue font-medium">{submittedData.pickupDate} at {submittedData.pickupTime}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Service</p>
                            <p className="text-sm text-brand-blue font-medium capitalize">{submittedData.service.replace('-', ' ')}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-left mb-10 md:mb-14">
                      <h4 className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-4">Next Steps</h4>
                      <ul className="space-y-4">
                        {[
                          { icon: "solar:letter-linear", text: "A confirmation email has been sent to your inbox." },
                          { icon: "solar:phone-calling-linear", text: "One of our team members will contact you shortly." },
                          { icon: "solar:user-id-linear", text: "Chauffeur details will be sent to you before pickup (for bookings)." },
                          { icon: "solar:card-2-linear", text: "Payment link will be provided upon trip completion." }
                        ].map((step, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-brand-blue shrink-0">
                              <iconify-icon icon={step.icon} width="16"></iconify-icon>
                            </div>
                            <p className="text-xs md:text-sm text-zinc-500 font-light leading-relaxed">{step.text}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={() => setSubmitStatus('idle')}
                        className="group inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-blue pb-1 hover:text-zinc-500 transition-all duration-300"
                      >
                        <span>Submit Another Request</span>
                        <iconify-icon icon="solar:refresh-linear" width="14" className="group-hover:rotate-180 transition-transform duration-500"></iconify-icon>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-8">
                    {/* Wizard Progress */}
                    {activeTab === 'booking' && (
                      <div className="flex items-center justify-between mb-12">
                        {[1, 2, 3].map((step) => (
                          <div key={step} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${bookingStep >= step ? 'bg-brand-orange text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                              {bookingStep > step ? <iconify-icon icon="solar:check-read-linear" width="14"></iconify-icon> : step}
                            </div>
                            <span className={`text-[8px] uppercase tracking-widest font-bold ${bookingStep >= step ? 'text-brand-blue' : 'text-zinc-400'}`}>
                              {step === 1 ? 'Route' : step === 2 ? 'Schedule' : 'Details'}
                            </span>
                          </div>
                        ))}
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 -z-10 mx-12"></div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                      <AnimatePresence mode="wait">
                        {activeTab === 'booking' ? (
                          <>
                            {bookingStep === 1 && (
                              <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                              >
                                <div className="relative location-input-container">
                                  <input type="text" id="fromLocation" value={formData.fromLocation} onChange={handleInputChange} className={`w-full bg-transparent border-b ${errors.fromLocation ? 'border-red-300' : 'border-zinc-200'} py-4 text-brand-blue placeholder:text-zinc-400 focus:border-brand-blue outline-none transition-colors text-sm`} placeholder="Pickup Location *" />
                                  {fromSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                                      {fromSuggestions.map((s, i) => (
                                        <button key={i} type="button" onClick={() => selectSuggestion('fromLocation', s)} className="w-full text-left px-4 py-3 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0">{s}</button>
                                      ))}
                                    </div>
                                  )}
                                  {errors.fromLocation && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors.fromLocation}</span>}
                                </div>
                                <div className="relative location-input-container">
                                  <input type="text" id="toLocation" value={formData.toLocation} onChange={handleInputChange} className={`w-full bg-transparent border-b ${errors.toLocation ? 'border-red-300' : 'border-zinc-200'} py-4 text-brand-blue placeholder:text-zinc-400 focus:border-brand-blue outline-none transition-colors text-sm`} placeholder="Destination *" />
                                  {toSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                                      {toSuggestions.map((s, i) => (
                                        <button key={i} type="button" onClick={() => selectSuggestion('toLocation', s)} className="w-full text-left px-4 py-3 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0">{s}</button>
                                      ))}
                                    </div>
                                  )}
                                  {errors.toLocation && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors.toLocation}</span>}
                                </div>
                                <div className="relative">
                                  <select id="service" value={formData.service} onChange={handleInputChange} className={`w-full bg-transparent border-b ${errors.service ? 'border-red-300' : 'border-zinc-200'} py-4 text-brand-blue focus:border-brand-blue outline-none transition-colors text-sm appearance-none`}>
                                    <option value="" disabled>Select Service *</option>
                                    <option value="vehicle-hire">Vehicle Hire Melbourne</option>
                                    <option value="accessible">Wheelchair Accessible Transport (NDIS)</option>
                                    <option value="corporate">Corporate Event Shuttle &amp; Airport Transfer</option>
                                    <option value="tour">Tour &amp; Charter Bus Melbourne</option>
                                    <option value="school">School &amp; Group Transport</option>
                                    <option value="disruption">Transport Disruption Support</option>
                                    <option value="removal">Melbourne Removalists &amp; Logistics</option>
                                    <option value="civil">Civil Crew Bus Hire</option>
                                  </select>
                                  {errors.service && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors.service}</span>}
                                </div>
                                <button type="button" onClick={nextStep} className="w-full py-4 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-orange-light transition-colors flex items-center justify-center gap-2">
                                  Next Step <iconify-icon icon="solar:arrow-right-linear" width="16"></iconify-icon>
                                </button>
                              </motion.div>
                            )}

                            {bookingStep === 2 && (
                              <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                              >
                                <div className="relative">
                                  <input type="date" id="pickupDate" value={formData.pickupDate} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} className={`w-full bg-transparent border-b ${errors.pickupDate ? 'border-red-300' : 'border-zinc-200'} py-4 text-brand-blue focus:border-brand-blue outline-none transition-colors text-sm`} />
                                  <span className="absolute -top-4 left-0 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pickup Date *</span>
                                  {errors.pickupDate && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors.pickupDate}</span>}
                                </div>
                                <div className="relative">
                                  <input type="time" id="pickupTime" value={formData.pickupTime} onChange={handleInputChange} className={`w-full bg-transparent border-b ${errors.pickupTime ? 'border-red-300' : 'border-zinc-200'} py-4 text-brand-blue focus:border-brand-blue outline-none transition-colors text-sm`} />
                                  <span className="absolute -top-4 left-0 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pickup Time *</span>
                                  {errors.pickupTime && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors.pickupTime}</span>}
                                </div>
                                <div className="flex gap-4">
                                  <button type="button" onClick={prevStep} className="flex-1 py-4 border border-zinc-200 text-brand-blue text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-50 transition-colors">Back</button>
                                  <button type="button" onClick={nextStep} className="flex-1 py-4 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-orange-light transition-colors">Next Step</button>
                                </div>
                              </motion.div>
                            )}

                            {bookingStep === 3 && (
                              <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                              >
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="relative">
                                    <input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} className={`w-full bg-transparent border-b ${errors.fullName ? 'border-red-300' : 'border-zinc-200'} py-4 text-brand-blue placeholder:text-zinc-400 focus:border-brand-blue outline-none transition-colors text-sm`} placeholder="Full Name *" />
                                    {errors.fullName && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors.fullName}</span>}
                                  </div>
                                  <div className="relative">
                                    <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} className={`w-full bg-transparent border-b ${errors.phone ? 'border-red-300' : 'border-zinc-200'} py-4 text-brand-blue placeholder:text-zinc-400 focus:border-brand-blue outline-none transition-colors text-sm`} placeholder="Phone *" />
                                    {errors.phone && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors.phone}</span>}
                                  </div>
                                </div>
                                <div className="relative">
                                  <input type="email" id="email" value={formData.email} onChange={handleInputChange} className={`w-full bg-transparent border-b ${errors.email ? 'border-red-300' : 'border-zinc-200'} py-4 text-brand-blue placeholder:text-zinc-400 focus:border-brand-blue outline-none transition-colors text-sm`} placeholder="Email Address *" />
                                  {errors.email && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors.email}</span>}
                                </div>
                                <div className="relative">
                                  <textarea id="message" value={formData.message} onChange={handleInputChange} rows={2} className="w-full bg-transparent border-b border-zinc-200 py-4 text-brand-blue placeholder:text-zinc-400 focus:border-brand-blue outline-none transition-colors text-sm resize-none" placeholder="Special Requirements (Optional)"></textarea>
                                </div>
                                <div className="flex gap-4">
                                  <button type="button" onClick={prevStep} className="flex-1 py-4 border border-zinc-200 text-brand-blue text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-50 transition-colors">Back</button>
                                  <button type="submit" disabled={submitStatus === 'loading'} className="flex-1 py-4 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-orange-light transition-colors disabled:opacity-50">
                                    {submitStatus === 'loading' ? 'Processing...' : (formData.service && servicesAvailability[formData.service] === false ? 'Call Us' : 'Book')}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </>
                        ) : (
                          <motion.div
                            key="contact"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                          >
                            <div className="relative">
                              <input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} className={`w-full bg-transparent border-b ${errors.fullName ? 'border-red-300' : 'border-zinc-200'} py-4 text-brand-blue placeholder:text-zinc-400 focus:border-brand-blue outline-none transition-colors text-sm`} placeholder="Full Name *" />
                              {errors.fullName && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors.fullName}</span>}
                            </div>
                            <div className="relative">
                              <input type="email" id="email" value={formData.email} onChange={handleInputChange} className={`w-full bg-transparent border-b ${errors.email ? 'border-red-300' : 'border-zinc-200'} py-4 text-brand-blue placeholder:text-zinc-400 focus:border-brand-blue outline-none transition-colors text-sm`} placeholder="Email Address *" />
                              {errors.email && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors.email}</span>}
                            </div>
                            <div className="relative">
                              <textarea id="message" value={formData.message} onChange={handleInputChange} rows={4} className={`w-full bg-transparent border-b ${errors.message ? 'border-red-300' : 'border-zinc-200'} py-4 text-brand-blue placeholder:text-zinc-400 focus:border-brand-blue outline-none transition-colors text-sm resize-none`} placeholder="How can we help you? *"></textarea>
                              {errors.message && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{errors.message}</span>}
                            </div>
                            <button type="submit" disabled={submitStatus === 'loading'} className="w-full py-4 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-orange-light transition-colors disabled:opacity-50">
                              {submitStatus === 'loading' ? 'Sending...' : 'Send Message'}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Monumental Minimal Footer */}
      <Footer />
    </>
  );
}


function ScrollToTop() {
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsVisible(latest > 500);
    });
  }, [scrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Scroll to top"
        >
          <iconify-icon icon="solar:arrow-up-linear" width="24"></iconify-icon>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
