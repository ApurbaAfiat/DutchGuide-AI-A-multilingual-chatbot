/**
 * Utility functions used across the frontend.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind CSS class names safely. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Generate a simple unique session ID. */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/** Format a timestamp as "HH:MM". */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/** Scroll a container element to the bottom. */
export function scrollToBottom(el: HTMLElement | null): void {
  if (!el) return
  el.scrollTop = el.scrollHeight
}

/** Capitalise the first letter of a string. */
export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Debounce a function. */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
