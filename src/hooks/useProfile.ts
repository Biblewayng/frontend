import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profile.service';

export const PROFILE_KEY = 'profile';

export const useProfile = () => {
  const qc = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string | number; data: any }) => profileService.update(userId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROFILE_KEY] }),
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: ({ userId, file }: { userId: string | number; file: File }) => profileService.uploadPhoto(userId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROFILE_KEY] }),
  });

  return {
    getProfile: profileService.get,
    updateProfile: (userId: string | number, data: any) => updateMutation.mutateAsync({ userId, data }),
    changePassword: profileService.changePassword,
    uploadPhoto: (userId: string | number, file: File) => uploadPhotoMutation.mutateAsync({ userId, file }),
    getNotificationPreferences: profileService.getNotificationPreferences,
    updateNotificationPreferences: profileService.updateNotificationPreferences,
  };
};
