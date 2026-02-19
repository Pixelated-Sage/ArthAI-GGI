import React from 'react';

// This layout previously handled the UI shell, but we are moving that logic
// to individual pages via DashboardShell to allow for custom titles/headers.
// This file now serves as a pass-through or can hold shared contexts in the future.

export default function PredictionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
