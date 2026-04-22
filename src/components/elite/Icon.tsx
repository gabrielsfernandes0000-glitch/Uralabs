/**
 * Icon — shim mapeando nomes Lucide → ícones Phosphor.
 *
 * Por que: Lucide é o "default SaaS indie" — ícones reconhecíveis de shadcn,
 * Linear clone, etc. Phosphor tem visual mais editorial e próprio.
 *
 * Como usar:
 *   - Imports antigos `from "lucide-react"` continuam valendo nos arquivos legados.
 *   - Em componentes novos, importe daqui.
 *   - Props: `className`, `size`, `weight?` ("thin"|"light"|"regular"|"bold"|"fill"|"duotone")
 *   - strokeWidth (Lucide) é ignorado — Phosphor controla stroke via weight.
 */

export {
  // Navigation & Action
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  CaretDown as ChevronDown,
  CaretUp as ChevronUp,
  CaretRight as ChevronRight,
  CaretLeft as ChevronLeft,
  X,
  Plus,
  Minus,
  Check,
  MagnifyingGlass as Search,
  Funnel as Filter,
  List as Menu,
  List,
  DotsThree as MoreHorizontal,

  // Status & Indicators
  Lightning as Zap,
  Warning as AlertTriangle,
  Warning as AlertCircle,
  Info,
  Bell,
  BellSlash as BellOff,
  BellRinging as BellRing,
  Lock,
  LockOpen as Unlock,
  Eye,
  EyeSlash as EyeOff,

  // Trading & Finance
  TrendUp as TrendingUp,
  TrendDown as TrendingDown,
  ChartLine as LineChart,
  ChartBar as BarChart3,
  ChartLineUp,
  Coins,
  Briefcase,
  Calculator,
  Gauge,

  // Content
  BookOpen,
  Newspaper,
  NotePencil as PenLine,
  Bookmark,
  BookmarkSimple as BookmarkCheck,
  Calendar,
  CalendarCheck,
  CalendarCheck as CalendarClock,
  Clock,
  Timer,
  FileText,

  // Users
  Users,
  User,
  UsersThree,

  // Media
  Play,
  Pause,
  SpeakerHigh as Volume2,
  SpeakerSlash as VolumeX,
  Stop as Square,

  // Misc
  Star,
  Heart,
  Fire as Flame,
  Moon,
  Sun,
  Sparkle as Sparkles,
  Radio,
  Globe,
  House as Home,
  House as LayoutDashboard,
  Gear as Settings,
  SignOut as LogOut,
  SignIn as LogIn,
  Gift,
  Trophy,
  Target as Crosshair,
  Target,
  Brain,
  Lightbulb,
  Trash as Trash2,
  DownloadSimple as Download,
  UploadSimple as Upload,
  ArrowSquareOut as ExternalLink,
  Buildings,
  LinkSimple as Link2,
  PlugsConnected as Plug,
  CodeSimple as Code,
  Question as HelpCircle,
  DotsThree as ChevronsUpDown,
  SmileyXEyes as SearchX,
} from "@phosphor-icons/react";
