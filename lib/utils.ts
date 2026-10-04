// Helper functions for formatting and calculations

/**
 * Format a number as USD currency
 * Example: 25.5 -> "$25.50"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Get the first day of the current month as a date string
 * Example: "2026-10-01"
 */
export function getFirstDayOfMonth(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month, 1).toISOString().split('T')[0];
}

/**
 * Get the last day of the current month as a date string
 * Example: "2026-10-31"
 */
export function getLastDayOfMonth(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).toISOString().split('T')[0];
}

/**
 * Get the current month name and year
 * Example: "October 2026"
 */
export function getMonthName(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Format a date string for display
 * Example: "2026-10-15" -> "Oct 15, 2026"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculate the percentage spent in a category
 * Returns a number between 0 and 100+
 */
export function calculateProgress(spent: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.round((spent / limit) * 100);
}

/**
 * Get the color for a progress bar based on percentage
 * - Green: < 75%
 * - Yellow: 75-100%
 * - Red: > 100%
 */
export function getProgressColor(percent: number): string {
  if (percent > 100) return '#FF6B6B'; // red
  if (percent >= 75) return '#FFD93D'; // yellow
  return '#6BCB77'; // green
}

/**
 * Get today's date as a string
 * Example: "2026-10-04"
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}
