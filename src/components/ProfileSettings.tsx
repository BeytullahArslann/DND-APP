import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, appId } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { User, Upload, Loader2 } from 'lucide-react';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettings = ({ isOpen, onClose }: ProfileSettingsProps) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(''); // Would need to fetch current bio from Firestore first
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setUploading(true);

      // Update Auth Profile
      if (displayName !== user.displayName) {
          await updateProfile(user, { displayName });
      }

      // Update Firestore User Doc
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
      await updateDoc(userRef, {
          displayName,
          bio
      });

      setUploading(false);
      onClose();
    } catch (error) {
      console.error("Profile update error:", error);
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!user || !e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
          alert("Dosya boyutu 5MB'dan küçük olmalıdır.");
          return;
      }

      try {
          setUploading(true);
          const storageRef = ref(storage, `users/${user.uid}/profile_${Date.now()}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);

          // Update Auth
          await updateProfile(user, { photoURL: downloadURL });

          // Update Firestore
          const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
          await updateDoc(userRef, { photoURL: downloadURL });

          setUploading(false);
      } catch (error) {
          console.error("Upload error:", error);
          alert("Fotoğraf yüklenirken hata oluştu. (Depolama ayarlarını kontrol edin)");
          setUploading(false);
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profil Düzenle">
        <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative w-24 h-24">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 ring-4 ring-slate-600">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <User size={40} />
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600 shadow-lg"
                    >
                        <Upload size={16} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
                <p className="text-xs text-slate-400">Max 5MB (JPG, PNG, GIF)</p>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Kullanıcı Adı</label>
                <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-amber-500 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Hakkında</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-amber-500 outline-none h-24 resize-none"
                    placeholder="Kendinizden bahsedin..."
                />
            </div>

            <button
                type="button" // Change to submit if we want to save bio/name on button click
                onClick={handleSave}
                disabled={uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded flex items-center justify-center disabled:opacity-50"
            >
                {uploading ? <Loader2 className="animate-spin mr-2"/> : null}
                Kaydet
            </button>
        </form>
    </Modal>
  );
};
