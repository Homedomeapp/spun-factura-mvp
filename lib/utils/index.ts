import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind de forma inteligente.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda EUR.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Formatea una fecha en formato español.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Formatea una fecha larga en español.
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Genera un número de factura formateado.
 */
export function formatNumeroFactura(serie: string, numero: number): string {
  return `${serie}-${numero.toString().padStart(6, "0")}`;
}

/**
 * Calcula el trimestre de una fecha.
 */
export function getTrimestre(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

/**
 * Obtiene el inicio del trimestre actual.
 */
export function getInicioTrimestre(date: Date = new Date()): Date {
  const trimestre = getTrimestre(date);
  const mes = (trimestre - 1) * 3;
  return new Date(date.getFullYear(), mes, 1);
}

/**
 * Obtiene el fin del trimestre actual.
 */
export function getFinTrimestre(date: Date = new Date()): Date {
  const trimestre = getTrimestre(date);
  const mes = trimestre * 3;
  return new Date(date.getFullYear(), mes, 0);
}

/**
 * Espera un tiempo determinado (para reintentos, etc.).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function con backoff exponencial.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}
