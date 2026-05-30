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
    name: 'Iron Gate Fitness',
    referralCode: 'IRONGATE',
    location: 'Lagos Central',
    description: 'Premium strength and conditioning gym with dedicated coaching.'
  },
  {
    id: 'gym-2',
    name: 'Shadow Vault Gym',
    referralCode: 'SHADOW',
    location: 'Victoria Island',
    description: 'High-intensity training for elite athletes and ambition-driven warriors.'
  },
  {
    id: 'gym-3',
    name: 'Titan Forge Club',
    referralCode: 'TITAN',
    location: 'Lekki',
    description: 'Modern facility with powerlifting, cardio, and recovery zones.'
  },
  {
    id: 'gym-4',
    name: 'Apex Strength Hub',
    referralCode: 'APEX',
    location: 'Ikeja',
    description: 'Community-focused gym built for goal crushers and grind-minded members.'
  },
  {
    id: 'gym-5',
    name: 'Vanguard Fitness House',
    referralCode: 'VANGUARD',
    location: 'Surulere',
    description: 'Balanced training space for strength, endurance, and mobility.'
  }
];

export const findGymByCode = (code: string) => gyms.find((gym) => gym.referralCode.toUpperCase() === code.trim().toUpperCase());
