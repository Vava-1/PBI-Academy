import { Link } from 'react-router-dom'
import { Brain, Languages, Trophy, Sparkles, Video, Users, Target, Zap, BookOpen, Globe, GraduationCap, ArrowRight, CheckCircle, Star } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">PBI Academy</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
            Sign In
          </Link>
          <Link to="/register" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            AI-Powered Language Learning Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Master Languages & Ace Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
              Certification Exams
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Prepare for TOEFL, IELTS, Duolingo, DELF, TCF, TEF, Goethe, and more with personalized AI tutoring,
            realistic mock tests, and expert-led live classes.
          </p>
          <div className="flex justify-center gap-4 mb-12">
            <Link to="/register" className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition flex items-center gap-2">
              Start Learning Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/courses" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 transition">
              Explore Courses
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <StatItem number="10+" label="Exam Types" />
            <StatItem number="4" label="Languages" />
            <StatItem number="500+" label="Video Lessons" />
            <StatItem number="50+" label="Expert Instructors" />
          </div>
        </div>
      </section>

      {/* Language Tests Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Exam Preparation We Offer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive preparation for all major language certification exams
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <ExamCard
              title="English Tests"
              icon={<Globe className="h-6 w-6" />}
              exams={['TOEFL iBT', 'IELTS Academic', 'IELTS General', 'Duolingo English Test']}
              color="blue"
            />
            <ExamCard
              title="French Tests"
              icon={<GraduationCap className="h-6 w-6" />}
              exams={['DELF A1-C2', 'DALF C1-C2', 'TCF Canada', 'TCF Quebec', 'TEF Canada']}
              color="purple"
            />
            <ExamCard
              title="German Tests"
              icon={<BookOpen className="h-6 w-6" />}
              exams={['Goethe-Zertifikat', 'TestDaF', 'DSH', 'Telc Deutsch']}
              color="green"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose PBI Academy?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed in your language learning journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={Sparkles}
              title="AI-Powered Tutor"
              description="Get instant help from our AI tutor trained on official exam standards. Available 24/7 to answer your questions."
              color="primary"
            />
            <FeatureCard
              icon={Trophy}
              title="Realistic Exam Simulation"
              description="Practice with mock tests that mimic the actual exam environment with timed sections and AI-graded responses."
              color="yellow"
            />
            <FeatureCard
              icon={Video}
              title="Video Courses & Docs"
              description="Learn at your own pace with comprehensive video lessons and written documentation from expert instructors."
              color="blue"
            />
            <FeatureCard
              icon={Users}
              title="Live Classes"
              description="Join live sessions with expert instructors 3x per week for interactive learning and Q&A."
              color="green"
            />
            <FeatureCard
              icon={Target}
              title="Performance Tracking"
              description="Track your progress with detailed analytics, AI-powered insights, and personalized recommendations."
              color="purple"
            />
            <FeatureCard
              icon={Languages}
              title="Multi-Language Support"
              description="Learn English, French, German, and Kiswahili from beginner to advanced levels."
              color="red"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Start your language learning journey in 3 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              step="1"
              title="Choose Your Path"
              description="Select your target language and exam. We'll create a personalized learning plan for you."
              icon={<Target className="h-8 w-8" />}
            />
            <StepCard
              step="2"
              title="Learn & Practice"
              description="Study with video courses, take mock tests, and get AI feedback on your progress."
              icon={<BookOpen className="h-8 w-8" />}
            />
            <StepCard
              step="3"
              title="Ace Your Exam"
              description="Join live classes, track your progress, and confidently take your certification exam."
              icon={<Trophy className="h-8 w-8" />}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
            <p className="text-primary-100 mb-8 text-lg">
              Join thousands of students who have successfully passed their language exams with PBI Academy
            </p>
            <Link to="/register" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition inline-flex items-center gap-2">
              Start Your Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-6 w-6" />
                <span className="text-xl font-bold">PBI Academy</span>
              </div>
              <p className="text-gray-400">
                Empowering students to achieve their language learning goals with AI-powered education.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Languages</h4>
              <ul className="space-y-2 text-gray-400">
                <li>English</li>
                <li>French</li>
                <li>German</li>
                <li>Kiswahili</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Exams</h4>
              <ul className="space-y-2 text-gray-400">
                <li>TOEFL & IELTS</li>
                <li>DELF & DALF</li>
                <li>TCF & TEF</li>
                <li>Goethe & TestDaF</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Pacemaker Business Institute. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatItem({ number, label }: { number: string, label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-gray-900">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
}

function ExamCard({ title, icon, exams, color }: { title: string, icon: React.ReactNode, exams: string[], color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200',
  }
  
  return (
    <div className={`card p-6 border-2 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-white">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-2">
        {exams.map((exam) => (
          <li key={exam} className="flex items-center gap-2 text-gray-700">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            {exam}
          </li>
        ))}
      </ul>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: typeof Sparkles, title: string, description: string, color: string }) {
  const colors: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  }
  
  return (
    <div className="card p-6">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gray-100 mb-4">
        <Icon className="h-7 w-7 text-gray-700" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({ step, title, description, icon }: { step: string, title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
        {icon}
      </div>
      <div className="inline-block bg-primary-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-3">
        Step {step}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
