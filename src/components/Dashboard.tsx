import { useState, useEffect } from 'react';
import { Calendar, LogOut, Settings, Users, Link as LinkIcon, Clock, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookingsList } from './BookingsList';
import { AvailabilitySettings } from './AvailabilitySettings';
import { ProfileSettings } from './ProfileSettings';

type TabType = 'bookings' | 'availability' | 'settings';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    setProfile(data);
  };

  const loadStats = async () => {
    if (!user) return;

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('entrepreneur_id', user.id);

    if (bookings) {
      const now = new Date();
      const upcoming = bookings.filter(b => new Date(b.booking_date) > now && b.status !== 'cancelled');
      const completed = bookings.filter(b => b.status === 'completed');

      setStats({
        totalBookings: bookings.length,
        upcomingBookings: upcoming.length,
        completedBookings: completed.length
      });
    }
  };

  const bookingUrl = profile?.booking_url
    ? `${window.location.origin}/book/${profile.booking_url}`
    : '';

  const copyBookingUrl = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <header className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-xl z-50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">BookNow</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center space-x-1 bg-slate-800 rounded-lg px-4 py-2">
                <span className="text-sm text-slate-300">
                  {profile?.business_name || user?.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-slate-800"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {profile?.booking_url && (
            <div className="mb-8 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-blue-300 mb-2">Your Booking Page</h3>
                  <p className="text-slate-300 font-mono text-sm break-all">{bookingUrl}</p>
                </div>
                <button
                  onClick={copyBookingUrl}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    copied
                      ? 'bg-emerald-600/80 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="group bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-2xl border border-slate-600 hover:border-slate-500 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">Total Bookings</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">{stats.totalBookings}</p>
                </div>
                <div className="p-3 bg-blue-600/20 rounded-xl group-hover:bg-blue-600/30 transition">
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-2xl border border-slate-600 hover:border-slate-500 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">Upcoming</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">{stats.upcomingBookings}</p>
                </div>
                <div className="p-3 bg-emerald-600/20 rounded-xl group-hover:bg-emerald-600/30 transition">
                  <Clock className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-2xl border border-slate-600 hover:border-slate-500 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">Completed</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-200 bg-clip-text text-transparent">{stats.completedBookings}</p>
                </div>
                <div className="p-3 bg-orange-600/20 rounded-xl group-hover:bg-orange-600/30 transition">
                  <Users className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl border border-slate-600 overflow-hidden">
            <div className="border-b border-slate-600 bg-slate-800/50">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-6 py-4 text-sm font-semibold transition ${
                    activeTab === 'bookings'
                      ? 'text-blue-400 border-b-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-300 border-b-2 border-transparent'
                  }`}
                >
                  Bookings
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`px-6 py-4 text-sm font-semibold transition ${
                    activeTab === 'availability'
                      ? 'text-blue-400 border-b-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-300 border-b-2 border-transparent'
                  }`}
                >
                  Availability
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-4 text-sm font-semibold transition ${
                    activeTab === 'settings'
                      ? 'text-blue-400 border-b-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-300 border-b-2 border-transparent'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'bookings' && <BookingsList onUpdate={loadStats} />}
              {activeTab === 'availability' && <AvailabilitySettings />}
              {activeTab === 'settings' && <ProfileSettings profile={profile} onUpdate={loadProfile} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
