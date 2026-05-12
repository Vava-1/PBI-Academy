// ============================================
// PBI Academy — Demo Data
// ============================================

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  language: 'english' | 'french' | 'german' | 'kiswahili';
  testType: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  image: string;
  durationHours: number;
  lessonsCount: number;
  studentsCount: number;
  instructorId: string;
  price: number;
  rating: number;
  isPublished: boolean;
  progress?: number;
  category: string;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  languages: string[];
  image: string;
  bio: string;
  students: number;
  courses: number;
  rating: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  exam: string;
  score: string;
  avatar: string;
  rating: number;
}

export interface LiveClass {
  id: string;
  title: string;
  description: string;
  courseId: string;
  instructorId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: 'scheduled' | 'live' | 'ended';
  maxStudents: number;
  registeredCount: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  level: number;
  points: number;
  courses: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface DashboardStats {
  coursesInProgress: number;
  completedLessons: number;
  averageScore: number;
  studyStreak: number;
  totalPoints: number;
  currentLevel: number;
  rank: number;
  percentile: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ============================================
// COURSES
// ============================================

export const courses: Course[] = [
  {
    id: '1',
    title: 'TOEFL iBT Complete Prep',
    slug: 'toefl-ibt-complete',
    description: 'Comprehensive preparation for the TOEFL iBT exam. Covers all four sections: Reading, Listening, Speaking, and Writing with full-length practice tests.',
    language: 'english',
    testType: 'TOEFL',
    level: 'intermediate',
    image: '/course-toefl.jpg',
    durationHours: 40,
    lessonsCount: 120,
    studentsCount: 850,
    instructorId: '1',
    price: 4900,
    rating: 4.8,
    isPublished: true,
    progress: 65,
    category: 'English'
  },
  {
    id: '2',
    title: 'IELTS Academic Mastery',
    slug: 'ielts-academic-mastery',
    description: 'Master the IELTS Academic exam with targeted strategies for each band score. Includes speaking mock tests and writing feedback.',
    language: 'english',
    testType: 'IELTS',
    level: 'advanced',
    image: '/course-ielts.jpg',
    durationHours: 35,
    lessonsCount: 95,
    studentsCount: 720,
    instructorId: '1',
    price: 5900,
    rating: 4.9,
    isPublished: true,
    progress: 30,
    category: 'English'
  },
  {
    id: '3',
    title: 'Duolingo English Test Prep',
    slug: 'duolingo-english-test',
    description: 'Prepare for the Duolingo English Test with adaptive practice questions, video interview tips, and writing sample strategies.',
    language: 'english',
    testType: 'Duolingo',
    level: 'intermediate',
    image: '/course-duolingo.jpg',
    durationHours: 20,
    lessonsCount: 60,
    studentsCount: 430,
    instructorId: '1',
    price: 2900,
    rating: 4.6,
    isPublished: true,
    category: 'English'
  },
  {
    id: '4',
    title: 'DELF B2 Intensive Course',
    slug: 'delf-b2-intensive',
    description: 'Intensive preparation for DELF B2 certification. Focus on advanced grammar, complex writing, and fluent oral expression.',
    language: 'french',
    testType: 'DELF',
    level: 'advanced',
    image: '/course-french.jpg',
    durationHours: 35,
    lessonsCount: 95,
    studentsCount: 620,
    instructorId: '2',
    price: 5400,
    rating: 4.8,
    isPublished: true,
    progress: 45,
    category: 'French'
  },
  {
    id: '5',
    title: 'TCF Canada Complete Guide',
    slug: 'tcf-canada-complete',
    description: 'Full preparation for TCF Canada immigration requirements. All four compulsory sections plus optional speaking and writing.',
    language: 'french',
    testType: 'TCF Canada',
    level: 'intermediate',
    image: '/course-french.jpg',
    durationHours: 30,
    lessonsCount: 80,
    studentsCount: 380,
    instructorId: '2',
    price: 4900,
    rating: 4.7,
    isPublished: true,
    category: 'French'
  },
  {
    id: '6',
    title: 'TEF Canada Preparation',
    slug: 'tef-canada-prep',
    description: 'Prepare for TEF Canada with focus on immigration-required scores. Includes oral comprehension, written expression, and vocabulary building.',
    language: 'french',
    testType: 'TEF Canada',
    level: 'intermediate',
    image: '/course-french.jpg',
    durationHours: 28,
    lessonsCount: 75,
    studentsCount: 290,
    instructorId: '2',
    price: 4900,
    rating: 4.6,
    isPublished: true,
    category: 'French'
  },
  {
    id: '7',
    title: 'German A1-B1 Foundation',
    slug: 'german-a1-b1-foundation',
    description: 'Build a solid foundation in German from beginner to intermediate level. Covers Goethe-Institut A1, A2, and B1 exam preparation.',
    language: 'german',
    testType: 'Goethe',
    level: 'beginner',
    image: '/course-german.jpg',
    durationHours: 60,
    lessonsCount: 150,
    studentsCount: 480,
    instructorId: '3',
    price: 6900,
    rating: 4.7,
    isPublished: true,
    progress: 20,
    category: 'German'
  },
  {
    id: '8',
    title: 'German B2-C1 Advanced',
    slug: 'german-b2-c1-advanced',
    description: 'Advanced German course for B2 and C1 level preparation. Complex grammar, academic writing, and professional communication.',
    language: 'german',
    testType: 'Goethe',
    level: 'advanced',
    image: '/course-german.jpg',
    durationHours: 45,
    lessonsCount: 110,
    studentsCount: 210,
    instructorId: '3',
    price: 7900,
    rating: 4.9,
    isPublished: true,
    category: 'German'
  },
  {
    id: '9',
    title: 'Kiswahili for Beginners',
    slug: 'kiswahili-beginners',
    description: 'Start your Kiswahili journey from scratch. Learn greetings, basic conversation, numbers, and essential vocabulary.',
    language: 'kiswahili',
    testType: 'General',
    level: 'beginner',
    image: '/course-kiswahili.jpg',
    durationHours: 25,
    lessonsCount: 65,
    studentsCount: 560,
    instructorId: '4',
    price: 1900,
    rating: 4.8,
    isPublished: true,
    category: 'Kiswahili'
  },
  {
    id: '10',
    title: 'Advanced Kiswahili Mastery',
    slug: 'kiswahili-advanced',
    description: 'Master advanced Kiswahili grammar, literature, and professional communication. Perfect for business and academic purposes.',
    language: 'kiswahili',
    testType: 'General',
    level: 'advanced',
    image: '/course-kiswahili.jpg',
    durationHours: 35,
    lessonsCount: 90,
    studentsCount: 180,
    instructorId: '4',
    price: 3900,
    rating: 4.9,
    isPublished: true,
    category: 'Kiswahili'
  },
  {
    id: '11',
    title: 'English for Beginners',
    slug: 'english-for-beginners',
    description: 'Learn English from the basics. Build vocabulary, understand grammar fundamentals, and start speaking with confidence.',
    language: 'english',
    testType: 'General',
    level: 'beginner',
    image: '/course-toefl.jpg',
    durationHours: 30,
    lessonsCount: 80,
    studentsCount: 1200,
    instructorId: '1',
    price: 1900,
    rating: 4.7,
    isPublished: true,
    category: 'English'
  },
  {
    id: '12',
    title: 'French for Beginners',
    slug: 'french-for-beginners',
    description: 'Start learning French from zero. Pronunciation, basic grammar, everyday vocabulary, and conversational phrases.',
    language: 'french',
    testType: 'General',
    level: 'beginner',
    image: '/course-french.jpg',
    durationHours: 28,
    lessonsCount: 75,
    studentsCount: 890,
    instructorId: '2',
    price: 1900,
    rating: 4.6,
    isPublished: true,
    category: 'French'
  }
];

// ============================================
// INSTRUCTORS
// ============================================

export const instructors: Instructor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    title: 'TOEFL/IELTS Specialist',
    languages: ['English'],
    image: '/instructor-1.jpg',
    bio: 'PhD in Applied Linguistics from Stanford. 15+ years of test preparation experience. Former TOEFL examiner.',
    students: 2850,
    courses: 4,
    rating: 4.9
  },
  {
    id: '2',
    name: 'Prof. Marie Dubois',
    title: 'DELF/DALF/TCF Expert',
    languages: ['French'],
    image: '/instructor-2.jpg',
    bio: 'Certified DELF/DALF examiner from Alliance Francaise Paris. 12+ years teaching French internationally.',
    students: 1920,
    courses: 4,
    rating: 4.8
  },
  {
    id: '3',
    name: 'Dr. Klaus Weber',
    title: 'Goethe-Institut Trainer',
    languages: ['German'],
    image: '/instructor-3.jpg',
    bio: 'Certified Goethe-Institut trainer with 10+ years experience. Specialized in exam preparation and academic German.',
    students: 980,
    courses: 2,
    rating: 4.9
  },
  {
    id: '4',
    name: 'Prof. Grace Mutua',
    title: 'Kiswahili Professor',
    languages: ['Kiswahili'],
    image: '/instructor-4.jpg',
    bio: 'Professor of African Languages at University of Nairobi. Published author and language preservation advocate.',
    students: 1560,
    courses: 2,
    rating: 4.9
  }
];

// ============================================
// TESTIMONIALS
// ============================================

export const testimonials: Testimonial[] = [
  {
    id: '1',
    quote: "PBI Academy's AI tutor helped me identify my weak areas in TOEFL speaking. My score improved from 85 to 108 in just 6 weeks!",
    name: 'James Ochieng',
    exam: 'TOEFL',
    score: '108/120',
    avatar: '/instructor-3.jpg',
    rating: 5
  },
  {
    id: '2',
    quote: "The live French classes with native speakers made all the difference. I passed DELF B2 on my first attempt. Highly recommended!",
    name: 'Amina Diallo',
    exam: 'DELF B2',
    score: '86/100',
    avatar: '/instructor-4.jpg',
    rating: 5
  },
  {
    id: '3',
    quote: "The adaptive practice tests are incredibly accurate. The AI predicted my IELTS band score within 0.5 points. Amazing technology!",
    name: 'Priya Sharma',
    exam: 'IELTS',
    score: 'Band 8.0',
    avatar: '/instructor-2.jpg',
    rating: 5
  }
];

// ============================================
// LIVE CLASSES
// ============================================

export const liveClasses: LiveClass[] = [
  {
    id: '1',
    title: 'TOEFL Speaking Practice',
    description: 'Live speaking practice with Dr. Sarah Chen. Focus on independent and integrated speaking tasks.',
    courseId: '1',
    instructorId: '1',
    scheduledAt: new Date(Date.now() + 2 * 3600000).toISOString(),
    durationMinutes: 60,
    status: 'scheduled',
    maxStudents: 30,
    registeredCount: 18
  },
  {
    id: '2',
    title: 'DELF Writing Workshop',
    description: 'Interactive writing workshop focusing on DELF B2 written production tasks.',
    courseId: '4',
    instructorId: '2',
    scheduledAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    durationMinutes: 90,
    status: 'scheduled',
    maxStudents: 25,
    registeredCount: 12
  },
  {
    id: '3',
    title: 'German Conversation Club',
    description: 'Casual German conversation practice for B1+ level students. Topic: Travel and Culture.',
    courseId: '7',
    instructorId: '3',
    scheduledAt: new Date(Date.now() + 48 * 3600000).toISOString(),
    durationMinutes: 60,
    status: 'scheduled',
    maxStudents: 20,
    registeredCount: 8
  },
  {
    id: '4',
    title: 'Kiswahili Cultural Immersion',
    description: 'Learn Kiswahili through East African culture, music, and storytelling.',
    courseId: '9',
    instructorId: '4',
    scheduledAt: new Date(Date.now() + 72 * 3600000).toISOString(),
    durationMinutes: 75,
    status: 'scheduled',
    maxStudents: 35,
    registeredCount: 22
  }
];

// ============================================
// LEADERBOARD
// ============================================

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Emmanuel N.', avatar: '/instructor-3.jpg', level: 13, points: 2765, courses: 4, streak: 5 },
  { rank: 2, name: 'Valentin U.', avatar: '/instructor-3.jpg', level: 12, points: 2500, courses: 4, streak: 1, isCurrentUser: true },
  { rank: 3, name: 'Nina Ornella', avatar: '/instructor-2.jpg', level: 10, points: 2198, courses: 5, streak: 1 },
  { rank: 4, name: 'Abel K.', avatar: '/instructor-3.jpg', level: 10, points: 2083, courses: 5, streak: 2 },
  { rank: 5, name: 'Godwin M.', avatar: '/instructor-3.jpg', level: 9, points: 1863, courses: 4, streak: 4 },
  { rank: 6, name: 'Nsengiyaremye', avatar: '/instructor-4.jpg', level: 7, points: 1564, courses: 2, streak: 2 },
  { rank: 7, name: 'Archange D.', avatar: '/instructor-3.jpg', level: 7, points: 1562, courses: 2, streak: 0 },
  { rank: 8, name: 'Jean De La', avatar: '/instructor-3.jpg', level: 6, points: 1197, courses: 2, streak: 1 },
  { rank: 9, name: 'Theobald K.', avatar: '/instructor-3.jpg', level: 5, points: 1052, courses: 3, streak: 2 },
  { rank: 10, name: 'Eric M.', avatar: '/instructor-3.jpg', level: 5, points: 1051, courses: 3, streak: 1 },
];

// ============================================
// DASHBOARD STATS
// ============================================

export const dashboardStats: DashboardStats = {
  coursesInProgress: 4,
  completedLessons: 156,
  averageScore: 82,
  studyStreak: 5,
  totalPoints: 2500,
  currentLevel: 12,
  rank: 2,
  percentile: 98
};

// ============================================
// AI TUTOR SAMPLE CONVERSATION
// ============================================

export const sampleAIMessages: AIMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I am your PBI AI Tutor. I am here to help you prepare for your language tests. How can I assist you today?',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    role: 'user',
    content: 'I need help with TOEFL speaking section. I always get nervous during the independent speaking task.',
    timestamp: new Date(Date.now() - 3500000)
  },
  {
    id: '3',
    role: 'assistant',
    content: 'That is completely normal! Let me help you build confidence. Here are some strategies:\n\n1. **Structure your response**: Use the "Opinion-Reason-Example" framework. State your opinion, give one reason, and support it with a personal example.\n\n2. **Practice with a timer**: The independent task gives you 15 seconds to prepare and 45 seconds to speak. Practice daily with these exact timings.\n\n3. **Record yourself**: Use our practice feature to record responses and get AI feedback on pronunciation, fluency, and grammar.\n\nWould you like me to give you a practice question to try right now?',
    timestamp: new Date(Date.now() - 3400000)
  },
  {
    id: '4',
    role: 'user',
    content: 'Yes, give me a practice question!',
    timestamp: new Date(Date.now() - 3300000)
  },
  {
    id: '5',
    role: 'assistant',
    content: 'Here is a typical independent speaking question:\n\n**"Do you agree or disagree with the following statement? It is better to study alone than to study in a group. Use specific reasons and examples to support your answer."**\n\nYou have 15 seconds to prepare. I will time you! Take a moment to think about your opinion and one strong reason with an example.\n\nWhen you are ready, click the microphone button and start speaking. Remember:\n- State your opinion clearly\n- Give one reason\n- Support with a personal example\n- Speak for the full 45 seconds\n\nReady? Go!',
    timestamp: new Date(Date.now() - 3200000)
  }
];

// ============================================
// ANALYTICS DATA
// ============================================

export const skillBreakdown = [
  { skill: 'Reading', score: 85, fullMark: 100 },
  { skill: 'Writing', score: 78, fullMark: 100 },
  { skill: 'Listening', score: 92, fullMark: 100 },
  { skill: 'Speaking', score: 70, fullMark: 100 },
  { skill: 'Grammar', score: 88, fullMark: 100 },
  { skill: 'Vocabulary', score: 82, fullMark: 100 },
];

export const weeklyProgress = [
  { day: 'Mon', minutes: 45, target: 60 },
  { day: 'Tue', minutes: 60, target: 60 },
  { day: 'Wed', minutes: 30, target: 60 },
  { day: 'Thu', minutes: 90, target: 60 },
  { day: 'Fri', minutes: 45, target: 60 },
  { day: 'Sat', minutes: 120, target: 60 },
  { day: 'Sun', minutes: 75, target: 60 },
];

export const scoreHistory = [
  { week: 'W1', score: 65 },
  { week: 'W2', score: 68 },
  { week: 'W3', score: 72 },
  { week: 'W4', score: 70 },
  { week: 'W5', score: 75 },
  { week: 'W6', score: 78 },
  { week: 'W7', score: 82 },
  { week: 'W8', score: 85 },
];

// ============================================
// USER DATA
// ============================================

export const currentUser = {
  id: '1',
  name: 'Valentin Umuhire',
  email: 'umuhirevalentin2004@gmail.com',
  avatar: '/instructor-3.jpg',
  role: 'student' as const,
  level: 12,
  points: 2500,
  streak: 5,
  longestStreak: 12,
  joinedAt: '2024-01-15'
};

// ============================================
// ACHIEVEMENTS
// ============================================

export const achievements = [
  { id: '1', type: 'streak', title: '7-Day Streak', description: 'Studied for 7 consecutive days', points: 100, earnedAt: '2024-02-01' },
  { id: '2', type: 'score', title: 'Score Master', description: 'Achieved 90%+ on a practice test', points: 200, earnedAt: '2024-02-15' },
  { id: '3', type: 'completion', title: 'Course Completer', description: 'Completed first full course', points: 150, earnedAt: '2024-03-01' },
  { id: '4', type: 'social', title: 'Study Buddy', description: 'Joined 3 live classes', points: 75, earnedAt: '2024-03-10' },
  { id: '5', type: 'milestone', title: 'Point Master', description: 'Earned 2,500 total points', points: 250, earnedAt: '2024-03-20' },
];

// ============================================
// DAILY CHALLENGES
// ============================================

export const dailyChallenges = [
  { id: '1', title: 'Watch 2 Video Lessons', description: 'Watch 2 lessons today to build your streak', points: 15, progress: 1, total: 2, completed: false },
  { id: '2', title: 'Complete a Quiz', description: 'Take any practice quiz today', points: 25, progress: 0, total: 1, completed: false },
  { id: '3', title: 'Study for 45 Minutes', description: 'Accumulate 45 minutes of study time', points: 20, progress: 30, total: 45, completed: false },
  { id: '4', title: 'AI Tutor Session', description: 'Have a conversation with the AI tutor', points: 30, progress: 1, total: 1, completed: true },
];

// ============================================
// NOTIFICATIONS
// ============================================

export const notifications = [
  { id: '1', type: 'live_class', title: 'Live Class Starting Soon', message: 'TOEFL Speaking Practice starts in 30 minutes', time: '30 min ago', read: false },
  { id: '2', type: 'achievement', title: 'New Achievement!', message: 'You earned "Point Master" badge', time: '2 hours ago', read: false },
  { id: '3', type: 'progress', title: 'Course Progress', message: 'You completed 75% of DELF B2 Intensive', time: '5 hours ago', read: true },
  { id: '4', type: 'ai_tutor', title: 'AI Tutor Insight', message: 'Your speaking score improved by 8% this week', time: '1 day ago', read: true },
  { id: '5', type: 'reminder', title: 'Study Reminder', message: 'Keep your streak alive! Study today', time: '1 day ago', read: true },
];

// Helper functions
export const getCourseBySlug = (slug: string) => courses.find(c => c.slug === slug);
export const getCourseById = (id: string) => courses.find(c => c.id === id);
export const getInstructorById = (id: string) => instructors.find(i => i.id === id);
export const getCoursesByLanguage = (language: string) => courses.filter(c => c.language === language);
export const getCoursesByCategory = (category: string) => category === 'All' ? courses : courses.filter(c => c.category === category);
