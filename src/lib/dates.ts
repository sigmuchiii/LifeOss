// Общие помощники дат для модулей LifeOss.

export const pad = (n: number) => String(n).padStart(2, "0");
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());

export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
export const MONTHS_FULL = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
export const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function fmtDate(iso: string): string {
  const t = todayISO();
  if (iso === t) return "Сегодня";
  if (iso === addDays(t, 1)) return "Завтра";
  if (iso === addDays(t, -1)) return "Вчера";
  const [y, m, d] = iso.split("-").map(Number);
  const year = new Date().getFullYear() === y ? "" : ` ${y}`;
  return `${d} ${MONTHS[m - 1]}${year}`;
}

/** Понедельник = 0 … Воскресенье = 6 */
export const dowMon = (d: Date) => (d.getDay() + 6) % 7;

export function fmtLongDate(d: Date): string {
  const days = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
  return `${days[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
