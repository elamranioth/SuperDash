import { ComponentType } from 'react'

export type AppCategory = 'productivity' | 'utilities' | 'business' | 'custom' | 'legal'

export interface AppDefinition {
  id: string
  name: string
  description: string
  icon: ComponentType<{ className?: string }>
  category: AppCategory
  keywords: string[]
  gradient: string
  defaultWindowSize?: {
    width: number
    height: number
  }
}

export interface AppWindowProps {
  appId: string
  onClose: () => void
  onMinimize: () => void
  isMaximized: boolean
}

export interface WindowState {
  id: string
  appId: string
  title: string
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  position?: { x: number; y: number }
  size?: { width: number; height: number }
}

export type ThemeMode = 'dark' | 'light' | 'system'

export type WallpaperCategory = 'gradient' | 'abstract' | 'solid' | 'image' | 'custom'

export interface WallpaperItem {
  id: string
  name: string
  category: WallpaperCategory
  value: string // CSS gradient, hex color, image URL or data URI
  preview: string
}

export type WidgetSize = 'sm' | 'md' | 'lg'

export interface DashboardWidgetConfig {
  instanceId: string
  widgetId: string
  size: WidgetSize
  order: number
  customTitle?: string
}

export type TimerVisualMode = 'hourglass' | 'liquid_ring' | 'minimal' | 'digital'
export type TimerSound = 'soft_bell' | 'glass_chime' | 'digital' | 'gong' | 'none'
export type TimerAppMode = 'countdown' | 'stopwatch' | 'pomodoro' | 'interval'

export interface TimerPreset {
  id: string
  label: string
  durationSeconds: number
  category?: 'focus' | 'break' | 'work' | 'custom'
}

export interface PomodoroConfig {
  focusMinutes: number
  breakMinutes: number
  longBreakMinutes: number
  roundsTotal: number
  autoStart: boolean
}

export interface IntervalConfig {
  workMinutes: number
  breakMinutes: number
  repeatCycles: number
}

export interface DashboardSettings {
  theme: ThemeMode
  clockFormat: '12h' | '24h'
  showSeconds: boolean
  weatherLocation: string
  weatherCoordinates?: { lat: number; lon: number }
  weatherUnit: 'celsius' | 'fahrenheit'
  wallpaper: string
  wallpaperCategory?: WallpaperCategory
  customWallpaperData?: string
  dockPosition: 'bottom' | 'hidden'
  hiddenAppIds: string[]
  appOrder: string[]
  // Liquid Glass customization
  glassOpacity: number // 10 to 95
  glassBlur: number // 8 to 40
  visualIntensity: 'subtle' | 'balanced' | 'intense'
  reducedMotion: boolean
  soundEnabled: boolean
  timerSound: TimerSound
  timerSandSound: boolean
  timerVisualMode: TimerVisualMode
  // Widgets layout
  activeWidgets: DashboardWidgetConfig[]
  marketPairs: string[] // IDs like 'BTC-USD', 'AED-MAD', 'USD-AED'
  selectedCurrencies: string[] // Codes like 'AED', 'EUR', 'GBP', 'MAD', 'PHP'
  worldClockCities: string[] // e.g. ['Dubai', 'London', 'New York', 'Tokyo']
  favoriteAppIds: string[]
  recentAppIds: string[]
  showRecentApps: boolean
}

export interface WeatherData {
  city: string
  temperature: number
  condition: string
  description: string
  icon: string
  highTemp: number
  lowTemp: number
  humidity: number
  windSpeed: number
  pressure: number
  uvIndex: number
  feelsLike: number
  hourlyForecast: Array<{
    time: string
    temp: number
    icon: string
  }>
  dailyForecast: Array<{
    day: string
    date: string
    tempMax: number
    tempMin: number
    condition: string
    icon: string
  }>
}

export interface NoteItem {
  id: string
  title: string
  content: string
  color: string
  isPinned: boolean
  createdAt: number
  updatedAt: number
  tags: string[]
}

export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskItem {
  id: string
  title: string
  completed: boolean
  priority: TaskPriority
  dueDate?: string
  tag?: string
  createdAt: number
  reminderTime?: string // e.g. "14:30"
  notes?: string
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly'
  hasReminder?: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  startTime?: string // HH:mm
  endTime?: string // HH:mm
  color: string
  description?: string
  allDay?: boolean
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly'
}

export interface ReminderItem {
  id: string
  title: string
  date: string
  time?: string
  notes?: string
  repeat: 'none' | 'daily' | 'weekly' | 'monthly'
  completed: boolean
  priority: TaskPriority
  createdAt: number
}

export interface DocumentItem {
  id: string
  name: string
  sizeBytes: number
  type: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'code' | 'pdf' | 'note'
  category: string
  isFavorite: boolean
  updatedAt: number
  contentSnippet?: string
}

export interface MarketPairData {
  id: string
  base: string
  quote: string
  name: string
  isCrypto: boolean
  price: number
  change24h: number
  high24h?: number
  low24h?: number
  sparkline?: number[]
  lastUpdated: number
  status: 'live' | 'cached' | 'error'
}

export interface CurrencyData {
  code: string
  name: string
  symbol: string
  rateAgainstUSD: number
  flag: string
}

export interface SearchResultItem {
  id: string
  type:
    | 'app'
    | 'note'
    | 'task'
    | 'calendar'
    | 'calc'
    | 'convert'
    | 'command'
    | 'market'
    | 'reminder'
    | 'file'
    | 'hearing'
    | 'finance'
    | 'idea'
    | 'decision'
    | 'focus'
    | 'morning'
    | 'reader'
    | 'live'
    | 'collection'
    | 'collection_item'
    | 'dashboard'
  title: string
  subtitle: string
  icon: ComponentType<{ className?: string }>
  action: () => void
  categoryLabel: string
  badge?: string
}

export interface CommandItem {
  id: string
  title: string
  description: string
  category: 'apps' | 'system' | 'timer' | 'tools' | 'convert' | 'preferences' | 'productivity'
  keywords: string[]
  icon: ComponentType<{ className?: string }>
  shortcut?: string
  execute: () => void
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'calendar' | 'task' | 'timer'
  timestamp: number
  read: boolean
  actionLabel?: string
  actionAppId?: string
}

export interface WidgetSettingField {
  id: string
  label: string
  type: 'boolean' | 'select' | 'text' | 'number' | 'range'
  defaultValue?: unknown
  options?: Array<{ label: string; value: string | number }>
  min?: number
  max?: number
  step?: number
}

export interface WidgetSettingsSchema {
  fields: WidgetSettingField[]
}

export interface WidgetDefinition {
  id: string
  name: string
  description: string
  icon: ComponentType<{ className?: string }>
  defaultSize: WidgetSize
  supportedSizes: WidgetSize[]
  category: 'finance' | 'productivity' | 'clock' | 'weather' | 'tools' | 'legal' | 'personal' | 'information' | 'business' | 'essential'
  settingsSchema?: WidgetSettingsSchema
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export type HearingStatus =
  | 'Upcoming'
  | 'Today'
  | 'Completed'
  | 'Adjourned'
  | 'Reserved for Judgment'
  | 'Cancelled'

export type HearingReminder = 'none' | '1_day' | '2_days' | '3_days' | '1_week' | 'custom'

export interface Hearing {
  id: string
  clientId?: string
  clientName: string
  caseId?: string
  caseNumber: string
  caseType?: string
  court?: string
  hearingDate: string // YYYY-MM-DD
  hearingTime?: string // HH:mm
  decision?: string
  nextHearingDate?: string // YYYY-MM-DD
  status: HearingStatus
  notes?: string
  reminder?: HearingReminder
  createdAt: number
  updatedAt: number
}

// ==================== FINANCE DATA MODELS ====================

export interface Client {
  id: string
  name: string
  companyName?: string
  phone?: string
  email?: string
  address?: string
  taxNumber?: string // TRN / Tax Number
  notes?: string
  isArchived?: boolean
  createdAt: number
  updatedAt: number
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export type InvoiceStatus =
  | 'Draft'
  | 'Issued'
  | 'Unpaid'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled'

export interface Invoice {
  id: string
  invoiceNumber: string // e.g. 2026/1
  clientId: string
  invoiceDate: string // YYYY-MM-DD
  dueDate: string // YYYY-MM-DD
  currency: string // default 'AED'
  items: InvoiceItem[]
  subtotal: number
  discount: number
  taxRate: number // percentage e.g. 5
  taxAmount: number
  total: number
  status: InvoiceStatus
  notes?: string
  createdAt: number
  updatedAt: number
}

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Other'

export interface Payment {
  id: string
  receiptNumber: string // e.g. REC-2026/1
  invoiceId: string
  clientId: string
  amount: number
  currency: string
  paymentDate: string // YYYY-MM-DD
  paymentMethod: PaymentMethod
  reference?: string
  notes?: string
  createdAt: number
}

export interface Expense {
  id: string
  date: string // YYYY-MM-DD
  category: string
  description: string
  amount: number
  currency: string
  paymentMethod: string
  vendor?: string
  reference?: string
  notes?: string
  attachmentId?: string
  createdAt: number
  updatedAt: number
}

export interface FinanceBusinessSettings {
  businessName: string
  arabicBusinessName?: string
  address: string
  phone: string
  email: string
  taxNumber?: string // TRN / VAT registration number
  defaultCurrency: string
  defaultVatRate: number
  invoicePrefix: string
  nextInvoiceSeq: number
}

// ==================== IDEAS DATA MODELS ====================

export type IdeaStatus = 'INBOX' | 'EXPLORING' | 'PLANNED' | 'IN PROGRESS' | 'DONE' | 'ARCHIVED'
export type IdeaPriority = 'low' | 'medium' | 'high'

export interface IdeaItem {
  id: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  status: IdeaStatus
  priority?: IdeaPriority
  favorite: boolean
  createdAt: number
  updatedAt: number
  archivedAt?: number
}

// ==================== FOCUS DATA MODELS ====================

export interface FocusSession {
  id: string
  title: string
  durationPlanned: number // in seconds
  durationCompleted: number // in seconds
  startedAt: number
  endedAt: number
  completed: boolean
  notes?: string
}

export interface FocusSettings {
  dailyGoalMinutes: number // default: 120 (2h)
  dailyMinimumMinutes: number // default: 25 (minimum session for streak)
  streakEnabled: boolean // default: true
  visualMode: TimerVisualMode
}

// ==================== DECISION BOOK DATA MODELS ====================

export type DecisionStatus = 'ACTIVE' | 'WAITING FOR OUTCOME' | 'REVIEW DUE' | 'REVIEWED' | 'ARCHIVED'
export type DecisionRating = 'BETTER THAN EXPECTED' | 'AS EXPECTED' | 'WORSE THAN EXPECTED' | 'TOO EARLY TO KNOW'

export interface DecisionItem {
  id: string
  title: string // "What decision are you making?"
  context?: string // "What is happening?"
  decision: string // Chosen option/direction
  options?: string[] // Alternatives considered
  reasons?: string[] // Why I chose this
  risks?: string[] // What could go wrong
  expectedOutcome?: string // What do I expect to happen?
  confidence?: number // 50, 60, 70, 80, 90, 95 or custom
  category: string // Business, Technology, Financial, Career, Personal, Project, Other, etc.
  decisionDate: string // YYYY-MM-DD
  reviewDate: string // YYYY-MM-DD
  actualOutcome?: string // What actually happened?
  lessons?: string // Lessons learned
  repeatDecision?: 'Yes' | 'No' | 'Not Sure' // Would I make the same decision again?
  resultRating?: DecisionRating
  status: DecisionStatus
  createdAt: number
  updatedAt: number
  reviewedAt?: number
}

// ==================== MORNING DATA MODELS ====================

export type MorningSectionId =
  | 'priorities'
  | 'focus'
  | 'hearings'
  | 'tasks'
  | 'calendar'
  | 'reminders'
  | 'finance'
  | 'markets'
  | 'decisions'
  | 'idea'
  | 'note'

export interface MorningPriorityItem {
  id: string
  text: string
  completed: boolean
}

export interface MorningDayData {
  date: string // YYYY-MM-DD
  priorities: MorningPriorityItem[]
  note: string
}

export interface MorningPreferences {
  sectionOrder: MorningSectionId[]
  hiddenSections: MorningSectionId[]
  showIdeaOfTheDay: boolean
}

// ==================== READER DATA MODELS ====================

export type ReadingStatus = 'UNREAD' | 'READING' | 'FINISHED' | 'ARCHIVED'
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'rose' | 'purple'
export type ReaderFontFamily = 'sans' | 'serif' | 'mono'
export type ReaderThemeMode = 'light' | 'sepia' | 'dark' | 'black'
export type ReaderColumnWidth = 'compact' | 'comfortable' | 'wide'

export interface ArticleBlock {
  id: string
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'blockquote' | 'list' | 'image' | 'code'
  text?: string
  items?: string[] // For list type
  src?: string // For image
  caption?: string
  language?: string
}

export interface Article {
  id: string
  url?: string
  title: string
  author?: string
  publication?: string // domain or publisher
  publishedAt?: string
  readingTimeMinutes: number
  wordCount: number
  excerpt?: string
  coverImage?: string
  blocks: ArticleBlock[]
  rawContent?: string
  status: ReadingStatus
  favorite: boolean
  scrollProgress: number // 0 to 100
  scrollPosition?: number // scrollY in px
  createdAt: number
  updatedAt: number
  lastReadAt?: number
}

export interface Highlight {
  id: string
  articleId: string
  blockId: string
  text: string
  color: HighlightColor
  note?: string
  prefixContext?: string
  suffixContext?: string
  createdAt: number
  updatedAt?: number
}

export interface Quote {
  id: string
  articleId: string
  articleTitle: string
  articleAuthor?: string
  articleUrl?: string
  text: string
  color?: HighlightColor
  sourceDate?: string
  tags?: string[]
  favorite?: boolean
  createdAt: number
}

export interface ReaderNote {
  id: string
  articleId: string
  blockId?: string
  highlightId?: string
  title?: string
  text: string
  selectedText?: string
  createdAt: number
  updatedAt: number
}

export interface TranslationCacheItem {
  id: string
  sourceText: string
  targetText: string
  sourceLang: string
  targetLang: string
  createdAt: number
}

export interface ReaderSettings {
  fontFamily: ReaderFontFamily
  fontSize: number // 15, 17, 19, 22
  lineHeight: number // 1.5, 1.75, 2.0
  columnWidth: ReaderColumnWidth
  theme: ReaderThemeMode
  bionicReading?: boolean
  autoBookmark?: boolean
}

// ==================== LIVE DATA MODELS ====================

export type LiveMomentTheme =
  | 'NOTICE'
  | 'CONNECT'
  | 'WANDER'
  | 'REST'
  | 'PLAY'
  | 'REMEMBER'
  | 'CREATE'
  | 'NATURE'
  | 'KINDNESS'
  | 'CURIOSITY'
  | 'DO NOTHING'

export interface LiveMoment {
  id: string
  text: string
  theme: LiveMomentTheme
  subtext?: string
  isPlayful?: boolean
  timeContexts?: ('morning' | 'afternoon' | 'evening' | 'night' | 'weekend')[]
  weatherContexts?: ('rain' | 'clear' | 'cloudy' | 'cold' | 'warm')[]
  enabled?: boolean
  createdAt?: number
}

export interface AliveItem {
  id: string
  text: string
  optionalNote?: string
  createdAt: number
  lastSurfacedAt?: number
}

export interface LiveMemory {
  id: string
  text: string
  date: string // YYYY-MM-DD
  optionalPhoto?: string // Data URL or image link
  isOrdinaryDay?: boolean
  ordinaryDayAnswers?: {
    wokeUp?: string
    spokeTo?: string
    ate?: string
    thinkingAbout?: string
    laughedAt?: string
    eveningLookedLike?: string
  }
  personName?: string
  placeName?: string
  createdAt: number
  updatedAt?: number
}

export interface LivePerson {
  id: string
  name: string
  relationship?: string
  whyTheyMatter?: string
  thingsToRemember?: string
  stories?: string[]
  memories?: string[]
  note?: string
  optionalPhoto?: string
  lastMeaningfulMoment?: string
  createdAt: number
  updatedAt?: number
}

export interface LiveLetter {
  id: string
  title: string
  recipientDescription?: string
  content: string
  promptType?: 'someone_i_miss' | 'myself_at_18' | 'someone_who_helped' | 'someone_i_lost' | 'future_self' | 'never_said' | 'custom'
  sealedUntil?: string
  createdAt: number
  updatedAt: number
  archived?: boolean
}

export interface LivePlace {
  id: string
  name: string
  reason?: string
  optionalPhoto?: string
  visited?: boolean
  createdAt: number
}

export interface SomedayItem {
  id: string
  text: string
  optionalReason?: string
  optionalPhoto?: string
  createdAt: number
  lastSurfacedAt?: number
}

export interface HumanVoice {
  id: string
  quote: string
  person: string
  context: string // verified historical context
  source: string // book, speech, letter, interview
  sourceTitle?: string
  sourceUrl?: string
  verified: boolean
  createdAt?: number
}

export interface OneBeautifulThing {
  id: string
  title: string
  description: string
  icon?: string
}

export interface LivePreferences {
  atmospherePreference: 'auto' | 'morning' | 'afternoon' | 'evening' | 'night'
  timeAtmosphere?: 'auto' | 'morning' | 'afternoon' | 'evening' | 'night'
  includeMemoriesInSearch: boolean
  globalSearchEnabled?: boolean
  notificationsEnabled: boolean
  notificationFrequency?: 'rarely' | 'occasionally' | 'few_times_per_week'
  motionPreference?: 'normal' | 'reduced'
  quietHoursStart: string
  quietHoursEnd: string
}

// ==========================================
// COLLECTIONS APPLICATION TYPES
// ==========================================

export type CollectionItemType =
  | 'reference'
  | 'link'
  | 'text'
  | 'image'
  | 'file'
  | 'article'
  | 'quote'
  | 'note'
  | 'idea'
  | 'decision'
  | 'manual'
  | 'movie'
  | 'book'
  | 'place'
  | 'hearing'
  | 'task'

export type CollectionSourceType =
  | 'reader_article'
  | 'reader_quote'
  | 'note'
  | 'idea'
  | 'decision'
  | 'hearing'
  | 'task'
  | 'document'
  | 'live_memory'
  | 'live_place'
  | 'custom'

export type CollectionViewMode = 'grid' | 'list' | 'board'
export type CollectionCoverType = 'minimal' | 'gradient' | 'color' | 'image' | 'item'

export interface CollectionSection {
  id: string
  collectionId: string
  title: string
  order: number
}

export interface CollectionItem {
  id: string
  collectionId: string
  sectionId?: string
  itemType: CollectionItemType
  sourceType?: CollectionSourceType
  sourceId?: string
  title: string
  description?: string
  url?: string
  manualContent?: string
  imageUrl?: string
  faviconUrl?: string
  metadata?: Record<string, unknown>
  note?: string
  favorite?: boolean
  position: number
  addedAt: number
  updatedAt?: number
}

export interface Collection {
  id: string
  name: string
  description?: string
  coverType: CollectionCoverType
  coverValue?: string
  icon?: string
  accent?: string
  viewMode?: CollectionViewMode
  favorite: boolean
  archived: boolean
  sections?: CollectionSection[]
  relatedCollectionIds?: string[]
  note?: string
  createdAt: number
  updatedAt: number
}

// ==========================================
// DASHBOARD BUILDER APPLICATION TYPES
// ==========================================

export interface DashboardResponsiveVisibility {
  desktop: boolean
  tablet: boolean
  mobile: boolean
}

export interface DashboardItem {
  id: string
  dashboardId: string
  widgetId: string
  x: number // grid col (0..11)
  y: number // grid row
  width: number // col span (1..12)
  height: number // row units (1, 2, 3...)
  size?: WidgetSize
  settings?: Record<string, unknown>
  visibility?: DashboardResponsiveVisibility
}

export interface DashboardLayoutConfig {
  showSearch: boolean
  showClock: boolean
  clockPosition: 'center' | 'left'
  clockFormat?: '12h' | '24h'
  showMarketsStrip: boolean
  showAppLauncher: boolean
  appLauncherColumns?: number
  gridColumns?: number
  gap?: number
}

export interface DashboardDefinition {
  id: string
  name: string
  description?: string
  icon?: string
  wallpaper: string
  wallpaperCategory?: WallpaperCategory
  customWallpaperData?: string
  layoutConfig: DashboardLayoutConfig
  items: DashboardItem[]
  isDefault: boolean
  createdAt: number
  updatedAt: number
}



