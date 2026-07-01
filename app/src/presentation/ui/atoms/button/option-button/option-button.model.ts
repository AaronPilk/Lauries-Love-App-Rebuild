import { IHStackProps } from 'native-base/lib/typescript/components/primitives/Stack/HStack';
import { variants } from './option-button.style';

export interface OptionButtonProps extends IHStackProps {
  onPress: () => void;
  variant?: keyof typeof variants;
  toggleArrow?: boolean;
  activeArrow?: boolean;
}
