/**
 * Human-readable date-time formatting options.
 *
 * @remarks
 * The time zone is owned by the temporal value: `DateTime` formats in UTC and
 * `ZonedDateTime` formats in its configured IANA time zone. Callers may select
 * locale and standard `Intl.DateTimeFormat` presentation options, but cannot
 * override the temporal value's time zone here.
 */
export type DateTimeFormatOptions = Omit<Intl.DateTimeFormatOptions, 'timeZone'> & {
  /** Locale used for human-readable presentation. */
  locale?: string | string[];
};
