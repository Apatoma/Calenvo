import { useState, useEffect } from 'react';
import { Calendar, LogOut, Settings, Users, Link as LinkIcon, Clock } from 'lucide-react';
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">BookNow</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {profile?.business_name || user?.email}
              </span>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profile?.booking_url && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Your Booking Page
                </h3>
                <p className="text-sm text-blue-700 font-mono">{bookingUrl}</p>
              </div>
              <button
                onClick={copyBookingUrl}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <LinkIcon className="h-4 w-4" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900">{stats.upcomingBookings}</p>
              </div>
              <Clock className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedBookings}</p>
              </div>
              <Users className="h-10 w-10 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'bookings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('availability')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'availability'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Availability
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'bookings' && <BookingsList onUpdate={loadStats} />}
            {activeTab === 'availability' && <AvailabilitySettings />}
            {activeTab === 'settings' && <ProfileSettings profile={profile} onUpdate={loadProfile} />}
          </div>
        </div>
      </div>
    </div>
  );
}
