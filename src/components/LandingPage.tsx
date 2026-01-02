import { Calendar, Bell, Users, Clock, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Booking System',
      description: 'Let clients book appointments 24/7 with your custom booking page',
      color: 'from-blue-600 to-blue-400'
    },
    {
      icon: Bell,
      title: 'Automated SMS Notifications',
      description: 'Automatic reminders sent before appointments to keep everyone on track',
      color: 'from-emerald-600 to-emerald-400'
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Keep track of all your clients and their booking history',
      color: 'from-orange-600 to-orange-400'
    },
    {
      icon: Clock,
      title: 'Flexible Availability',
      description: 'Set your working hours and let the system handle the rest',
      color: 'from-rose-600 to-rose-400'
    }
  ];

  const benefits = [
    'No setup fees or hidden charges',
    'Easy to use and maintain',
    'Verified phone numbers with OTP',
    'Multi-language support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <header className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-xl z-50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">BookNow</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition font-medium">Features</a>
              <a href="#benefits" className="text-slate-300 hover:text-white transition font-medium">Benefits</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button
                onClick={onSignIn}
                className="text-slate-300 hover:text-white transition font-medium px-4 py-2"
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition font-medium shadow-lg hover:shadow-blue-500/50"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-40 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-600/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">Now with SMS verification</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Simplify Your
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-emerald-300 bg-clip-text text-transparent">Appointment Scheduling</span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Let your clients book appointments with you 24/7. Automatic SMS reminders and verified phone numbers keep everyone connected.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-blue-600 transition text-lg font-semibold inline-flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/50"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={onSignIn}
              className="bg-slate-800 text-white px-8 py-4 rounded-lg hover:bg-slate-700 transition text-lg font-semibold border border-slate-700"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Powerful features to manage your bookings and customer relationships effortlessly
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-2xl border border-slate-600 hover:border-slate-500 transition duration-300 hover:shadow-xl hover:shadow-slate-600/20"
                >
                  <div className={`bg-gradient-to-br ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold text-white mb-8">
                Why Choose BookNow?
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <p className="text-lg text-slate-300">{benefit}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={onGetStarted}
                className="mt-10 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-8 py-4 rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition font-semibold shadow-lg hover:shadow-emerald-500/50"
              >
                Start Free Today
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-600/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-2xl border border-slate-600">
                <div className="space-y-4">
                  <div className="h-3 bg-slate-600 rounded-full w-3/4"></div>
                  <div className="h-3 bg-slate-600 rounded-full w-full"></div>
                  <div className="h-3 bg-slate-600 rounded-full w-4/5"></div>
                  <div className="pt-4 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-2 bg-slate-600 rounded w-24"></div>
                        <div className="h-2 bg-slate-600 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-10 w-10 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-2 bg-slate-600 rounded w-28"></div>
                        <div className="h-2 bg-slate-600 rounded w-36"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 border-t border-slate-700 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">BookNow</span>
          </div>
          <p className="text-center mb-4 text-slate-400">The modern appointment scheduling platform for entrepreneurs and small businesses</p>
          <div className="border-t border-slate-700 pt-8 flex justify-between items-center">
            <p className="text-sm text-slate-500">
              © 2024 BookNow. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-white transition">Terms</a>
              <a href="#" className="text-slate-400 hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
