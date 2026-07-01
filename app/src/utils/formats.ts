import moment from 'moment';

export function formatTime(date: Date | string): string {
  const now = moment();
  const inputDate = moment(date);
  const diffInMinutes = now.diff(inputDate, 'minutes');
  const diffInHours = now.diff(inputDate, 'hours');
  const diffInDays = now.diff(inputDate, 'days');

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else {
    return `${diffInDays}d`;
  }
}

export function formatHours(date: Date | string): string {
  return moment(date).format('h:mm A');
}

export function truncate(str: string, n: number, delimiter = '...') {
  return str.length > n ? `${str.slice(0, n - 1)}${delimiter}` : str;
}

export function formatGender(gender: string) {
  switch (gender) {
    case 'male':
      return 'M*';
    case 'female':
      return 'F*';
    default:
      return '';
  }
}
