import { Highlight, Quote, ReaderNote } from '@/types'

export const SAMPLE_HIGHLIGHTS: Highlight[] = [
  {
    id: 'hl-1',
    articleId: 'sample-agentic-ai',
    blockId: 'blk-1',
    text: 'now, agentic architectures deliberate, plan, self-correct, and orchestrate complex chains of actions across external environments.',
    color: 'yellow',
    note: 'The core operational difference between traditional LLMs and cognitive agents.',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'hl-2',
    articleId: 'sample-agentic-ai',
    blockId: 'blk-4',
    text: 'True machine intelligence begins not when a model generates an articulate answer, but when it possesses the metacognitive capacity to realize its initial hypothesis was flawed and proactively chooses a different path.',
    color: 'purple',
    note: 'Metacognition and dynamic self-evaluation are key.',
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 'hl-3',
    articleId: 'sample-deep-focus',
    blockId: 'foc-4',
    text: 'Distraction is not a moral failing; it is an environmental design problem.',
    color: 'emerald' as unknown as 'green',
    note: 'Fix the working workspace, not just the willpower.',
    createdAt: Date.now() - 86400000 * 3
  }
]

export const SAMPLE_QUOTES: Quote[] = [
  {
    id: 'qt-1',
    articleId: 'sample-agentic-ai',
    articleTitle: 'The Architecture of Thought: How Agentic Systems Are Redefining Modern Computing',
    articleAuthor: 'Elena Vance & Liam Croft',
    articleUrl: 'https://superdash.local/articles/agentic-systems-future',
    text: 'True machine intelligence begins not when a model generates an articulate answer, but when it possesses the metacognitive capacity to realize its initial hypothesis was flawed and proactively chooses a different path.',
    color: 'purple',
    favorite: true,
    tags: ['AI', 'Architecture', 'Cognition'],
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 'qt-2',
    articleId: 'sample-deep-focus',
    articleTitle: 'The Quiet Mind: Cultivating Deep Focus in an Age of Hyper-Distraction',
    articleAuthor: 'Marcus Sterling',
    articleUrl: 'https://superdash.local/articles/art-of-deep-focus',
    text: 'Distraction is not a moral failing; it is an environmental design problem. If your digital workspace is crowded with infinite notifications, willpower alone will never protect your focus.',
    color: 'green',
    favorite: true,
    tags: ['Focus', 'Productivity', 'Mindset'],
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'qt-3',
    articleId: 'sample-mental-models',
    articleTitle: 'First Principles Thinking: How Great Minds Deconstruct Complex Problems',
    articleAuthor: 'Sophia Chen',
    articleUrl: 'https://superdash.local/articles/first-principles-reasoning',
    text: 'Do not accept common wisdom when constructing solutions. Ask what the physical and mathematical constraints truly are, and disregard everything else as convention.',
    color: 'blue',
    favorite: false,
    tags: ['Reasoning', 'Strategy'],
    createdAt: Date.now() - 86400000 * 5
  }
]

export const SAMPLE_NOTES: ReaderNote[] = [
  {
    id: 'note-1',
    articleId: 'sample-agentic-ai',
    blockId: 'blk-4',
    highlightId: 'hl-2',
    title: 'Metacognition in System Design',
    text: 'We should apply this exact principle to SuperDash agentic loops: instead of one-shot execution, allow subagents to reflect and verify before answering.',
    selectedText: 'True machine intelligence begins not when a model generates an articulate answer, but when it possesses the metacognitive capacity...',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1
  },
  {
    id: 'note-2',
    articleId: 'sample-deep-focus',
    title: 'Workspace Ambient Rules',
    text: 'Clean liquid glass backgrounds reduce cognitive fatigue compared to high contrast sharp borders.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2
  }
]
