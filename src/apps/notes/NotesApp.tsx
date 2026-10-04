import React from 'react'
import PlanApp from '@/apps/plan/PlanApp'

interface NotesAppProps {
  initialNoteId?: string
  createNewNote?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function NotesApp(props: NotesAppProps) {
  return <PlanApp {...props} initialTab="notes" />
}
