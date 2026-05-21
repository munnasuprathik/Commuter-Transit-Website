/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, FormEvent } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import Fuse from 'fuse.js';
import './types.d.ts';
import { FleetSection } from './components/blocks/fleet';
import { Footer } from './components/blocks/footer';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { ServicePage } from './pages/services/ServicePage';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerTheme, setHeaderTheme] = useState<'light' | 'dark'>('light');

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
    'chauffeur': true,
    'accessible': true,
    'airport': true,
    'corporate': true,
    'logistics': true,
    'disruption': true,
    'vehicle-hire': true
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

        toast.success(
          activeTab === 'booking' ? 'Booking confirmed' : 'Message received',
          {
            description: activeTab === 'booking'
              ? `Reference ${reference}. Our team will contact you shortly.`
              : 'A team member will respond within 24 hours.',
            duration: 6000,
          }
        );

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
        toast.error('Submission failed', {
          description: 'Please check your connection and try again, or call 0411 099 994.',
          duration: 7000,
          action: {
            label: 'Call us',
            onClick: () => { window.location.href = 'tel:0411099994'; },
          },
        });
      }
    } else {
      const count = Object.keys(newErrors).length;
      toast.error(`${count} field${count > 1 ? 's' : ''} need attention`, {
        description: 'Highlighted fields below require correction.',
        duration: 4000,
      });
      const firstErrorId = Object.keys(newErrors)[0];
      document.getElementById(firstErrorId)?.focus();
      document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    let scrollRaf = 0;
    const handleScroll = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
        scrollRaf = 0;
      });
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
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', handleScroll);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
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
        className={`absolute top-0 inset-x-0 z-50 transition-[padding] duration-300 ${isScrolled
          ? 'py-4 px-4 md:px-8'
          : 'p-4 md:p-8'
          } flex justify-between items-center pointer-events-none`}
      >

        {/* Left: Logo */}
        <motion.a
          href="/"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="pointer-events-auto group flex items-center justify-center transition-all duration-500"
        >
          <div className="h-20 md:h-28 flex items-center justify-center">
            <img
              src={headerTheme === 'dark' ? "/images/CT LOGO WHITE.png" : "/images/CT LOGO.png"}
              alt="Commuter Transit Logo"
              className="h-full w-auto object-contain transition-all duration-500"
            />
          </div>
        </motion.a>

        {/* Center: Magnetic Nav (Desktop) */}
        <nav className={`pointer-events-auto hidden md:flex items-center p-1.5 backdrop-blur-xl border rounded-full transition-all duration-500 shadow-lg ${headerTheme === 'dark'
            ? 'bg-black/20 border-white/10'
            : 'bg-zinc-100/80 border-black/5'
          }`}>
          {[
            { label: 'Services', href: '#services' },
            { label: 'Fleet', href: '#fleet' },
            { label: 'Corporate', href: '#corporate' },
            { label: 'Compliance', href: '#standards' },
            { label: 'Contact', href: '#contact' },
          ].map((item, idx) => (
            <motion.a
              key={item.label}
              href={item.href}
              onMouseEnter={() => setHoveredNav(item.label)}
              onMouseLeave={() => setHoveredNav(null)}
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={`relative px-6 py-2.5 text-[10px] font-bold transition-all duration-300 tracking-[0.2em] uppercase ${headerTheme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-brand-blue'
                }`}
            >
              {hoveredNav === item.label && (
                <motion.div
                  layoutId="nav-pill"
                  className={`absolute inset-0 rounded-full ${headerTheme === 'dark' ? 'bg-white/10' : 'bg-brand-blue/5'
                    }`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </motion.a>
          ))}
        </nav>

        {/* Right: CTA & Status */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className={`hidden lg:flex items-center gap-2 backdrop-blur-xl border rounded-full px-4 py-2.5 transition-all duration-500 shadow-lg ${headerTheme === 'dark'
              ? 'bg-black/20 border-white/10'
              : 'bg-zinc-100/80 border-black/5'
            }`}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
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
            className="fixed inset-0 z-40 bg-brand-blue pt-24 px-6 pb-6 flex flex-col"
          >
            <nav className="flex flex-col gap-8 text-center mt-12">
              {[
                { label: 'Services', href: '#services' },
                { label: 'Fleet', href: '#fleet' },
                { label: 'Corporate', href: '#corporate' },
                { label: 'Compliance', href: '#standards' },
                { label: 'Contact', href: '#contact' },
              ].map((item, idx) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.5 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-3xl font-medium text-zinc-300 hover:text-white transition-colors tracking-widest uppercase"
                >
                  {item.label}
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
      <section id="hero" data-header-theme="dark" className="relative min-h-[100svh] flex items-center bg-brand-blue overflow-hidden pt-28 md:pt-36 pb-20 md:pb-28">
        {/* Minimalist Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-blue-light/20 to-transparent pointer-events-none"></div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center">

            {/* Typography Focus */}
            <motion.div
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
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] font-medium leading-[1.1] tracking-tight text-white mb-6 md:mb-8"
              >
                <TextReveal>Specialist Transport</TextReveal>
                <TextReveal delay={0.1}><span className="text-zinc-500">& Mobility Solutions</span></TextReveal>
                <TextReveal delay={0.2}>Across Australia.</TextReveal>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-zinc-400 font-light leading-relaxed max-w-md text-base sm:text-lg md:text-xl mb-8 md:mb-12"
              >
                Premium chauffeur services, wheelchair accessible transport, airport transfers, corporate mobility, logistics transport, rail replacement services and fleet hire — trusted by individuals, businesses and infrastructure partners across Australia.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6"
              >
                <MagneticButton href="#contact" onClick={() => setActiveTab('booking')} className="px-10 py-4 bg-brand-orange text-white text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em] rounded-full hover:bg-brand-orange-light transition-colors duration-500 text-center">
                  Book Transport
                </MagneticButton>
                <MagneticButton href="#contact" onClick={() => setActiveTab('contact')} className="px-10 py-4 bg-transparent text-white border border-white/25 text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em] rounded-full hover:bg-white hover:text-brand-blue hover:border-white transition-all duration-500 text-center">
                  Request Corporate Quote
                </MagneticButton>
              </motion.div>

              {/* Hero Booking Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 md:mt-14 max-w-2xl"
              >
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row gap-2 sm:items-center">
                  <input
                    type="text"
                    name="fromLocation"
                    aria-label="Pickup location"
                    value={formData.fromLocation}
                    onChange={handleInputChange}
                    placeholder="Pickup"
                    className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
                  />
                  <span aria-hidden="true" className="hidden sm:block w-px h-6 bg-white/10"></span>
                  <input
                    type="text"
                    name="toLocation"
                    aria-label="Destination"
                    value={formData.toLocation}
                    onChange={handleInputChange}
                    placeholder="Destination"
                    className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
                  />
                  <span aria-hidden="true" className="hidden sm:block w-px h-6 bg-white/10"></span>
                  <select
                    name="service"
                    aria-label="Service type"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm text-white focus:outline-none cursor-pointer [&>option]:bg-brand-blue"
                  >
                    <option value="">Service type</option>
                    <option value="chauffeur">Chauffeur Services</option>
                    <option value="accessible">Wheelchair Accessible</option>
                    <option value="airport">Airport Transfers</option>
                    <option value="corporate">Event &amp; Corporate</option>
                    <option value="logistics">Logistics</option>
                    <option value="disruption">Public Disruption</option>
                    <option value="vehicle-hire">Vehicle Hire</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('booking');
                      setBookingStep(1);
                      const target = document.getElementById('contact');
                      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      window.setTimeout(() => {
                        const focusId = !formData.fromLocation.trim()
                          ? 'fromLocation'
                          : !formData.toLocation.trim()
                            ? 'toLocation'
                            : 'fromLocation';
                        const el = document.getElementById(focusId) as HTMLInputElement | null;
                        if (el) el.focus({ preventScroll: true });
                      }, 600);
                    }}
                    className="shrink-0 bg-brand-orange hover:bg-brand-orange-light text-white px-6 py-3 rounded-xl text-[11px] font-medium uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
                  >
                    Get Quote
                    <iconify-icon icon="solar:arrow-right-linear" width="14"></iconify-icon>
                  </button>
                </div>
              </motion.div>


            </motion.div>

            {/* Striking Visual Element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative h-[40vh] sm:h-[50vh] lg:h-[80vh] w-full rounded-2xl md:rounded-3xl overflow-hidden order-1 lg:order-2 group shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2017&auto=format&fit=crop"
                alt="Commuter Transit vehicle for accessible and corporate transport in Melbourne"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/80 via-brand-blue/10 to-transparent"></div>

              {/* Minimalist Floating Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute bottom-4 right-4 md:bottom-8 md:right-8 bg-black/40 backdrop-blur-2xl border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-white text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">Operating 24/7</p>
                </div>
                <p className="text-zinc-400 text-[8px] sm:text-[9px] md:text-[10px] mt-1 md:mt-2 uppercase tracking-widest pl-3 sm:pl-4 md:pl-6">Melbourne & Interstate</p>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Layered curved transition — hero → about */}
        <div className="absolute -bottom-px left-0 right-0 pointer-events-none z-20" aria-hidden="true">
          {/* Back layer — subtle depth wave */}
          <svg
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 right-0 w-full h-[90px] sm:h-[120px] md:h-[170px] block"
          >
            <path
              d="M0,80 C200,140 420,160 720,120 C1020,80 1240,40 1440,90 L1440,161 L0,161 Z"
              fill="#0149AF"
              opacity="0.35"
            />
          </svg>
          {/* Front layer — final fafafa curve */}
          <svg
            viewBox="0 0 1440 130"
            preserveAspectRatio="none"
            className="relative w-full h-[80px] sm:h-[110px] md:h-[150px] block"
          >
            <path
              d="M0,30 C260,130 500,150 760,110 C1020,70 1240,40 1440,95 L1440,131 L0,131 Z"
              fill="#fafafa"
            />
          </svg>
        </div>
      </section>


      {/* About Us Section - Oversized Typographic */}
      <section id="about" data-header-theme="light" className="pt-8 md:pt-12 pb-16 md:pb-24 bg-[#fafafa] relative overflow-hidden">
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
              Australia's trusted partner for <span className="text-brand-orange italic font-serif">chauffeur services, accessible transport, corporate mobility</span> and rail replacement transport.
            </motion.h2>
          </motion.div>
        </div>
      </section>

      {/* Services Section - Sticky Editorial Layout */}
      <section id="services" data-header-theme="dark" className="relative bg-brand-blue py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 lg:sticky lg:top-32"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-brand-orange"></span>
                <span className="text-[10px] sm:text-xs font-bold text-brand-orange uppercase tracking-[0.3em]">Service Overview</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-medium tracking-tight leading-[1.1] mb-5">
                Specialist transport <span className="italic font-serif text-brand-orange">solutions across Australia.</span>
              </h2>
              <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed max-w-md mb-8 sm:mb-10">
                Premium chauffeur, accessible transport, airport transfers, logistics, public disruption transport and fleet hire — for passengers, businesses and infrastructure partners.
              </p>
              <a href="#contact" className="inline-flex items-center gap-2 sm:gap-3 text-white font-medium text-[10px] sm:text-xs uppercase tracking-widest hover:text-brand-orange transition-colors group">
                Request Service
                <iconify-icon icon="solar:arrow-right-linear" className="group-hover:translate-x-2 transition-transform" width="16"></iconify-icon>
              </a>
            </motion.div>

            <div className="lg:col-span-7 space-y-4 sm:space-y-6 md:space-y-8 mt-8 sm:mt-12 lg:mt-0">
              {[
                { title: "Chauffeur Services", desc: "Premium executive transport for business leaders, private clients, VIP guests, weddings and professional travel with experienced chauffeurs and luxury vehicles.", slug: "chauffeur" },
                { title: "Wheelchair Accessible Transport", desc: "Safe, dignity-first transport with wheelchair-accessible vehicles, trained drivers and inclusive travel support for healthcare, aged care, NDIS and assisted mobility journeys.", slug: "wheelchair-accessible" },
                { title: "Airport Transfers", desc: "Reliable airport transport with flight monitoring, meet & greet services, luggage support and fixed-fare private transfers for individuals and groups.", slug: "airport-transfers" },
                { title: "Event & Corporate Transport", desc: "Scalable transport solutions for conferences, workforce movement, executive travel, event logistics and guest transport coordination.", slug: "event-corporate" },
                { title: "Logistics Transport", desc: "Flexible commercial transport for documents, parcels, scheduled business deliveries and time-sensitive logistics support.", slug: "logistics" },
                { title: "Public Disruption Transport", desc: "Rapid-response transport solutions for rail replacement services, infrastructure works, emergency movement, event overflow transport and public network disruption support. Our flexible fleet and trained operators can support transport authorities, contractors and government agencies during planned or unexpected service interruptions.", slug: "rail-replacement" },
                { title: "Vehicle Hire", desc: "Flexible vehicle hire solutions ranging from executive sedans and SUVs to accessible vans, minibuses and specialist transport fleet options.", slug: "vehicle-hire" }
              ].map((service, idx) => (
                <motion.a
                  key={idx}
                  href={`/services/${service.slug}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative block overflow-hidden rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/10 p-6 sm:p-8 md:p-10 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 cursor-pointer outline-none"
                >
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 md:gap-8">
                    <div className="flex-1 max-w-lg">
                      <div className="flex items-center gap-3 mb-2 sm:mb-4">
                        <span className="text-[10px] sm:text-xs font-bold text-brand-orange/50 uppercase tracking-[0.2em]">0{idx + 1}</span>
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
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Snapshot (PDF Section 3) */}
      <div data-header-theme="light">
        <FleetSection />
      </div>

      {/* Standards & Commitment Section */}
      <section id="standards" data-header-theme="light" className="pt-4 pb-16 md:pt-6 md:pb-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 md:mb-14"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-brand-orange"></span>
              <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">Compliance & Safety</span>
            </div>
            <div className="max-w-3xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-brand-blue font-medium tracking-tight leading-[1.1]">
                Built on trust. <span className="italic font-serif text-brand-orange">Backed by standards.</span>
              </h2>
              <p className="mt-4 text-sm sm:text-base text-zinc-500 font-light leading-relaxed max-w-2xl">
                Accredited operations, insured fleet, trained drivers and inclusive service — ready for corporate and government contracts.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: "Licensed & Accredited", desc: "Commercial transport compliance.", icon: "solar:shield-check-linear", dark: false },
              { title: "Fully Insured Fleet", desc: "Passenger and commercial protection.", icon: "solar:shield-user-linear", dark: true },
              { title: "Safety Compliant Vehicles", desc: "Regularly maintained fleet.", icon: "solar:settings-linear", dark: false },
              { title: "Professional Drivers", desc: "Background checked and trained.", icon: "solar:user-id-linear", dark: false },
              { title: "Accessibility Ready", desc: "Inclusive transport support.", icon: "solar:hand-heart-linear", dark: true },
              { title: "Contract Ready", desc: "Corporate and government partnerships.", icon: "solar:document-text-linear", dark: false },
            ].map((b, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 relative group transition-colors duration-500 ${b.dark ? 'bg-brand-blue text-white hover:bg-[#03316f]' : 'bg-zinc-50 text-brand-blue hover:bg-zinc-100'}`}
              >
                <div className="relative z-10">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-6 sm:mb-8 ${b.dark ? 'bg-white/10 text-white' : 'bg-white text-brand-blue shadow-sm'}`}>
                    <iconify-icon icon={b.icon} width="22"></iconify-icon>
                  </div>
                  <h3 className={`text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 tracking-tight ${b.dark ? 'text-white' : 'text-brand-blue'}`}>{b.title}</h3>
                  <p className={`text-sm sm:text-base font-light leading-relaxed ${b.dark ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {b.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Corporate & Government Solutions (PDF Section 4) */}
      <section id="corporate" data-header-theme="dark" className="py-16 md:py-24 bg-brand-blue text-white relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 md:mb-14"
          >
            <span className="text-[10px] sm:text-xs font-bold text-brand-orange uppercase tracking-[0.3em]">Corporate & Government Solutions</span>
          </motion.div>

          {/* Capability tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-12 md:mb-16">
            {[
              { title: "Workforce Transport" },
              { title: "Rail Replacement" },
              { title: "Contract Fleet" },
              { title: "Infrastructure Support" },
              { title: "Event Transport" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="p-5 sm:p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.06] hover:border-white/20 transition-colors duration-500"
              >
                <h3 className="text-base sm:text-lg font-medium text-white tracking-tight">{item.title}</h3>
              </motion.div>
            ))}
          </div>

          {/* Descriptive content blocks (PDF page 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12 md:mb-16">
            {[
              {
                title: 'Public Disruption',
                body: 'We deliver rapid-response transport solutions for rail replacement services, planned infrastructure works, emergency passenger movement and network disruption support across Australia.',
              },
              {
                title: 'Corporate',
                body: 'Scalable mobility solutions for workforce transport, executive travel, infrastructure support, healthcare movement and long-term transport contracts.',
              },
              {
                title: 'Accessibility',
                body: 'Inclusive transport built around safety, dignity and independence with specialist vehicles and trained drivers.',
              },
            ].map((b, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="p-6 sm:p-8 bg-white/[0.03] border border-white/10 rounded-2xl sm:rounded-3xl"
              >
                <h3 className="text-lg sm:text-xl font-medium text-white mb-3 tracking-tight">{b.title}</h3>
                <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">{b.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Government & Infrastructure block (PDF page 3) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="border-t border-white/10 pt-12 md:pt-16"
          >
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
              <div className="lg:col-span-5">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight leading-[1.15]">
                  Government & Infrastructure <span className="italic font-serif text-brand-orange">Transport Solutions</span>
                </h3>
              </div>
              <div className="lg:col-span-7">
                <p className="text-sm sm:text-base md:text-lg text-white/70 font-light leading-relaxed mb-8">
                  We partner with transport operators, event organisers, infrastructure contractors, healthcare providers and businesses to deliver scalable mobility solutions.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    'Rail replacement transport',
                    'Emergency transport deployment',
                    'Workforce mobility',
                    'Accessible public transport support',
                    'Infrastructure project transport',
                    'Contract fleet operations',
                  ].map((cap) => (
                    <li key={cap} className="flex items-center gap-3 text-sm sm:text-base text-white/85">
                      <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0"></span>
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us (PDF Section 6) */}
      <section id="why-us" data-header-theme="light" className="py-16 md:py-24 bg-[#fafafa] relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-brand-orange"></span>
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">Why Choose Us</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-brand-blue font-medium tracking-tight leading-[1.1]">
                Specialist transport. <span className="italic font-serif text-brand-orange">Built for scale.</span>
              </h2>
              <p className="mt-5 text-sm sm:text-base text-zinc-500 font-light leading-relaxed">
                Trusted transport contractor across Australia for corporate, government, healthcare and infrastructure partners.
              </p>
            </motion.div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { title: '24/7 Availability', desc: 'Round-the-clock dispatch for planned and emergency transport.' },
                { title: 'Flexible Fleet', desc: 'Sedans to mini buses scaled to job requirements.' },
                { title: 'Rapid Deployment', desc: 'Fast mobilisation for rail replacement and disruption work.' },
                { title: 'Transport Specialists', desc: 'Trained operators across accessible, corporate and logistics transport.' },
                { title: 'Customer-First Support', desc: 'Direct account contact for contracts and recurring bookings.' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.06 }}
                  className="bg-white border border-zinc-100 rounded-2xl p-5 sm:p-6 hover:border-brand-orange/40 hover:shadow-sm transition-all duration-300"
                >
                  <span className="text-[10px] font-bold text-brand-orange tracking-[0.25em] tabular-nums">0{idx + 1}</span>
                  <h3 className="mt-3 text-base sm:text-lg font-medium text-brand-blue tracking-tight">{item.title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 font-light leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sectors Served Strip */}
      <section data-header-theme="dark" className="bg-brand-blue text-white py-14 md:py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-brand-orange"></span>
                <span className="text-[10px] sm:text-xs font-bold text-brand-orange uppercase tracking-[0.3em]">Sectors We Serve</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-[1.1]">
                Transport partner for <span className="italic font-serif text-brand-orange">operators, contractors, government.</span>
              </h2>
              <p className="mt-5 text-sm sm:text-base text-white/60 font-light leading-relaxed max-w-xl">
                Rail replacement transport, accessible mobility, corporate fleet and infrastructure project transport — delivered across Melbourne, Sydney, Brisbane, Perth and Adelaide.
              </p>
            </motion.div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Transport Authorities', icon: 'solar:tram-linear' },
                { label: 'Infrastructure Contractors', icon: 'solar:buildings-2-linear' },
                { label: 'Government Agencies', icon: 'solar:shield-keyhole-linear' },
                { label: 'Healthcare & NDIS', icon: 'solar:health-linear' },
                { label: 'Corporate & Events', icon: 'solar:case-linear' },
                { label: 'Aged Care Providers', icon: 'solar:users-group-rounded-linear' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/[0.06] hover:border-brand-orange/30 transition-all duration-300"
                >
                  <iconify-icon icon={s.icon} width="22" class-name="text-brand-orange"></iconify-icon>
                  <p className="mt-3 text-xs sm:text-sm font-medium text-white tracking-tight">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Contact Section */}
      <section id="contact" data-header-theme="light" className="bg-[#fafafa] py-16 md:py-24 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-32">
            {/* Left Side: Typography & Info */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-10 md:mb-14">
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-[0.3em]">CTA / Contact</span>
              </div>

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

                    <form onSubmit={handleSubmit} className={`space-y-8 relative transition-opacity ${submitStatus === 'loading' ? 'pointer-events-none opacity-60' : ''}`}>
                      {submitStatus === 'loading' && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-xl">
                          <div className="flex flex-col items-center gap-3">
                            <svg className="animate-spin h-8 w-8 text-brand-orange" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
                              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            <span className="text-[10px] font-medium text-brand-blue uppercase tracking-[0.2em]">{activeTab === 'booking' ? 'Confirming booking' : 'Sending message'}</span>
                          </div>
                        </div>
                      )}
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
                                <ServiceSelect
                                  value={formData.service}
                                  error={errors.service}
                                  onChange={(val) => setFormData({ ...formData, service: val })}
                                />
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-6">
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
                                  <button type="submit" disabled={submitStatus === 'loading'} className="flex-1 py-4 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-orange-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submitStatus === 'loading' && (
                                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" /><path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                                    )}
                                    {submitStatus === 'loading' ? 'Confirming' : (formData.service && servicesAvailability[formData.service] === false ? 'Call Us' : 'Book')}
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
                            <button type="submit" disabled={submitStatus === 'loading'} className="w-full py-4 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-orange-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                              {submitStatus === 'loading' && (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" /><path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                              )}
                              {submitStatus === 'loading' ? 'Sending' : 'Send Message'}
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
          className="hidden md:flex fixed bottom-6 right-6 z-40 w-12 h-12 bg-white text-black rounded-full shadow-xl items-center justify-center hover:scale-110 transition-transform"
          aria-label="Scroll to top"
        >
          <iconify-icon icon="solar:arrow-up-linear" width="24"></iconify-icon>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: 'chauffeur', label: 'Chauffeur Services' },
  { value: 'accessible', label: 'Wheelchair Accessible Transport' },
  { value: 'airport', label: 'Airport Transfers' },
  { value: 'corporate', label: 'Event & Corporate Transport' },
  { value: 'logistics', label: 'Logistics Transport' },
  { value: 'disruption', label: 'Public Disruption / Rail Replacement' },
  { value: 'vehicle-hire', label: 'Vehicle Hire' },
];

function ServiceSelect({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = SERVICE_OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" id="service">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full bg-transparent border-b ${error ? 'border-red-300' : open ? 'border-brand-blue' : 'border-zinc-200'} py-4 text-left flex items-center justify-between transition-colors`}
      >
        <span className={`text-sm ${selected ? 'text-brand-blue' : 'text-zinc-400'}`}>
          {selected ? selected.label : 'Select Service *'}
        </span>
        <iconify-icon
          icon="solar:alt-arrow-down-linear"
          width="16"
          class-name={`text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
        ></iconify-icon>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-zinc-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden max-h-72 overflow-y-auto"
          >
            {SERVICE_OPTIONS.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={`w-full text-left px-5 py-3.5 text-sm flex items-center justify-between gap-3 transition-colors ${active ? 'bg-brand-blue/[0.04] text-brand-blue' : 'text-zinc-700 hover:bg-zinc-50 hover:text-brand-blue'}`}
                  >
                    <span className="flex-1">{opt.label}</span>
                    {active && (
                      <iconify-icon icon="solar:check-circle-bold" width="18" class-name="text-brand-orange"></iconify-icon>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
      {error && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{error}</span>}
    </div>
  );
}

function QuickContact() {
  const phone = '0411099994';
  const wa = '61411099994';
  return (
    <div className="hidden md:flex fixed bottom-6 left-6 z-40 flex-col gap-3">
      <a
        href={`https://wa.me/${wa}?text=${encodeURIComponent("Hi, I'd like to enquire about transport.")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group w-12 h-12 rounded-full bg-white text-[#25D366] border border-zinc-200 flex items-center justify-center shadow-md hover:shadow-lg hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all duration-300"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.15-.174.2-.298.299-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/>
        </svg>
      </a>
      <a
        href={`tel:${phone}`}
        aria-label="Call us"
        className="group w-12 h-12 rounded-full bg-white text-brand-blue border border-zinc-200 flex items-center justify-center shadow-md hover:shadow-lg hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all duration-300"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      </a>
    </div>
  );
}

function StickyMobileBook() {
  const [show, setShow] = useState(false);
  const phone = '0411099994';
  const wa = '61411099994';
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        const contact = document.getElementById('contact');
        const past = window.scrollY > 600;
        const inContact = contact ? contact.getBoundingClientRect().top < window.innerHeight - 100 : false;
        setShow(past && !inContact);
        raf = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-brand-blue border-t border-white/10 px-3 py-3 flex items-center gap-2 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.4)]"
        >
          <a
            href={`tel:${phone}`}
            aria-label="Call"
            className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 active:bg-white/20"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </a>
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent("Hi, I'd like to enquire about transport.")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 active:bg-[#1ebe5d]"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.15-.174.2-.298.299-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/>
            </svg>
          </a>
          <a
            href="#contact"
            className="flex-1 h-12 bg-brand-orange hover:bg-brand-orange-light text-white rounded-full flex items-center justify-center gap-2 transition-colors"
          >
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Book Transport</span>
            <iconify-icon icon="solar:arrow-right-up-linear" width="16"></iconify-icon>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AcknowledgementPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('ct_aok_dismissed')) return;
    const t = window.setTimeout(() => setIsOpen(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const dismiss = () => {
    sessionStorage.setItem('ct_aok_dismissed', '1');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={dismiss}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Acknowledgement of Country"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[640px] rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur text-white flex items-center justify-center transition-colors"
            >
              <iconify-icon icon="solar:close-circle-linear" width="22"></iconify-icon>
            </button>
            <img
              src="/images/pop-up.jpeg"
              alt="Acknowledgement of Country — We acknowledge Aboriginal and Torres Strait Islander peoples as the Traditional Custodians of the land on which we operate, and we pay respect to their Elders past, present and emerging."
              className="block w-full h-auto"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: '#02285E',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontFamily: 'Outfit, sans-serif',
          },
        }}
      />
      <ScrollToTop />
      <QuickContact />
      <StickyMobileBook />
      <AcknowledgementPopup />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
