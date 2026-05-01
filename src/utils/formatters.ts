import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function parseSafeISO(dateString: string) {
  if (dateString.length === 10) {
    return parseISO(`${dateString}T12:00:00`);
  }
  return parseISO(dateString);
}

export function formatDate(dateString: string): string {
  try {
    return format(parseSafeISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    return format(parseSafeISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dateString;
  }
}

export function formatMonthYear(dateString: string): string {
  try {
    return format(parseSafeISO(dateString), "MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
