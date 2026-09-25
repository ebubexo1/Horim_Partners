import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 bg-navy-dark text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold font-extrabold text-navy-dark">H</span>
              <span className="font-extrabold text-white">HORIM PARTNERS</span>
            </div>
            <p className="text-sm text-gray-400">
              Building a sustained partnership for lasting impact, one gift and one partner at a time.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/donate" className="hover:text-gold">Donate</Link></li>
              <li><Link to="/become-a-partner" className="hover:text-gold">Become a Partner</Link></li>
              <li><Link to="/portal" className="hover:text-gold">Partner Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Contact</h4>
            <p className="text-sm text-gray-400">partners@horimpartners.org</p>
          </div>
        </div>
        <div className="mt-8 border-t border-navy-light pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Horim Partners. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
