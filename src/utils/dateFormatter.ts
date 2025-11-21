function toDate(value: Date | number): Date {
  if (value instanceof Date) {
    return value;
  }
  // Assume timestamp is in seconds (OpenWeather API format)
  return new Date(value * 1000);
}

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

export function formatDate(date: Date | number): string {
  const d = toDate(date);
  const year = d.getFullYear();
  const month = padZero(d.getMonth() + 1);
  const day = padZero(d.getDate());
  return `${year}-${month}-${day}`;
}

export function formatTime(date: Date | number): string {
  const d = toDate(date);
  const hours = padZero(d.getHours());
  const minutes = padZero(d.getMinutes());
  return `${hours}:${minutes}`;
}

export function formatDateTime(date: Date | number): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function formatRelativeTime(date: Date | number): string {
  const d = toDate(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }

  return formatDate(d);
}
