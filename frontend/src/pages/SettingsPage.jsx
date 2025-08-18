import { useEffect, useState } from 'react';
import useAuthUser from '../hooks/useAuthUser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../lib/api';
import { useThemeStore } from '../store/useThemeStore';
import { THEMES } from '../constants';

const SettingsPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useThemeStore();

  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    nativeLanguage: '',
    learningLanguage: '',
    location: '',
    profilePic: '',
  });

  useEffect(() => {
    if (authUser) {
      setForm({
        fullName: authUser.fullName || '',
        bio: authUser.bio || '',
        nativeLanguage: authUser.nativeLanguage || '',
        learningLanguage: authUser.learningLanguage || '',
        location: authUser.location || '',
        profilePic: authUser.profilePic || '',
      });
    }
  }, [authUser]);

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
      // Invalidate Stream token to force reconnection with new profile
      queryClient.invalidateQueries({ queryKey: ['streamToken'] });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, 400, 400, 0.6).then((dataUrl) => {
      setForm((prev) => ({ ...prev, profilePic: dataUrl }));
    }).catch(() => {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Simple client-side image compressor to keep payload small
  const compressImage = (file, maxWidth, maxHeight, quality) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
          const targetWidth = Math.round(width * ratio);
          const targetHeight = Math.round(height * ratio);
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const mime = (file.type === 'image/png' || file.type === 'image/webp') ? file.type : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mime, quality);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveProfile(form);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Settings</h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Profile Photo */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Profile Photo</h2>
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-20 rounded-full">
                    <img src={form.profilePic} alt="Profile" />
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.svg"
                  className="file-input file-input-bordered"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <form onSubmit={handleSubmit} className="card bg-base-200">
            <div className="card-body grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} className="input input-bordered w-full" />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input name="location" value={form.location} onChange={handleChange} className="input input-bordered w-full" />
                </div>
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} className="textarea textarea-bordered w-full" rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Native Language</label>
                  <input name="nativeLanguage" value={form.nativeLanguage} onChange={handleChange} className="input input-bordered w-full" />
                </div>
                <div>
                  <label className="label">Learning Language</label>
                  <input name="learningLanguage" value={form.learningLanguage} onChange={handleChange} className="input input-bordered w-full" />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="submit" disabled={isPending} className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          </form>

          {/* Theme */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title mb-2">Theme</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {THEMES.slice(0, 12).map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={`btn btn-sm ${theme === t.name ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


