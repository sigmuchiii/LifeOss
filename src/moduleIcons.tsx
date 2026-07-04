// Иконки модулей (lucide) — единая карта id -> иконка.
import {
  Sun, ListTodo, Repeat, Calendar, Timer, BookOpen, HeartPulse,
  FolderKanban, FileText, StickyNote, Users, Wallet, TrendingUp,
  Settings, Bell, Brain, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  today: Sun,
  tasks: ListTodo,
  habits: Repeat,
  calendar: Calendar,
  focus: Timer,
  diary: BookOpen,
  physicalHealth: HeartPulse,
  projects: FolderKanban,
  notes: FileText,
  quickNotes: StickyNote,
  contacts: Users,
  finance: Wallet,
  trading: TrendingUp,
  settings: Settings,
  reminders: Bell,
  psychologicalHealth: Brain,
};

export const moduleIcon = (id: string): LucideIcon => ICONS[id] ?? Sun;
