export interface ButtonGroupOption<T> {
  label: string;
  value: T;
}
export interface ButtonGroupProps<T> {
  currentValue: T;
  options: ButtonGroupOption<T>[];
  onChange: (value: T) => void;
}
