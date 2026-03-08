import { useState, useEffect } from 'react';

export interface LegalEntity {
  id: string;
  name: string;
  type: string;
  pan: string;
  gstns: string[];
  registeredAddress: string;
  businessAddress: string;
  natureOfBusiness: string;
  dateOfIncorporation: string;
}

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
  pan: 'ABCDE1234F',
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

  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>(() => {
    const saved = localStorage.getItem('legal_entities');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('legal_entities', JSON.stringify(legalEntities));
  }, [legalEntities]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem('user_profile');
  };

  const addEntity = (entity: Omit<LegalEntity, 'id'>) => {
    const newEntity: LegalEntity = { ...entity, id: crypto.randomUUID() };
    setLegalEntities(prev => [...prev, newEntity]);
  };

  const updateEntity = (id: string, updates: Partial<LegalEntity>) => {
    setLegalEntities(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteEntity = (id: string) => {
    setLegalEntities(prev => prev.filter(e => e.id !== id));
  };

  return { profile, updateProfile, resetProfile, legalEntities, addEntity, updateEntity, deleteEntity };
};
