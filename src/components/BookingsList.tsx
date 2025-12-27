import { useState, useEffect } from 'react';
import { Calendar, Mail, Phone, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  booking_date: string;
  duration_minutes: number;
  notes: string | null;
  status: string;
}

interface BookingsListProps {
  onUpdate: () => void;
}

export function BookingsList({ onUpdate }: BookingsListProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

  useEffect(() => {
    loadBookings();
  }, [user, filter]);

  const loadBookings = async () => {
    if (!user) return;

    setLoading(true);
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('entrepreneur_id', user.id)
      .order('booking_date', { ascending: true });

    if (filter === 'upcoming') {
      query = query.gte('booking_date', new Date().toISOString()).neq('status', 'cancelled');
    } else if (filter === 'completed') {
      query = query.eq('status', 'completed');
    } else if (filter === 'cancelled') {
      query = query.eq('status', 'cancelled');
    }

    const { data } = await query;
    setBookings(data || []);
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    loadBookings();
    onUpdate();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex space-x-2 mb-6">
        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.client_name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(booking.booking_date)}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {booking.client_email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {booking.client_phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {booking.duration_minutes} minutes
                </div>
              </div>

              {booking.notes && (
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Notes:</span> {booking.notes}
                  </p>
                </div>
              )}

              {booking.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Confirm</span>
                  </button>
                  <button
                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <button
                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark as Completed</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
