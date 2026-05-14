import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fmtMoney = (n: number, cur = 'AED') =>
  `${cur} ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`

export const initials = (s: string) =>
  s.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()
