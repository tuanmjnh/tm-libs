import moment from 'moment';

/**
 * Converts a "HH:mm:ss" time string into the total number of seconds.
 * Leverages Moment.js for robust parsing by treating the time as duration from midnight.
 * @param timeHMS The time string (e.g., "01:30:15" for 1 hour, 30 minutes, 15 seconds).
 * @returns The total duration in seconds, or 0 if parsing fails.
 */
export const stringTimeToSecond = (timeHMS: string): number => {
  try {
    // Treat the time string as a duration starting from midnight (00:00:00)
    const duration = moment.duration(timeHMS);

    // Check if the moment duration is valid
    if (duration.isValid()) {
      return duration.asSeconds();
    }
    return 0;
  } catch (e) {
    console.error("Error converting string time to seconds:", e);
    return 0;
  }
};

/**
 * Converts a time array [H, M, S] into the total number of seconds.
 * @param timeArr An array of numbers representing [hours, minutes, seconds].
 * @returns The total duration in seconds, or 0 if the array is invalid.
 */
export const ArrayTimeToSecond = (timeArr: number[]): number => {
  try {
    if (!Array.isArray(timeArr) || timeArr.length < 3) return 0;

    // Use Moment.js duration creation for clarity and validity checks (optional, but robust)
    const duration = moment.duration({
      hours: timeArr[0] || 0,
      minutes: timeArr[1] || 0,
      seconds: timeArr[2] || 0
    });

    if (duration.isValid()) {
      return duration.asSeconds();
    }
    return 0;

  } catch (e) {
    console.error("Error converting array time to seconds:", e);
    return 0;
  }
};

/**
 * Converts a total number of seconds into a formatted time string (e.g., "HH:mm:ss").
 * @param seconds The total number of seconds.
 * @param format The Moment.js format string. Defaults to 'HH:mm:ss'.
 * @returns The formatted time string, or an empty string on error.
 */
export const secondToTime = (seconds: number, format = 'HH:mm:ss'): string => {
  try {
    // moment.utc() treats the number of milliseconds as a duration since the epoch start (1970).
    // The format uses UTC to avoid timezone issues.
    return moment.utc(seconds * 1000).format(format);
  } catch (e) {
    console.error("Error converting seconds to time string:", e);
    return '';
  }
};

/**
 * Formats a Date object and splits it into an array of strings.
 * @param date The JavaScript Date object.
 * @param format The Moment.js format string. Defaults to 'HH:mm:ss'.
 * @param split The separator character. Defaults to ':'.
 * @returns An array of string components (e.g., ['15', '30', '00']), or an empty array on error.
 */
export const timeToArray = (date: Date, format = 'HH:mm:ss', split = ':'): string[] => {
  try {
    // Note: moment(date) should generally work, but we ensure it's a valid Moment object
    const m = moment(date);
    if (!m.isValid()) return [];

    return m.format(format).split(split);
  } catch (e) {
    console.error("Error converting time to array of strings:", e);
    return [];
  }
};

/**
 * Formats a Date object and splits it into an array of numbers.
 * @param date The JavaScript Date object.
 * @param format The Moment.js format string. Defaults to 'HH:mm:ss'.
 * @param split The separator character. Defaults to ':'.
 * @returns An array of number components (e.g., [15, 30, 0]), or an empty array on error.
 */
export const timeToArrayNumber = (date: Date, format = 'HH:mm:ss', split = ':'): number[] => {
  try {
    // Reuse timeToArray and map the results to numbers
    return timeToArray(date, format, split).map(Number);
  } catch (e) {
    console.error("Error converting time to array of numbers:", e);
    return [];
  }
};

/**
 * Converts a date string into a Unix timestamp (seconds since epoch).
 * @param date The date string to parse (e.g., '2025-10-06').
 * @returns The Unix timestamp in seconds, or NaN if parsing fails.
 */
export const toTimestamp = (date: string): number => {
  // Date.parse returns milliseconds, so we divide by 1000
  const datum = Date.parse(date);
  if (isNaN(datum)) return NaN;
  return Math.floor(datum / 1000);
};

/**
 * Generates a random Date object between a start date and an end date.
 * @param start The starting Date object.
 * @param end The ending Date object.
 * @returns A randomly generated Date object.
 */
export const randomDate = (start: Date, end: Date): Date => {
  // Note: Your original logic is mathematically sound for generating a random date
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Converts a Unix timestamp (seconds) into a formatted string or a Date object.
 * @param timestamp The Unix timestamp in seconds.
 * @param format The Moment.js format string (optional).
 * @returns A formatted string or a Date object.
 */
export const toDate = (timestamp: string | number, format?: string): string | Date => {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

  // Moment accepts timestamps in milliseconds, so we multiply by 1000
  const m = moment(ts * 1000);

  if (!m.isValid()) {
    console.warn(`Invalid timestamp provided: ${timestamp}`);
    return new Date(NaN); // Return an invalid Date object
  }

  if (format) {
    return m.format(format);
  } else {
    // moment().toDate() returns a standard JavaScript Date object
    return m.toDate();
  }
};

export { };