'use client';

import * as React from 'react';
import {ThemeContext, ThemeProvider as NextThemesProvider} from 'next-themes';

interface ThemeProviderProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

function ThemeProvider({children, ...props}: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export default ThemeProvider;
