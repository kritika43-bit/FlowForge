'use client';

import { Card, CardContent } from '../ui/card';
import { FlowForgeLogo } from '../logo';

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Branding */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center space-x-3">
              <FlowForgeLogo className="h-10 w-10" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                FlowForge
              </span>
            </div>
          </div>
          {title && (
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Auth Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardContent className="p-8">
            {children}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2025 FlowForge. Manufacturing management platform.
          </p>
        </div>
      </div>
    </div>
  );
}
