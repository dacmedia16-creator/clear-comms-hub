import { Info, DollarSign, Wrench, Users, Shield, AlertTriangle } from "lucide-react";

export const ANNOUNCEMENT_CATEGORIES = {
  informativo: {
    label: "Informativo",
    icon: Info,
    color: "category-informativo",
    bgClass: "bg-blue-100 text-blue-700",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
  financeiro: {
    label: "Financeiro",
    icon: DollarSign,
    color: "category-financeiro",
    bgClass: "bg-emerald-100 text-emerald-700",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  manutencao: {
    label: "Manutenção",
    icon: Wrench,
    color: "category-manutencao",
    bgClass: "bg-orange-100 text-orange-700",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
  },
  convivencia: {
    label: "Convivência",
    icon: Users,
    color: "category-convivencia",
    bgClass: "bg-purple-100 text-purple-700",
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
  },
  seguranca: {
    label: "Segurança",
    icon: Shield,
    color: "category-seguranca",
    bgClass: "bg-red-100 text-red-700",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
  urgente: {
    label: "Urgente",
    icon: AlertTriangle,
    color: "category-urgente",
    bgClass: "bg-red-500 text-white",
    badgeClass: "bg-red-500 text-white border-red-600",
  },
} as const;

export type AnnouncementCategory = keyof typeof ANNOUNCEMENT_CATEGORIES;

export const PLANS = {
  free: {
    name: "Gratuito",
    price: 0,
    announcementsPerMonth: 10,
    maxAttachmentSize: 2, // MB
    features: ["Até 10 avisos/mês", "Anexos até 2MB", "Timeline pública"],
  },
  starter: {
    name: "Inicial",
    price: 199,
    announcementsPerMonth: 50,
    maxAttachmentSize: 5,
    features: ["Até 50 avisos/mês", "Anexos até 5MB", "Notificações por email", "Suporte prioritário"],
  },
  pro: {
    name: "Profissional",
    price: 299,
    announcementsPerMonth: -1, // unlimited
    maxAttachmentSize: 10,
    features: ["Avisos ilimitados", "Anexos até 10MB", "Email + WhatsApp", "Relatórios", "API de integração"],
  },
} as const;

export type PlanType = keyof typeof PLANS;
