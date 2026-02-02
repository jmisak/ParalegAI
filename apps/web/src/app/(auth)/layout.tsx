import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-navy-900 text-xl">IC</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">IRONCLAD</span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-serif font-bold leading-tight">
            AI-Powered Legal Practice Management
          </h1>
          <p className="text-navy-300 text-lg leading-relaxed max-w-md">
            Streamline your real estate law practice with intelligent document
            automation, deadline management, and AI-assisted analysis.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <div className="text-3xl font-bold text-gold-400">50+</div>
              <div className="text-navy-400 text-sm">Document Templates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gold-400">99.9%</div>
              <div className="text-navy-400 text-sm">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gold-400">SOC 2</div>
              <div className="text-navy-400 text-sm">Compliant</div>
            </div>
          </div>
        </div>

        <div className="text-navy-500 text-sm">
          &copy; {new Date().getFullYear()} IronClad Legal Technologies. All
          rights reserved.
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
