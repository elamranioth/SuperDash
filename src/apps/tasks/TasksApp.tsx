import React from 'react'
import PlanApp from '@/apps/plan/PlanApp'

interface TasksAppProps {
  initialFilter?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function TasksApp(props: TasksAppProps) {
  return <PlanApp {...props} initialTab="tasks" />
}
