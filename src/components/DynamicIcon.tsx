import {
  ClipboardList,
  GraduationCap,
  Presentation,
  Info,
  BookOpen,
  Megaphone,
  Stethoscope,
  FileText,
  Calendar,
  Image as ImageIcon,
  Phone,
  Download,
  Users,
  Award,
  HeartHandshake,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "clipboard-list": ClipboardList,
  "graduation-cap": GraduationCap,
  presentation: Presentation,
  info: Info,
  "book-open": BookOpen,
  megaphone: Megaphone,
  stethoscope: Stethoscope,
  "file-text": FileText,
  calendar: Calendar,
  image: ImageIcon,
  phone: Phone,
  download: Download,
  users: Users,
  award: Award,
  "heart-handshake": HeartHandshake,
  "shield-check": ShieldCheck,
};

export function DynamicIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || Stethoscope;
  return <Icon className={className} aria-hidden />;
}
