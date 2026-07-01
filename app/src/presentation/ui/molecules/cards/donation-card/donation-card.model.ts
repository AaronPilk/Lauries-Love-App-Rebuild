import { Payment } from 'data/models';

export interface DonationCardProps {
  item: Payment;
  onPressViewReceipt?: () => void;
}
