import { Article } from '@/types'

export const SAMPLE_ARTICLES: Article[] = [
  {
    id: 'sample-agentic-ai',
    url: 'https://superdash.local/articles/agentic-systems-future',
    title: 'The Architecture of Thought: How Agentic Systems Are Redefining Modern Computing',
    author: 'Elena Vance & Liam Croft',
    publication: 'Emergent Systems Quarterly',
    publishedAt: '2026-04-12',
    readingTimeMinutes: 5,
    wordCount: 1040,
    excerpt: 'The transition from passive language models to proactive cognitive architectures marks the most decisive paradigm shift in software engineering since the invention of the graphical user interface.',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    status: 'READING',
    favorite: true,
    scrollProgress: 18,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
    lastReadAt: Date.now() - 3600000 * 4,
    blocks: [
      {
        id: 'blk-1',
        type: 'paragraph',
        text: 'The transition from passive language models to proactive cognitive architectures marks the most decisive paradigm shift in software engineering since the invention of the graphical user interface. For decades, computers waited for human commands; now, agentic architectures deliberate, plan, self-correct, and orchestrate complex chains of actions across external environments.'
      },
      {
        id: 'blk-2',
        type: 'h2',
        text: 'From Static Prompting to Dynamic Reasoning Loops'
      },
      {
        id: 'blk-3',
        type: 'paragraph',
        text: 'Traditional software applications were deterministic state machines. You clicked a button, a predefined function fired, and a predictable database transaction completed. Large language models disrupted this by introducing probabilistic semantic completion. Yet, single-shot completion suffered from severe hallucinations and an inability to adapt when facts evolved.'
      },
      {
        id: 'blk-4',
        type: 'blockquote',
        text: 'True machine intelligence begins not when a model generates an articulate answer, but when it possesses the metacognitive capacity to realize its initial hypothesis was flawed and proactively chooses a different path.'
      },
      {
        id: 'blk-5',
        type: 'paragraph',
        text: 'Agentic workflows solve this vulnerability through feedback loops. Instead of providing an immediate answer, an agent formulates an internal plan, validates each hypothesis against real-world tools, inspects intermediate outputs, and continuously refines its trajectory.'
      },
      {
        id: 'blk-6',
        type: 'h2',
        text: 'The Three Pillars of Autonomous Workflows'
      },
      {
        id: 'blk-7',
        type: 'list',
        items: [
          'Episodic & Semantic Memory: Separating short-term working context from durable long-term vector stores allows agents to retain context across days and weeks.',
          'Tool Grounding: Direct interface synthesis enabling models to interact with APIs, databases, shells, and file systems safely.',
          'Reflective Self-Evaluation: Critic sub-agents that scrutinize drafts, detect edge cases, and execute unit tests prior to delivering finalized artifacts.'
        ]
      },
      {
        id: 'blk-8',
        type: 'paragraph',
        text: 'As these capabilities mature, human developers are transitioning from writing low-level imperative syntax to becoming directors and system architects. The challenge of the coming decade is not whether software can reason, but how we design glass-box environments that provide complete transparency, auditability, and agency to human operators.'
      }
    ]
  },
  {
    id: 'sample-deep-focus',
    url: 'https://superdash.local/articles/art-of-deep-focus',
    title: 'The Quiet Mind: Cultivating Deep Focus in an Age of Hyper-Distraction',
    author: 'Marcus Sterling',
    publication: 'Cognitive Architecture Review',
    publishedAt: '2026-03-28',
    readingTimeMinutes: 4,
    wordCount: 820,
    excerpt: 'Attention is the ultimate scarce currency of the knowledge economy. The ability to concentrate without interruption on demanding cognitive tasks is rapidly becoming the defining professional advantage.',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    status: 'UNREAD',
    favorite: true,
    scrollProgress: 0,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
    blocks: [
      {
        id: 'foc-1',
        type: 'paragraph',
        text: 'Attention is the ultimate scarce currency of the knowledge economy. Every modern application, notification badge, and social feed is ruthlessly engineered to fragment human focus into thirty-second dopamine intervals. In this chaotic digital landscape, the ability to concentrate without interruption on demanding cognitive tasks is rapidly becoming the defining professional advantage.'
      },
      {
        id: 'foc-2',
        type: 'h2',
        text: 'The Neurobiology of Attention Switching'
      },
      {
        id: 'foc-3',
        type: 'paragraph',
        text: 'When you switch from writing an analytical report to glancing at a new notification, your brain does not instantaneously pivot. A cognitive residue lingers on the previous stimulus. Studies demonstrate that it takes upwards of twenty-three minutes to regain absolute flow after an interruption.'
      },
      {
        id: 'foc-4',
        type: 'blockquote',
        text: 'Distraction is not a moral failing; it is an environmental design problem. If your digital workspace is crowded with infinite notifications, willpower alone will never protect your focus.'
      },
      {
        id: 'foc-5',
        type: 'h2',
        text: 'Constructing a Distraction-Free Digital Sanctuary'
      },
      {
        id: 'foc-6',
        type: 'list',
        items: [
          'Ruthless Asynchronous Communication: Batch communication into two dedicated daily windows rather than leaving chat channels open continuously.',
          'Clean Visual Interfaces: Minimize visual clutter on desktop dashboards. Use liquid glass aesthetics and soft ambient backgrounds that calm the optical cortex.',
          'Ritualized Work Blocks: Protect ninety-minute blocks of unbroken deep work where all external inputs are decisively silenced.'
        ]
      },
      {
        id: 'foc-7',
        type: 'paragraph',
        text: 'By deliberately structuring your physical and virtual environments, you reclaim mastery over your cognitive faculties. Clarity of thought is not an accident of genetics—it is a conscious discipline of space and time.'
      }
    ]
  },
  {
    id: 'sample-mental-models',
    url: 'https://superdash.local/articles/first-principles-reasoning',
    title: 'First Principles Thinking: How Great Minds Deconstruct Complex Problems',
    author: 'Sophia Chen',
    publication: 'Foundations of Strategy',
    publishedAt: '2026-02-15',
    readingTimeMinutes: 4,
    wordCount: 780,
    excerpt: 'Most people reason by analogy: copying what others have done with slight tweaks. First principles thinking forces you to boil a problem down to its most fundamental truths.',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    status: 'FINISHED',
    favorite: false,
    scrollProgress: 100,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 6,
    lastReadAt: Date.now() - 86400000 * 6,
    blocks: [
      {
        id: 'mm-1',
        type: 'paragraph',
        text: 'Most people reason by analogy: copying what others have done with slight tweaks. Reasoning by analogy is cognitively economical—it saves mental energy by piggybacking on collective convention. However, when you face novel frontiers or systemic stagnation, analogy breeds mediocrity.'
      },
      {
        id: 'mm-2',
        type: 'h2',
        text: 'The Socratic Dissection'
      },
      {
        id: 'mm-3',
        type: 'paragraph',
        text: 'First principles thinking forces you to boil a problem down to its most fundamental, indisputable truths, and then reason upward from there. Aristotle described a first principle as "the first basis from which a thing is known."'
      },
      {
        id: 'mm-4',
        type: 'blockquote',
        text: 'Do not accept common wisdom when constructing solutions. Ask what the physical and mathematical constraints truly are, and disregard everything else as convention.'
      },
      {
        id: 'mm-5',
        type: 'paragraph',
        text: 'When Elon Musk sought to build rockets at SpaceX, experts declared that aerospace hardware was inherently unaffordable. By stripping the rocket down to its basic raw elements—aluminum alloys, titanium, copper, and rocket-grade carbon fiber—he discovered raw material costs were merely two percent of the retail ticket price of a conventional launch.'
      },
      {
        id: 'mm-6',
        type: 'paragraph',
        text: 'Apply this discipline to your everyday challenges: identify your core assumptions, challenge their necessity, and assemble an original architecture built on bedrock truths.'
      }
    ]
  }
]
