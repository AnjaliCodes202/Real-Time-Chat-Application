import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Camera, User, Mail } from 'lucide-react';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = React.useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePicture: base64Image });
    };
  };

  return (
    <div className="h-screen pt-20 px-4 bg-base-200 flex items-center justify-center">
      <div className="max-w-xl w-full bg-base-100 rounded-xl shadow-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-base-content/60 mt-1">Your profile information</p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={selectedImg || authUser.profilePicture || "https://ui-avatars.com/api/?name=" + authUser.name}
              alt="Profile"
              className="size-32 rounded-full object-cover border-4 border-primary"
            />
            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-0 right-0 bg-primary hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
            >
              <Camera className="w-5 h-5 text-base-100" />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <p className="text-sm text-base-content/60">
            {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-1.5">
            <div className="text-sm text-base-content/60 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </div>
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border border-base-300">{authUser.name}</p>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm text-base-content/60 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border border-base-300">{authUser.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
