import React from 'react'
import RoleSelect from '@/modules/cyber-clinic/views/RoleSelect'
import RoleShell from '@/modules/cyber-clinic/views/RoleShell'
import Student from '@/modules/cyber-clinic/views/roles/Student/Student'
import Teacher from '@/modules/cyber-clinic/views/roles/Teacher/Teacher'
import Business from '@/modules/cyber-clinic/views/roles/Business/Business'
import bgStudent from '@/modules/cyber-clinic/imgs/banners/hero-student.png'
import bgTeacher from '@/modules/cyber-clinic/imgs/banners/hero-teacher.jpg'
import bgBusiness from '@/modules/cyber-clinic/imgs/banners/hero-business.jpg'

type PageProps = {
  searchParams?: Promise<{
    user?: string
  }>
}

const ROLE_KEYS = new Set(['student', 'teacher', 'business'])
const ROLE_BG = {
  student: {
    image: bgStudent.src,
    backgroundSize: 'contain',
    alt: 'Cyber Clinic student hero',
  },
  teacher: {
    image: bgTeacher.src,
    backgroundSize: 'cover',
    alt: 'Cyber Clinic teacher hero',
  },
  business: {
    image: bgBusiness.src,
    backgroundSize: 'cover',
    alt: 'Cyber Clinic business hero',
  },
} as const

export default async function CyberClinicPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const userKey = (resolvedParams?.user || '').toLowerCase()
  const hasRole = ROLE_KEYS.has(userKey)

  if (!hasRole) {
    return <RoleSelect />
  }

  const roleBg = ROLE_BG[userKey as keyof typeof ROLE_BG] ?? ROLE_BG.student

  return (
    <RoleShell
      backgroundImage={roleBg.image}
      backgroundSize={roleBg.backgroundSize}
      imageAlt={roleBg.alt}
      userKey={userKey}
    >
      {userKey === 'student' && <Student />}
      {userKey === 'teacher' && <Teacher />}
      {userKey === 'business' && <Business />}
    </RoleShell>
  )
}
