import { useState, useEffect } from 'react';
import { Clock, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface TimeSlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AvailabilitySettings() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAvailability();
  }, [user]);

  const loadAvailability = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('entrepreneur_id', user.id)
      .order('day_of_week', { ascending: true });

    if (data && data.length > 0) {
      setAvailability(data);
    } else {
      const defaultAvailability: TimeSlot[] = DAYS.map((_, index) => ({
        day_of_week: index,
        start_time: '09:00',
        end_time: '17:00',
        is_available: index >= 1 && index <= 5
      }));
      setAvailability(defaultAvailability);
    }
    setLoading(false);
  };

  const updateSlot = (dayIndex: number, field: keyof TimeSlot, value: any) => {
    setAvailability(prev => prev.map(slot =>
      slot.day_of_week === dayIndex
        ? { ...slot, [field]: value }
        : slot
    ));
  };

  const saveAvailability = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      await supabase
        .from('availability')
        .delete()
        .eq('entrepreneur_id', user.id);

      const slotsToInsert = availability.map(slot => ({
        entrepreneur_id: user.id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: slot.is_available
      }));

      const { error } = await supabase
        .from('availability')
        .insert(slotsToInsert);

      if (error) throw error;

      setMessage('Availability saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Error saving availability: ' + error.message);
    } finally {
      setSaving(false);
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
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Your Availability</h3>
        <p className="text-gray-600">Define when clients can book appointments with you</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {availability.map((slot) => (
          <div key={slot.day_of_week} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-32">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={slot.is_available}
                  onChange={(e) => updateSlot(slot.day_of_week, 'is_available', e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-900">{DAYS[slot.day_of_week]}</span>
              </label>
            </div>

            <div className="flex items-center space-x-2 flex-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <input
                type="time"
                value={slot.start_time}
                onChange={(e) => updateSlot(slot.day_of_week, 'start_time', e.target.value)}
                disabled={!slot.is_available}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
              />
              <span className="text-gray-600">to</span>
              <input
                type="time"
                value={slot.end_time}
                onChange={(e) => updateSlot(slot.day_of_week, 'end_time', e.target.value)}
                disabled={!slot.is_available}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={saveAvailability}
        disabled={saving}
        className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="h-5 w-5" />
        <span>{saving ? 'Saving...' : 'Save Availability'}</span>
      </button>
    </div>
  );
}
