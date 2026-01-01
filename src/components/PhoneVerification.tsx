import { useState } from 'react';
import { Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { validatePhone } from '../lib/phoneValidation';

interface PhoneVerificationProps {
  onVerified: (phone: string) => void;
  countryCode?: string;
  language: 'es' | 'en';
}

export function PhoneVerification({ onVerified, countryCode, language }: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const isValidPhone = validatePhone(phone, countryCode);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidPhone) {
      setError(language === 'es' ? 'Número de teléfono inválido' : 'Invalid phone number');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request',
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || (language === 'es' ? 'Error al enviar código' : 'Error sending code'));
        return;
      }

      setStep('otp');
      setAttempts(0);
    } catch (err) {
      setError(language === 'es' ? 'Error de conexión' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError(language === 'es' ? 'El código debe tener 6 dígitos' : 'Code must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          phone,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || (language === 'es' ? 'Código inválido' : 'Invalid code'));
        setAttempts(attempts + 1);
        if (attempts >= 2) {
          setStep('phone');
          setOtp('');
          setAttempts(0);
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onVerified(phone);
      }, 1000);
    } catch (err) {
      setError(language === 'es' ? 'Error de conexión' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span>{language === 'es' ? 'Número verificado' : 'Phone verified'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <form onSubmit={handleRequestOtp} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'es' ? 'Número de teléfono' : 'Phone Number'}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={language === 'es' ? '+34 600 000 000' : '+1 (555) 123-4567'}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            {phone && !isValidPhone && (
              <p className="text-sm text-red-600 mt-1">
                {language === 'es' ? 'Formato inválido' : 'Invalid format'}
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isValidPhone || loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading
              ? language === 'es'
                ? 'Enviando...'
                : 'Sending...'
              : language === 'es'
              ? 'Enviar código'
              : 'Send Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'es' ? 'Código de verificación' : 'Verification Code'}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-2 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {language === 'es'
                ? 'Ingresa el código enviado a tu teléfono'
                : 'Enter the code sent to your phone'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={otp.length !== 6 || loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading
              ? language === 'es'
                ? 'Verificando...'
                : 'Verifying...'
              : language === 'es'
              ? 'Verificar código'
              : 'Verify Code'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setOtp('');
              setError('');
              setAttempts(0);
            }}
            className="w-full py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {language === 'es' ? 'Cambiar número' : 'Change number'}
          </button>
        </form>
      )}
    </div>
  );
}
