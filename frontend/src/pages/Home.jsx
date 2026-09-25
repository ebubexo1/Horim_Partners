import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-b from-navy to-navy-light text-white">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gold">Donation & Partnership Platform</p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Partnering for Lasting Impact —<br className="hidden sm:block" /> the <span className="text-gold">Horim</span> Way
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-200">
            Horim Partners exists to mobilise consistent, structured support for our mission. Whether it's a
            one-time gift or a standing monthly partnership, your generosity sustains real, lasting impact.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/donate" className="btn-gold text-base">Donate Now</Link>
            <Link to="/become-a-partner" className="btn-outline-blue !border-white !text-white text-base hover:!bg-white hover:!text-navy">Become a Partner</Link>
            <Link to="/portal" className="rounded-lg px-6 py-3 text-base font-semibold text-gray-200 underline-offset-4 hover:text-white hover:underline">Partner Portal →</Link>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-navy">Our Mission</h2>
        <p className="mx-auto mt-4 max-w-3xl text-gray-600">
          We believe sustainable impact is built on committed partnership, not one-off gestures. Horim Partners
          gives every donor and partner a simple, transparent way to give — and to see the difference it makes.
        </p>
      </section>

      {/* THREE PATHS */}
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <div className="card border-2 border-gold/40 text-center">
            <h3 className="text-lg font-bold text-navy">Give Once</h3>
            <p className="mt-2 text-sm text-gray-600">A quick, secure one-time donation. No account needed.</p>
            <Link to="/donate" className="btn-gold mt-5 w-full">Donate</Link>
          </div>
          <div className="card border-2 border-accentblue/40 text-center">
            <h3 className="text-lg font-bold text-navy">Become a Partner</h3>
            <p className="mt-2 text-sm text-gray-600">Join a partnership tier and give consistently every month.</p>
            <Link to="/become-a-partner" className="btn-navy mt-5 w-full">See Partnership Levels</Link>
          </div>
          <div className="card border-2 border-navy/20 text-center">
            <h3 className="text-lg font-bold text-navy">Existing Partner?</h3>
            <p className="mt-2 text-sm text-gray-600">Log in to view your dashboard, giving history and more.</p>
            <Link to="/portal" className="btn-outline-blue mt-5 w-full">Partner Portal</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
