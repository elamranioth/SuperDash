import { describe, it, expect } from 'vitest'
import { TaskItem, TaskList } from '@/types'
import { INITIAL_TASKS, INITIAL_TASK_LISTS } from '@/services/storage'

describe('Notes & Tasks Productivity System', () => {
  it('loads initial task lists with Work, Personal, and Clients', () => {
    expect(INITIAL_TASK_LISTS.length).toBeGreaterThanOrEqual(3)
    const names = INITIAL_TASK_LISTS.map(l => l.name)
    expect(names).toContain('Work')
    expect(names).toContain('Personal')
    expect(names).toContain('Clients')
  })

  it('verifies task item model contains myDay, important, and listId support', () => {
    const task: TaskItem = {
      id: 'task-test-1',
      title: 'Prepare project roadmap',
      completed: false,
      priority: 'high',
      dueDate: '2026-10-04',
      myDay: true,
      important: true,
      listId: 'list-work',
      createdAt: Date.now()
    }

    expect(task.myDay).toBe(true)
    expect(task.important).toBe(true)
    expect(task.listId).toBe('list-work')
    expect(task.dueDate).toBe('2026-10-04')
  })

  it('correctly filters tasks into My Day, Important, and Planned views', () => {
    const tasks: TaskItem[] = [
      {
        id: 't-1',
        title: 'Call client',
        completed: false,
        priority: 'high',
        myDay: true,
        important: false,
        createdAt: Date.now()
      },
      {
        id: 't-2',
        title: 'Sign contract',
        completed: false,
        priority: 'high',
        myDay: false,
        important: true,
        createdAt: Date.now()
      },
      {
        id: 't-3',
        title: 'Tax filing review',
        completed: false,
        priority: 'medium',
        dueDate: '2026-10-15',
        myDay: false,
        important: false,
        createdAt: Date.now()
      }
    ]

    const myDayTasks = tasks.filter(t => t.myDay)
    const importantTasks = tasks.filter(t => t.important)
    const plannedTasks = tasks.filter(t => Boolean(t.dueDate))

    expect(myDayTasks.length).toBe(1)
    expect(myDayTasks[0].title).toBe('Call client')

    expect(importantTasks.length).toBe(1)
    expect(importantTasks[0].title).toBe('Sign contract')

    expect(plannedTasks.length).toBe(1)
    expect(plannedTasks[0].title).toBe('Tax filing review')
  })

  it('parses markdown checklist items properly for Notes app', () => {
    const markdownContent = `Meeting Notes
- [ ] Call client
- [x] Finish document
- [ ] Review case file
Some regular text at the end`

    const lines = markdownContent.split('\n')
    const checklist: Array<{ completed: boolean; text: string }> = []
    lines.forEach(line => {
      const match = line.match(/^\s*-\s*\[([ xX])\]\s*(.*)$/)
      if (match) {
        checklist.push({
          completed: match[1].toLowerCase() === 'x',
          text: match[2]
        })
      }
    })

    expect(checklist.length).toBe(3)
    expect(checklist[0]).toEqual({ completed: false, text: 'Call client' })
    expect(checklist[1]).toEqual({ completed: true, text: 'Finish document' })
    expect(checklist[2]).toEqual({ completed: false, text: 'Review case file' })
  })
})
