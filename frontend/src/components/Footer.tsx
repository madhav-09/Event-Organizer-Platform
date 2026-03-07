import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5"
      style={{ background: 'var(--bg-secondary)' }}>
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(108,71,236,1), transparent)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10">
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-heading font-bold text-white text-lg">Swasthya Chetna</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Discover and book tickets for the best events happening near you. Every moment, perfectly planned.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, hover: '#1877f2', label: 'Facebook' },
                { icon: Twitter, hover: '#1da1f2', label: 'Twitter' },
                { icon: Instagram, hover: '#e1306c', label: 'Instagram' },
                { icon: Linkedin, hover: '#0a66c2', label: 'LinkedIn' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-widest">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/', label: 'Browse Events' },
                { to: '/create-event', label: 'Create Event' },
                { to: '/apply-organizer', label: 'Become Organizer' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-widest">
              Support
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/help', label: 'Help Center' },
                { to: '/contact', label: 'Contact Us' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/privacy', label: 'Privacy Policy' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-widest">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">support@swasthyachetna.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">+91 1800-123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">Vadodara, Gujarat, India</span>
              </li>
            </ul>

            {/* Newsletter CTA */}
            <div className="mt-6 p-4 rounded-xl"
              style={{ background: 'rgba(108,71,236,0.1)', border: '1px solid rgba(108,71,236,0.2)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-semibold text-white">Stay Updated</span>
              </div>
              <p className="text-xs text-slate-500">Get the latest events in your inbox.</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 Swasthya Chetna. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Terms', 'Privacy', 'Cookies'].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
