type DummyUser = {
  name: string;
  email: string;
  password: string;
  avatar: string;
  rankTitle: string;
  schedule: string[];
  streak: number;
  xp: number;
  level: number;
  challengesCompleted: number;
  checkIns: number;
  history: Record<string, boolean>;
};

export const dummyUsers: DummyUser[] = [
  { name: 'Chinedu Okoro', email: 'chinedu@example.com', password: 'demo1234', avatar: '', rankTitle: 'Forged', schedule: ['Mon', 'Wed', 'Fri'], streak: 4, xp: 820, level: 3, challengesCompleted: 14, checkIns: 28, history: {} },
  { name: 'Efe Adebayo', email: 'efe@example.com', password: 'demo1234', avatar: '', rankTitle: 'Elite', schedule: ['Tue', 'Thu', 'Sat'], streak: 12, xp: 1540, level: 4, challengesCompleted: 19, checkIns: 43, history: {} },
  { name: 'Zainab Musa', email: 'zainab@example.com', password: 'demo1234', avatar: '', rankTitle: 'Vanguard', schedule: ['Mon', 'Wed', 'Fri', 'Sat'], streak: 7, xp: 1130, level: 4, challengesCompleted: 26, checkIns: 36, history: {} },
  { name: 'Tunde Balogun', email: 'tunde@example.com', password: 'demo1234', avatar: '', rankTitle: 'Initiate', schedule: ['Mon', 'Tue', 'Thu'], streak: 2, xp: 420, level: 2, challengesCompleted: 9, checkIns: 18, history: {} },
  { name: 'Ngozi Nwosu', email: 'ngozi@example.com', password: 'demo1234', avatar: '', rankTitle: 'Initiate', schedule: ['Tue', 'Thu', 'Sat'], streak: 5, xp: 540, level: 3, challengesCompleted: 12, checkIns: 24, history: {} },
  { name: 'Amina Abdullahi', email: 'amina@example.com', password: 'demo1234', avatar: '', rankTitle: 'Forged', schedule: ['Wed', 'Fri', 'Sun'], streak: 9, xp: 1320, level: 4, challengesCompleted: 21, checkIns: 39, history: {} },
  { name: 'Olumide Akin', email: 'olumide@example.com', password: 'demo1234', avatar: '', rankTitle: 'Elite', schedule: ['Mon', 'Thu', 'Sat'], streak: 13, xp: 1680, level: 4, challengesCompleted: 27, checkIns: 47, history: {} },
  { name: 'Yemi Adedeji', email: 'yemi@example.com', password: 'demo1234', avatar: '', rankTitle: 'Prime', schedule: ['Mon', 'Wed', 'Fri'], streak: 17, xp: 2170, level: 5, challengesCompleted: 35, checkIns: 60, history: {} },
  { name: 'Maryam Bello', email: 'maryam@example.com', password: 'demo1234', avatar: '', rankTitle: 'Vanguard', schedule: ['Tue', 'Thu', 'Sat'], streak: 10, xp: 1480, level: 4, challengesCompleted: 24, checkIns: 44, history: {} },
  { name: 'Kunle Oladipo', email: 'kunle@example.com', password: 'demo1234', avatar: '', rankTitle: 'Prime', schedule: ['Mon', 'Wed', 'Fri'], streak: 18, xp: 2350, level: 5, challengesCompleted: 39, checkIns: 63, history: {} },
  { name: 'Halima Yusuf', email: 'halima@example.com', password: 'demo1234', avatar: '', rankTitle: 'Forged', schedule: ['Mon', 'Thu', 'Sat'], streak: 6, xp: 780, level: 3, challengesCompleted: 16, checkIns: 30, history: {} },
  { name: 'Bolanle Adeoye', email: 'bolanle@example.com', password: 'demo1234', avatar: '', rankTitle: 'Monarch', schedule: ['Tue', 'Fri', 'Sun'], streak: 21, xp: 2580, level: 6, challengesCompleted: 43, checkIns: 70, history: {} },
  { name: 'Emeka Ndukwe', email: 'emeka@example.com', password: 'demo1234', avatar: '', rankTitle: 'Vanguard', schedule: ['Mon', 'Wed', 'Sat'], streak: 8, xp: 1280, level: 4, challengesCompleted: 22, checkIns: 41, history: {} },
  { name: 'Kemi Ajayi', email: 'kemi@example.com', password: 'demo1234', avatar: '', rankTitle: 'Elite', schedule: ['Mon', 'Wed', 'Fri', 'Sat'], streak: 15, xp: 1900, level: 5, challengesCompleted: 32, checkIns: 55, history: {} },
  { name: 'Ademola Onyekachi', email: 'ademola@example.com', password: 'demo1234', avatar: '', rankTitle: 'Prime', schedule: ['Mon', 'Wed', 'Fri'], streak: 19, xp: 2430, level: 5, challengesCompleted: 41, checkIns: 68, history: {} }
];
