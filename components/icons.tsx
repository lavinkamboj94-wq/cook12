
import React from 'react';

export const ChefHatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19.8 11.5A5.4 5.4 0 0 0 17 8.1a5.4 5.4 0 0 0-4-2.6A5.4 5.4 0 0 0 9 8.1a5.4 5.4 0 0 0-2.8 3.4" />
    <path d="M5 11.5v6.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6.5" />
    <path d="M9 11.5v-1a2 2 0 1 1 4 0v1" />
  </svg>
);

export const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
