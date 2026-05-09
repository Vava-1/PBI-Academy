import { ReactNode } from 'react'

interface ExamLayoutProps {
  children: ReactNode
}

export function ExamLayout({ children }: ExamLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}
