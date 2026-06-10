export type GymProfile = {
  id: string;
  name: string;
  referralCode: string;
  location: string;
  description: string;
};

export const gyms: GymProfile[] = [
  {
    id: 'gym-1',
    name: 'Prime Performance Center',
    referralCode: 'PRIME',
    location: 'Lagos Central',
    description: 'Premium strength and conditioning facility with dedicated coaching.'
  },
  {
    id: 'gym-2',
    name: 'Vanguard Athletic Club',
    referralCode: 'VANGUARD',
    location: 'Victoria Island',
    description: 'High-performance training for those who refuse to settle.'
  },
  {
    id: 'gym-3',
    name: 'Titan Forge',
    referralCode: 'TITAN',
    location: 'Lekki',
    description: 'Modern facility with powerlifting, conditioning, and recovery zones.'
  },
  {
    id: 'gym-4',
    name: 'Apex Strength Lab',
    referralCode: 'APEX',
    location: 'Ikeja',
    description: 'Built for people who hold themselves to a higher standard.'
  },
  {
    id: 'gym-5',
    name: 'Monarch Training House',
    referralCode: 'MONARCH',
    location: 'Surulere',
    description: 'Where discipline becomes identity. Strength, endurance, mastery.'
  }
];

export const findGymByCode = (code: string) => gyms.find((gym) => gym.referralCode.toUpperCase() === code.trim().toUpperCase());
