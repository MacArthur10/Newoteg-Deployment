import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Upload } from 'lucide-react';
import adminService from '../services/adminService';
import { updateSessionUser } from '../utils/authSession';

type Profile = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: string;
};

export const Settings = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initials = useMemo(() => {
    if (!fullName) return 'AD';
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((v) => v[0]?.toUpperCase())
      .join('');
  }, [fullName]);

  const loadProfile = async () => {
    setIsBusy(true);
    setError('');
    setSuccess('');
    try {
      const data = await adminService.getProfile();
      const user = data as Profile;
      setProfile(user);
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      updateSessionUser({
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        email: user.email,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger le profil.');
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setIsBusy(true);
    setError('');
    setSuccess('');

    try {
      const updated = await adminService.updateProfile({
        fullName,
        phone,
      });
      const user = updated as Profile;
      setProfile(user);
      updateSessionUser({
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      });
      setSuccess('Profil mis à jour avec succès.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de mise à jour du profil.');
    } finally {
      setIsBusy(false);
    }
  };

  const onUploadAvatar = async () => {
    if (!avatarFile) return;
    setIsBusy(true);
    setError('');
    setSuccess('');

    try {
      const updated = await adminService.uploadProfileImage(avatarFile);
      const user = updated as Profile;
      setProfile(user);
      setAvatarFile(null);
      updateSessionUser({
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      });
      setSuccess('Photo administrateur mise à jour avec succès.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec du changement de photo.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Profil Administrateur</h2>
          <p className="text-slate-500 text-sm">Informations du compte connecté et photo de profil.</p>
        </div>
        <button
          type="button"
          onClick={loadProfile}
          disabled={isBusy}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={16} />
          Rafraîchir
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Photo Administrateur</h3>
          <div className="flex items-center gap-4">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
            )}
            <div className="text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{profile?.fullName || 'Administrateur'}</p>
              <p>{profile?.email || 'N/A'}</p>
              <p>Rôle: {profile?.role || 'ADMIN'}</p>
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={onUploadAvatar}
            disabled={isBusy || !avatarFile}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-opacity-90 disabled:opacity-60"
          >
            <Upload size={16} />
            Changer l'image admin
          </button>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Informations du compte connecté</h3>
          <form onSubmit={onSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Téléphone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isBusy}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
              >
                {isBusy ? 'Enregistrement...' : 'Mettre à jour le profil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};
