/**
 * Lucide → Phosphor shim.
 *
 * Intercepta `import { X } from "lucide-react"` via alias em next.config.ts
 * e redireciona pra Phosphor Icons. Muda estética de todo o projeto de uma vez.
 *
 * Props Lucide ignoradas por Phosphor: `strokeWidth`, `absoluteStrokeWidth`.
 * Compatíveis: `className`, `size`, `color`, `style`, `onClick`.
 *
 * Mantenha este arquivo como fonte única de aliases. Se um ícone Lucide novo
 * for usado no código, adicione aqui.
 */

import type { ComponentType, SVGAttributes } from "react";
import type { IconProps } from "@phosphor-icons/react";

export type LucideProps = IconProps & SVGAttributes<SVGSVGElement>;
export type LucideIcon = ComponentType<LucideProps>;

export {
  // Arrows
  ArrowRight,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowDownRight,
  ArrowDownLeft,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowsClockwise as RefreshCcw,
  ArrowsClockwise as RefreshCw,
  ArrowsClockwise as RotateCw,
  ArrowCounterClockwise as RotateCcw,

  // Carets (Lucide Chevron → Phosphor Caret)
  CaretDown as ChevronDown,
  CaretUp as ChevronUp,
  CaretRight as ChevronRight,
  CaretLeft as ChevronLeft,
  CaretDoubleRight as ChevronsRight,
  CaretUpDown as ChevronsUpDown,

  // Basic symbols
  X,
  XCircle,
  Plus,
  PlusCircle,
  Minus,
  MinusCircle,
  Check,
  CheckCircle,
  CheckCircle as CheckCircle2,
  CheckSquare,
  Circle,

  // Search / filter
  MagnifyingGlass as Search,
  MagnifyingGlassMinus as ZoomOut,
  MagnifyingGlassPlus as ZoomIn,
  Funnel as Filter,
  FunnelSimple as SlidersHorizontal,
  SmileyXEyes as SearchX,

  // List / layout
  List as Menu,
  List,
  SquaresFour as Grid,
  SquaresFour as LayoutGrid,
  SquaresFour as Grid2x2,
  Rows as LayoutList,
  Rows as Rows2,
  DotsThree as MoreHorizontal,
  DotsThreeVertical as MoreVertical,

  // Clipboard / share
  Copy,
  Clipboard,
  Share as Share2,
  FloppyDisk as Save,
  PaperPlaneRight as Send,
  ArrowUUpLeft as Reply,

  // Fullscreen
  ArrowsOut as Maximize2,
  ArrowsIn as Minimize2,

  // Status
  Lightning as Zap,
  Warning as AlertTriangle,
  Warning as AlertCircle,
  Warning as Alert,
  WarningOctagon as AlertOctagon,
  Info,
  Question as HelpCircle,
  Question,

  // Bell
  Bell,
  BellSlash as BellOff,
  BellRinging as BellRing,

  // Lock / eye / shield
  Lock,
  LockOpen as Unlock,
  LockOpen as Unlink,
  Eye,
  EyeSlash as EyeOff,
  ShieldCheck,
  Shield,
  ShieldWarning as ShieldAlert,
  Siren,

  // Activity
  Pulse as Activity,
  Skull,

  // Trading & finance
  TrendUp as TrendingUp,
  TrendDown as TrendingDown,
  ChartLine as LineChart,
  ChartBar as BarChart3,
  ChartBar as BarChart2,
  ChartBar as BarChart,
  ChartPie as PieChart,
  ChartLineUp,
  ChartLineUp as CandlestickChart,
  ChartLineDown,
  Coins,
  Coin,
  CurrencyCircleDollar as DollarSign,
  CurrencyDollar,
  CurrencyBtc as Bitcoin,
  Briefcase,
  Calculator,
  Gauge,
  Percent,
  Bank,
  Receipt,
  Wallet,
  Ticket,

  // Content
  BookOpen,
  BookOpen as BookMarked,
  Books as Library,
  Newspaper,
  NotePencil as PenLine,
  NotePencil as Pencil,
  NotePencil as NotebookPen,
  Pencil as Edit,
  Pencil as Edit2,
  Pencil as Edit3,
  Note as StickyNote,
  Quotes as Quote,
  Eraser,
  Palette,
  PushPin as Pin,
  GraduationCap,

  // Bookmarks
  Bookmark,
  BookmarkSimple as BookmarkCheck,
  Tag,
  Tag as Tags,

  // Calendar
  Calendar,
  CalendarCheck,
  CalendarCheck as CalendarClock,
  CalendarBlank,
  Clock,
  Clock as Clock4,
  ClockCounterClockwise as History,
  Timer,
  Hourglass,

  // Files
  FileText,
  File,
  Files,
  FileArrowUp as FileUp,
  Folder,
  FolderOpen,
  FolderSimple,
  Archive,
  Package,
  Package as Package2,
  Tray as Inbox,

  // Links
  Link as LinkIcon,
  LinkSimple as Link2,
  ArrowSquareOut as ExternalLink,
  Paperclip,
  Hash,
  At,
  At as AtSign,
  QrCode,

  // Chat
  ChatCircle as MessageCircle,
  ChatCircle as MessageSquare,
  ChatDots,
  Microphone as Mic,
  MicrophoneSlash as MicOff,

  // Users
  Users,
  UsersThree,
  UserCircle,
  User,
  UserPlus,
  UserMinus,
  UserMinus as UserX,
  IdentificationCard as Id,

  // Media
  Play,
  PlayCircle,
  Pause,
  PauseCircle,
  SpeakerHigh as Volume2,
  SpeakerHigh as Volume,
  SpeakerSlash as VolumeX,
  Stop as Square,
  SkipForward,
  SkipBack,
  Image as ImageIcon,
  ImageSquare as ImagePlus,
  Camera,
  VideoCamera as Video,
  VideoCamera as Film,
  MonitorPlay,

  // Awards
  Star,
  Heart,
  Fire as Flame,
  Moon,
  Sun,
  CloudMoon,
  CloudSun,
  Sparkle as Sparkles,
  Sparkle,
  Trophy,
  Medal,
  Medal as Award,
  Crown,
  Flag,
  Gift,

  // Radio / nav
  Radio,
  RadioButton,
  Globe,
  GlobeHemisphereWest,
  House as Home,
  House as LayoutDashboard,
  Gear as Settings,
  GearSix as Settings2,
  SignOut as LogOut,
  SignIn as LogIn,

  // Target / brain
  Target as Crosshair,
  Target,
  Brain,
  Brain as BrainCircuit,
  Lightbulb,

  // Trash / download
  Trash as Trash2,
  Trash,
  DownloadSimple as Download,
  UploadSimple as Upload,
  CloudArrowUp as CloudUpload,
  CloudArrowDown as CloudDownload,

  // Buildings
  Buildings,
  Buildings as Building2,
  Building as BuildingIcon,

  // Plug / code
  PlugsConnected as Plug,
  CodeSimple as Code,
  CodeSimple as Code2,
  Terminal as TerminalIcon,

  // Emoji
  Smiley as Smile,
  SmileyWink,
  SmileyNervous,
  Dot,
  CircleNotch as Loader,
  CircleNotch as Loader2,
  Shuffle,

  // Map
  Compass,
  MapPin,
  MapTrifold as Map,
  Path,

  // Tech
  DeviceMobile as Smartphone,
  Desktop as Monitor,
  Laptop,
  Keyboard,
  Headphones,
  WifiHigh as Wifi,
  WifiSlash as WifiOff,
  Lightning,
  LightningSlash,
  Atom,
  Cube,
  Cube as Box,
  CubeFocus,
  Drop as Droplets,
  Hash as HashSymbol,
  PuzzlePiece as Puzzle,
  Toolbox,
  Wrench,
  Hammer,
  Key,
  Password,
  Fingerprint,
  Scan,
  Scan as ScanEye,
  Magnet,

  // Network
  Cloud,
  Database,
  HardDrive,
  Cpu,
  GraphicsCard,

  // Chart types extras
  ChartPolar as ChartDonut,
  ChartScatter,
  SquareHalf as Columns,
  Stack as Layers,
  Stack,

  // Utility
  GitBranch,
  GitBranch as GitCompare,

  // Game (pra achievements)
  GameController,
  GameController as Dices,
} from "@phosphor-icons/react/dist/ssr";
