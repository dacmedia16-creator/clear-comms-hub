import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Valida bloco: numero sem zero inicial OU letra unica
export function isValidBlock(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  
  // Letra unica (A-Z)
  if (/^[A-Za-z]$/.test(trimmed)) return true;
  
  // Numero sem zero inicial (1, 2, 10, 100...)
  if (/^[1-9][0-9]*$/.test(trimmed)) return true;
  
  return false;
}

// Valida unidade: apenas numeros
export function isValidUnit(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[0-9]+$/.test(trimmed);
}

// Formata bloco para padrao (letra maiuscula)
export function formatBlock(value: string): string {
  const trimmed = value.trim();
  if (/^[A-Za-z]$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return trimmed;
}

// Calcula status do periodo de trial
export function getTrialStatus(trialEndsAt: string | null) {
  if (!trialEndsAt) return { isActive: false, daysRemaining: 0, endDate: null };
  
  const endDate = new Date(trialEndsAt);
  const now = new Date();
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    isActive: daysRemaining > 0,
    daysRemaining: Math.max(0, daysRemaining),
    endDate,
  };
}
