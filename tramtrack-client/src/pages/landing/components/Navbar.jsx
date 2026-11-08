import React, { useState, useEffect } from 'react';
import { Menu, X, ShieldAlert, LogIn, ChevronRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Hệ sinh thái', href: '/ecosystem' },
  { label: 'Đội ngũ', href: '/team' },
  { label: 'Tin tức', href: '/news' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('popstate', handlePopState);
    
    // Initial check
    handleScroll();
    
    return () => { 
      window.removeEventListener('scroll', handleScroll); 
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = (e, href) => {
    if (href && href.startsWith('/')) {
      e.preventDefault();
      window.history.pushState({}, '', href);
      window.dispatchEvent(new Event('popstate'));
      setMobileOpen(false);
    }
  };

  return (
    <>
      <nav 
        className={`fixed inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-7xl z-50 flex items-center justify-between transition-all duration-500 rounded-full
          ${scrolled 
            ? 'top-4 px-4 lg:px-6 py-3 backdrop-blur-2xl bg-white/90 border border-[#135E3E]/10 shadow-[0_20px_40px_rgba(10,26,18,0.08)]' 
            : 'top-6 px-4 lg:px-6 py-4 backdrop-blur-md bg-white/50 border border-transparent shadow-none'
          }`}
      >
        
        {/* ─── Left: Brand & Logo ─── */}
        <a href="/" onClick={(e) => handleNavClick(e, '/')} className="group flex items-center gap-2 sm:gap-3 no-underline shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-[#9E7B3B] blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
            <img
              src="/assets/botanical/logo-icon.png"
              alt="TramTrack Logo"
              className="relative h-[32px] sm:h-[40px] w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[16px] sm:text-[20px] font-extrabold tracking-widest leading-none flex items-center">
              <span className="text-[#26442E]">TRAM</span>
              <span className="text-[#9C7D4D]">TRACK</span>
            </div>
          </div>
        </a>

        {/* ─── Center: Navigation Links ─── */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative px-4 py-2 rounded-full font-['Be_Vietnam_Pro'] text-xs tracking-wider uppercase font-bold transition-all duration-300 no-underline
                  ${isActive 
                    ? 'text-[#135E3E] bg-[#135E3E]/5' 
                    : 'text-[#0A1A12]/60 hover:text-[#135E3E] hover:bg-[#135E3E]/5'
                  }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#9E7B3B] rounded-full" />
                )}
              </a>
            );
          })}
        </div>

        {/* ─── Right: Utilities & CTA ─── */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          
          {/* Report Fake Button (Hidden on Mobile) */}
          <button
            onClick={(e) => handleNavClick(e, '/report-fraud')}
            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-rose-500/20 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 text-xs font-bold transition-all duration-300 shadow-sm group"
            title="Báo cáo hàng nghi giả"
          >
            <ShieldAlert size={14} className="group-hover:animate-bounce" />
            <span className="relative">
              Báo cáo vi phạm
              <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse group-hover:bg-white" />
            </span>
          </button>



          {/* Vào khu quản trị. Nút này trước đây không có onClick nào — bấm
              vào không có gì xảy ra. */}
          <button
            onClick={(e) => handleNavClick(e, '/producer-portal')}
            title="Đăng nhập khu quản trị"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#135E3E] to-[#0A1A12] px-5 sm:px-6 py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white shadow-[0_10px_20px_rgba(19,94,62,0.2)] transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(19,94,62,0.3)]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#9E7B3B] to-[#8C6928] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center gap-2">
              <LogIn size={14} />
              Hệ thống
            </span>
          </button>

          {/* Hamburger Menu */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#135E3E]/5 border border-[#135E3E]/10 text-[#135E3E] hover:bg-[#135E3E]/10 transition-colors duration-200"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ─── Mobile Menu Drawer ─── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-[#0A1A12]/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-24 inset-x-4 z-50 lg:hidden rounded-[2rem] bg-white/95 backdrop-blur-2xl border border-[#135E3E]/10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-4 space-y-2 animate-[fade-in-up_0.3s_ease-out]">
            {NAV_LINKS.map((link) => {
              const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold font-['Be_Vietnam_Pro'] transition-all duration-300 no-underline uppercase tracking-wider
                    ${isActive 
                      ? 'text-[#135E3E] bg-[#135E3E]/5' 
                      : 'text-[#0A1A12]/70 hover:text-[#135E3E] hover:bg-[#135E3E]/5'
                    }`}
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.label}
                  {isActive && <ChevronRight size={18} className="text-[#9E7B3B]" />}
                </a>
              );
            })}
            
            <button
              onClick={(e) => handleNavClick(e, '/report-fraud')}
              className="w-full flex items-center justify-between px-5 py-4 mt-4 rounded-2xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white transition-all duration-300 group uppercase tracking-wider"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="group-hover:animate-bounce" />
                Báo cáo vi phạm
              </div>
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse group-hover:bg-white" />
            </button>


          </div>
        </>
      )}
    </>
  );
}
