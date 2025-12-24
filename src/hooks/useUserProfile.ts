import { useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  pan: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  assesseeType: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Shankaran Pillai',
  pan: 'ILOVE1432U',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  assesseeType: 'Individual',
};

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem('user_profile');
  };

  return { profile, updateProfile, resetProfile };
};
