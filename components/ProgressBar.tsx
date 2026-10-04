"use client";

import { formatCurrency, calculateProgress, getProgressColor } from "@/lib/utils";

interface ProgressBarProps {
  name: string;
  spent: number;
  limit: number;
  color: string;
}

export default function ProgressBar({
  name,
  spent,
  limit,
  color,
}: ProgressBarProps) {
  const percent = calculateProgress(spent, limit);
  const barColor = getProgressColor(percent);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-header">
        <span className="progress-bar-label">
          <span
            className="progress-bar-dot"
            style={{ background: color }}
          />
          {name}
        </span>
        <span className="progress-bar-amount">
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${Math.min(percent, 100)}%`,
            background: barColor,
          }}
        />
      </div>
    </div>
  );
}
