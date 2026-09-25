import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const isStaff = user && ["admin", "super_admin", "support"].includes(user.role);

  return (
    <header className="sticky top-0 z-40 bg-navy text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold font-extrabold text-navy-dark">H</span>
          <span className="text-lg font-extrabold tracking-tight">
            HORIM <span className="text-gold">PARTNERS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-gray-200 hover:text-gold">Home</Link>
          <Link to="/become-a-partner" className="text-sm font-medium text-gray-200 hover:text-gold">Become a Partner</Link>
          <Link to="/donate" className="btn-gold !px-5 !py-2 text-sm">Donate</Link>
          {!user && <Link to="/portal" className="btn-outline-blue !border-white !text-white !px-5 !py-2 text-sm hover:!bg-white hover:!text-navy">Partner Portal</Link>}
          {user && !isStaff && <Link to="/dashboard" className="text-sm font-medium text-gray-200 hover:text-gold">My Dashboard</Link>}
          {isStaff && <Link to="/admin" className="text-sm font-medium text-gray-200 hover:text-gold">Admin</Link>}
          {user && (
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Log out
            </button>
          )}
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="space-y-1 border-t border-navy-light px-4 py-4 md:hidden">
          <Link to="/" onClick={() => setOpen(false)} className="block py-2 text-gray-200">Home</Link>
          <Link to="/become-a-partner" onClick={() => setOpen(false)} className="block py-2 text-gray-200">Become a Partner</Link>
          <Link to="/donate" onClick={() => setOpen(false)} className="block py-2 font-semibold text-gold">Donate</Link>
          <Link to="/portal" onClick={() => setOpen(false)} className="block py-2 text-gray-200">Partner Portal</Link>
          {user && !isStaff && <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-2 text-gray-200">My Dashboard</Link>}
          {isStaff && <Link to="/admin" onClick={() => setOpen(false)} className="block py-2 text-gray-200">Admin</Link>}
          {user && (
            <button onClick={() => { logout(); setOpen(false); navigate("/"); }} className="block py-2 text-gray-300">
              Log out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
