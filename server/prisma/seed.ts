import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed instructors
  const instructors = await Promise.all([
    prisma.instructor.upsert({
      where: { id: 'inst_1' },
      update: {},
      create: {
        id: 'inst_1',
        name: 'Dr. Sarah Mitchell',
        title: 'Senior English Exam Strategist',
        languages: 'English',
        image: '/instructor-1.jpg',
        bio: 'Former IELTS examiner with 15+ years of experience.',
        students: 2150,
        courses: 8,
        rating: 4.9,
      },
    }),
    prisma.instructor.upsert({
      where: { id: 'inst_2' },
      update: {},
      create: {
        id: 'inst_2',
        name: 'Prof. Jean-Pierre Dubois',
        title: 'DELF/TCF Master Instructor',
        languages: 'French, English',
        image: '/instructor-2.jpg',
        bio: 'Certified DELF examiner and former Alliance Francaise director.',
        students: 1890,
        courses: 6,
        rating: 4.8,
      },
    }),
    prisma.instructor.upsert({
      where: { id: 'inst_3' },
      update: {},
      create: {
        id: 'inst_3',
        name: 'Hans Weber',
        title: 'German Language Specialist',
        languages: 'German, English',
        image: '/instructor-3.jpg',
        bio: 'Goethe-Institut certified instructor with focus on TestDaF.',
        students: 1450,
        courses: 5,
        rating: 4.7,
      },
    }),
    prisma.instructor.upsert({
      where: { id: 'inst_4' },
      update: {},
      create: {
        id: 'inst_4',
        name: 'Mama Amina',
        title: 'Kiswahili Cultural Educator',
        languages: 'Kiswahili, English',
        image: '/instructor-4.jpg',
        bio: 'Native Kiswahili speaker and East African languages researcher.',
        students: 980,
        courses: 3,
        rating: 4.9,
      },
    }),
  ])

  // Seed courses
  const coursesData = [
    {
      title: 'TOEFL iBT Complete Prep',
      slug: 'toefl-ibt-complete',
      description: 'Comprehensive preparation for the TOEFL iBT exam.',
      language: 'english', testType: 'TOEFL', level: 'intermediate',
      image: '/course-toefl.jpg', durationHours: 40, lessonsCount: 120,
      studentsCount: 850, instructorId: 'inst_1', price: 4900, rating: 4.8, category: 'English',
    },
    {
      title: 'IELTS Academic Mastery',
      slug: 'ielts-academic-mastery',
      description: 'Master the IELTS Academic exam with targeted strategies.',
      language: 'english', testType: 'IELTS', level: 'advanced',
      image: '/course-ielts.jpg', durationHours: 35, lessonsCount: 95,
      studentsCount: 720, instructorId: 'inst_1', price: 5900, rating: 4.9, category: 'English',
    },
    {
      title: 'Duolingo English Test Prep',
      slug: 'duolingo-english-test',
      description: 'Prepare for the Duolingo English Test.',
      language: 'english', testType: 'Duolingo', level: 'intermediate',
      image: '/course-duolingo.jpg', durationHours: 20, lessonsCount: 60,
      studentsCount: 430, instructorId: 'inst_1', price: 2900, rating: 4.6, category: 'English',
    },
    {
      title: 'DELF B2 Intensive Course',
      slug: 'delf-b2-intensive',
      description: 'Intensive preparation for DELF B2 certification.',
      language: 'french', testType: 'DELF', level: 'advanced',
      image: '/course-french.jpg', durationHours: 35, lessonsCount: 95,
      studentsCount: 620, instructorId: 'inst_2', price: 5400, rating: 4.8, category: 'French',
    },
    {
      title: 'TCF Canada Complete Guide',
      slug: 'tcf-canada-complete',
      description: 'Full preparation for TCF Canada immigration requirements.',
      language: 'french', testType: 'TCF Canada', level: 'intermediate',
      image: '/course-french.jpg', durationHours: 30, lessonsCount: 80,
      studentsCount: 380, instructorId: 'inst_2', price: 4900, rating: 4.7, category: 'French',
    },
    {
      title: 'TEF Canada Preparation',
      slug: 'tef-canada-prep',
      description: 'Prepare for TEF Canada with focus on immigration scores.',
      language: 'french', testType: 'TEF Canada', level: 'intermediate',
      image: '/course-french.jpg', durationHours: 28, lessonsCount: 75,
      studentsCount: 290, instructorId: 'inst_2', price: 4900, rating: 4.6, category: 'French',
    },
    {
      title: 'TestDaF Preparation Course',
      slug: 'testdaf-prep',
      description: 'Comprehensive TestDaF exam preparation.',
      language: 'german', testType: 'TestDaF', level: 'advanced',
      image: '/course-german.jpg', durationHours: 45, lessonsCount: 110,
      studentsCount: 510, instructorId: 'inst_3', price: 6200, rating: 4.8, category: 'German',
    },
    {
      title: 'Goethe-Zertifikat B2 Course',
      slug: 'goethe-b2-course',
      description: 'Prepare for Goethe-Zertifikat B2.',
      language: 'german', testType: 'Goethe', level: 'intermediate',
      image: '/course-german.jpg', durationHours: 32, lessonsCount: 85,
      studentsCount: 340, instructorId: 'inst_3', price: 4800, rating: 4.7, category: 'German',
    },
    {
      title: 'Kiswahili Proficiency Masterclass',
      slug: 'kiswahili-masterclass',
      description: 'Master Kiswahili for academic and professional use.',
      language: 'kiswahili', testType: 'Kiswahili', level: 'beginner',
      image: '/course-kiswahili.jpg', durationHours: 25, lessonsCount: 70,
      studentsCount: 760, instructorId: 'inst_4', price: 3500, rating: 4.9, category: 'Kiswahili',
    },
  ]

  for (const c of coursesData) {
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: c as any,
    })
    // Seed a few lessons per course
    const existingLessons = await prisma.lesson.count({ where: { courseId: course.id } })
    if (existingLessons === 0) {
      await prisma.lesson.createMany({
        data: Array.from({ length: Math.min(c.lessonsCount, 5) }, (_, i) => ({
          courseId: course.id,
          title: `Lesson ${i + 1}: ${c.title} - Module ${i + 1}`,
          content: `Detailed content for lesson ${i + 1} of ${c.title}.`,
          order: i + 1,
          durationMin: 20 + i * 5,
        })),
      })
    }
  }

  // Seed live classes
  const liveClassData = [
    {
      title: 'TOEFL Speaking Workshop',
      description: 'Live practice session for TOEFL Speaking section.',
      courseId: 'placeholder',
      instructorId: 'inst_1',
      scheduledAt: new Date(Date.now() + 86400000),
      durationMinutes: 90,
      status: 'scheduled' as const,
      maxStudents: 30,
      roomUrl: 'https://daily.co/toefl-speaking-workshop',
    },
    {
      title: 'IELTS Writing Feedback Session',
      description: 'Get real-time feedback on your IELTS essays.',
      courseId: 'placeholder',
      instructorId: 'inst_1',
      scheduledAt: new Date(Date.now() + 172800000),
      durationMinutes: 120,
      status: 'scheduled' as const,
      maxStudents: 20,
      roomUrl: 'https://daily.co/ielts-writing-feedback',
    },
    {
      title: 'DELF Oral Expression Practice',
      description: 'Practice DELF B2 oral expression with native speakers.',
      courseId: 'placeholder',
      instructorId: 'inst_2',
      scheduledAt: new Date(Date.now() + 259200000),
      durationMinutes: 60,
      status: 'scheduled' as const,
      maxStudents: 15,
      roomUrl: 'https://daily.co/delf-oral-practice',
    },
  ]

  const toeflCourse = await prisma.course.findUnique({ where: { slug: 'toefl-ibt-complete' } })
  const ieltsCourse = await prisma.course.findUnique({ where: { slug: 'ielts-academic-mastery' } })
  const delfCourse = await prisma.course.findUnique({ where: { slug: 'delf-b2-intensive' } })

  const classMap = [
    { ...liveClassData[0], courseId: toeflCourse?.id },
    { ...liveClassData[1], courseId: ieltsCourse?.id },
    { ...liveClassData[2], courseId: delfCourse?.id },
  ]

  for (const lc of classMap) {
    if (!lc.courseId) continue
    await prisma.liveClass.upsert({
      where: { id: `lc_${lc.title.slice(0, 10).replace(/\s/g, '_')}` },
      update: {},
      create: {
        id: `lc_${lc.title.slice(0, 10).replace(/\s/g, '_')}`,
        title: lc.title,
        description: lc.description,
        courseId: lc.courseId,
        instructorId: lc.instructorId,
        scheduledAt: lc.scheduledAt,
        durationMinutes: lc.durationMinutes,
        status: lc.status,
        maxStudents: lc.maxStudents,
        roomUrl: lc.roomUrl,
      } as any,
    })
  }

  // Seed achievements
  const achievements = [
    { title: 'First Steps', description: 'Complete your first lesson', icon: 'footprints', points: 50 },
    { title: 'Streak Starter', description: 'Maintain a 3-day study streak', icon: 'flame', points: 100 },
    { title: 'Course Finisher', description: 'Complete your first course', icon: 'award', points: 250 },
    { title: 'Top 10%', description: 'Reach the top 10% on the leaderboard', icon: 'trophy', points: 500 },
  ]

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { id: `ach_${a.title.replace(/\s/g, '_').toLowerCase()}` },
      update: {},
      create: {
        id: `ach_${a.title.replace(/\s/g, '_').toLowerCase()}`,
        ...a,
      },
    })
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
