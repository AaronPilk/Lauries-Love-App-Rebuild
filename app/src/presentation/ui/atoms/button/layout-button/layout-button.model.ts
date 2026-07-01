export interface LayoutButtonOption<T> {
  label: string;
  value: T;
}

export interface LayoutButtonProps<T> {
  currentValue?: T;
  options: LayoutButtonOption<T>[];
  setCurrentValue: (value: T) => void;
}
