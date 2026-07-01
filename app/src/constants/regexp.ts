export const REGEX_FORMAT = /[() -]/gu;
export const REGEX_EMAIL = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

// password
export const REGEX_MAIN_PASSWORD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:"<>?,./;'[\]\-=`~])[A-Za-z\d!@#$%^&*()_+{}:"<>?,./;'[\]\-=`~]{6,}$/;
export const REGEX_LEIGH_PASSWORD = /^.{6,}$/;
export const REGEX_SMALL_LETTER_PASSWORD = /(?=.*[a-z])/;
export const REGEX_BIG_LETTER_PASSWORD = /(?=.*[A-Z])/;
export const REGEX_NUMBER_PASSWORD = /(?=.*\d)/;
export const REGEX_SPECIAL_CHARACTER_PASSWORD =
  /(?=.*[!@#$%^&*()_+{}:"<>?,./;'[\]\-=`~])/;
