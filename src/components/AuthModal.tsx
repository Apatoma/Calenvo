import { useState } from 'react';
import { X, Calendar, Building, User } from 'lucide-react';
import { useAuth, UserType } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { validatePhone } from '../lib/phoneValidation';
import { PhoneVerification } from './PhoneVerification';
import { t } from '../lib/i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { language, country } = useLocalization();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && step === 'type') {
      if (!userType) {
        setError(t('auth.fillAllFields', language));
        return;
      }
      setStep('form');
      return;
    }

    if (!validatePhone(phone, country || undefined)) {
      setError(t('auth.invalidPhone', language));
      return;
    }

    if (!phoneVerified && mode === 'signup') {
      setError(language === 'es' ? 'Por favor verifica tu teléfono' : 'Please verify your phone');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      } else {
        const requiredFields = userType === 'entrepreneur'
          ? [fullName, businessName, email, password, phone, phoneVerified]
          : [fullName, email, password, phone, phoneVerified];

        if (requiredFields.some(field => !field)) {
          setError(t('auth.fillAllFields', language));
          setLoading(false);
          return;
        }

        const { error } = await signUp(
          email,
          password,
          fullName,
          userType === 'entrepreneur' ? businessName : fullName,
          phone,
          userType,
          language
        );
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(err.message || (language === 'es' ? 'Ocurrió un error' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">BookNow</span>
        </div>

        {mode === 'signup' && step === 'type' ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.selectType', language)}
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              {t('auth.selectTypeDesc', language)}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setUserType('entrepreneur');
                  setStep('form');
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
              >
                <div className="flex items-start gap-3">
                  <Building className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {t('auth.entrepreneur', language)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('auth.entrepreneurDesc', language)}
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setUserType('client');
                  setStep('form');
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
              >
                <div className="flex items-start gap-3">
                  <User className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {t('auth.client', language)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('auth.clientDesc', language)}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'signin'
                ? t('auth.welcomeBack', language)
                : t('auth.createAccount', language)}
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              {mode === 'signin'
                ? t('auth.signInDesc', language)
                : t('auth.createAccountDesc', language)}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.fullName', language)}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {userType === 'entrepreneur' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.businessName', language)}
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.phone', language)}
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      {t('auth.phoneDesc', language)}
                    </p>
                    {!phoneVerified ? (
                      <div className="mb-4">
                        <PhoneVerification
                          onVerified={(verifiedPhone) => {
                            setPhone(verifiedPhone);
                            setPhoneVerified(true);
                          }}
                          countryCode={country || undefined}
                          language={language}
                        />
                      </div>
                    ) : (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                        ✓ {phone}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.email', language)}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.password', language)}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? language === 'es'
                    ? 'Por favor espera...'
                    : 'Please wait...'
                  : mode === 'signin'
                  ? t('auth.signIn', language)
                  : t('auth.createAccount', language)}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setStep('type');
                  setError('');
                  setUserType(null);
                  setPhoneVerified(false);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {mode === 'signin'
                  ? t('auth.dontHaveAccount', language)
                  : t('auth.haveAccount', language)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
