import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold text-navy">404</h1>
      <p className="mt-2 text-gray-600">Page not found.</p>
      <Link to="/" className="btn-navy mt-6 inline-flex">Back to Home</Link>
    </div>
  );
}
