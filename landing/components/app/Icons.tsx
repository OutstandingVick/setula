import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const HomeIcon = (props: IconProps) => <Icon {...props}><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></Icon>;
export const PaymentsIcon = (props: IconProps) => <Icon {...props}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18" /><path d="M7 15h3" /></Icon>;
export const ContractorsIcon = (props: IconProps) => <Icon {...props}><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 7h5M18.5 4.5v5" /></Icon>;
export const AccountIcon = (props: IconProps) => <Icon {...props}><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></Icon>;
export const ArrowIcon = (props: IconProps) => <Icon {...props}><path d="M5 12h14M14 7l5 5-5 5" /></Icon>;
export const BackIcon = (props: IconProps) => <Icon {...props}><path d="m15 18-6-6 6-6" /></Icon>;
export const ReceiptIcon = (props: IconProps) => <Icon {...props}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></Icon>;
export const EmptyIcon = (props: IconProps) => <Icon {...props}><path d="M4 7.5 12 3l8 4.5V17l-8 4-8-4V7.5Z" /><path d="m4 7.5 8 4 8-4M12 11.5V21" /></Icon>;
