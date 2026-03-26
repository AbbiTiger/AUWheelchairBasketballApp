import React from 'react';
import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 text-center p-6">
      <h1 className="text-6xl font-black text-foreground">404</h1>
      <p className="text-xl font-semibold text-muted-foreground">Page not found</p>
      <Link
        to="/"
        className="mt-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
