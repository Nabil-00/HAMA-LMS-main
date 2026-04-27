import React, { memo } from 'react';

export interface HamaUIIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const IconBase: React.FC<HamaUIIconProps & { children: React.ReactNode }> = ({
  size = 24,
  className = '',
  strokeWidth = 2.1,
  children,
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

const make = (paths: React.ReactNode) => memo<HamaUIIconProps>((props) => <IconBase {...props}>{paths}</IconBase>);

export const Play = make(<path d="M9 7.7L17 12L9 16.3V7.7Z" />);
export const Pause = make(<><path d="M9 7.5V16.5" /><path d="M15 7.5V16.5" /></>);
export const PlayCircle = make(<><circle cx="12" cy="12" r="8.7" /><path d="M10.2 9L15 12L10.2 15V9Z" /></>);
export const BookOpen = make(<><path d="M5.5 6.8C5.5 6 6.1 5.4 6.9 5.4H11.6V18.4H6.9C6.1 18.4 5.5 17.8 5.5 17V6.8Z" /><path d="M18.5 6.8C18.5 6 17.9 5.4 17.1 5.4H12.4V18.4H17.1C17.9 18.4 18.5 17.8 18.5 17V6.8Z" /></>);
export const Award = make(<><circle cx="12" cy="9.5" r="3.4" /><path d="M9.4 12.3L8 18L12 15.8L16 18L14.6 12.3" /></>);
export const User = make(<><circle cx="12" cy="8.4" r="3" /><path d="M6.4 17.7C7.4 15.6 9.4 14.4 12 14.4C14.6 14.4 16.6 15.6 17.6 17.7" /></>);
export const Users = make(<><circle cx="9" cy="9" r="2.5" /><circle cx="15.8" cy="9.6" r="2.1" /><path d="M4.8 17C5.6 15.4 7 14.4 9 14.4C10.9 14.4 12.4 15.4 13.2 17" /><path d="M13.7 16.8C14.3 15.7 15.2 15 16.5 15" /></>);
export const GraduationCap = make(<><path d="M3.8 9.2L12 5L20.2 9.2L12 13.4L3.8 9.2Z" /><path d="M7.2 11.5V14.8C8.5 15.9 10.1 16.5 12 16.5C13.9 16.5 15.5 15.9 16.8 14.8V11.5" /><path d="M20.2 9.2V13.8" /></>);
export const Activity = make(<path d="M4.5 12H7.7L9.7 8L12.2 16L14.5 10.8L15.8 12H19.5" />);
export const Clock = make(<><circle cx="12" cy="12" r="8.8" /><path d="M12 7.8V12L15.2 14" /></>);
export const BarChart3 = make(<><path d="M6.5 17V11.5" /><path d="M12 17V8" /><path d="M17.5 17V13" /><path d="M4.5 17.5H19.5" /></>);
export const LayoutDashboard = make(<><rect x="4.8" y="4.8" width="5.8" height="5.8" rx="1.2" /><rect x="13.4" y="4.8" width="5.8" height="8.6" rx="1.2" /><rect x="4.8" y="13.4" width="5.8" height="5.8" rx="1.2" /><rect x="13.4" y="16.2" width="5.8" height="3" rx="1.2" /></>);
export const Settings = make(<><circle cx="12" cy="12" r="2.6" /><path d="M19 12A7 7 0 0 0 19 11.7L21 10.3L19.8 8.2L17.4 8.6A6.9 6.9 0 0 0 16.2 7.9L15.8 5.5H13.3L12.2 7.1A7.3 7.3 0 0 0 11.8 7.1L10.7 5.5H8.2L7.8 7.9A6.9 6.9 0 0 0 6.6 8.6L4.2 8.2L3 10.3L5 11.7A7 7 0 0 0 5 12L3 13.7L4.2 15.8L6.6 15.4A6.9 6.9 0 0 0 7.8 16.1L8.2 18.5H10.7L11.8 16.9A7.3 7.3 0 0 0 12.2 16.9L13.3 18.5H15.8L16.2 16.1A6.9 6.9 0 0 0 17.4 15.4L19.8 15.8L21 13.7L19 12Z" /></>);

export const Search = make(<><circle cx="10.5" cy="10.5" r="4.8" /><path d="M14.3 14.3L18.7 18.7" /></>);
export const Filter = make(<><path d="M5 6.5H19" /><path d="M7.8 11.5H16.2" /><path d="M10.2 16.5H13.8" /></>);
export const Bell = make(<><path d="M7.4 9.5A4.6 4.6 0 0 1 12 5A4.6 4.6 0 0 1 16.6 9.5V13L18.2 15.3H5.8L7.4 13V9.5Z" /><path d="M9.8 17.4C10.2 18.2 11 18.7 12 18.7C13 18.7 13.8 18.2 14.2 17.4" /></>);
export const LogOut = make(<><path d="M10 18.5H7.5A2 2 0 0 1 5.5 16.5V7.5A2 2 0 0 1 7.5 5.5H10" /><path d="M13 8L18 12L13 16" /><path d="M18 12H9" /></>);
export const ChevronRight = make(<path d="M9 6.8L14.4 12L9 17.2" />);
export const ChevronLeft = make(<path d="M15 6.8L9.6 12L15 17.2" />);
export const ChevronDown = make(<path d="M6.8 9L12 14.4L17.2 9" />);
export const ChevronUp = make(<path d="M6.8 15L12 9.6L17.2 15" />);
export const Menu = make(<><path d="M4.5 7H19.5" /><path d="M4.5 12H19.5" /><path d="M4.5 17H19.5" /></>);
export const ArrowRight = make(<><path d="M5 12H18" /><path d="M13.8 7.8L18 12L13.8 16.2" /></>);
export const ArrowLeft = make(<><path d="M19 12H6" /><path d="M10.2 7.8L6 12L10.2 16.2" /></>);
export const Plus = make(<><path d="M12 5V19" /><path d="M5 12H19" /></>);
export const X = make(<><path d="M6.2 6.2L17.8 17.8" /><path d="M17.8 6.2L6.2 17.8" /></>);
export const Check = make(<path d="M5.6 12.6L10 16.6L18.4 8.4" />);
export const CheckCheck = make(<><path d="M3.8 12.8L7.1 15.8L12 10.9" /><path d="M9.2 12.8L12.5 15.8L20.2 8.2" /></>);
export const CheckCircle = make(<><circle cx="12" cy="12" r="8.8" /><path d="M8 12.1L11 15L16 9.9" /></>);
export const CheckCircle2 = CheckCircle;
export const CheckSquare = make(<><rect x="5.2" y="5.2" width="13.6" height="13.6" rx="2" /><path d="M8.8 12.2L11.2 14.6L15.4 10.4" /></>);
export const XCircle = make(<><circle cx="12" cy="12" r="8.8" /><path d="M9.4 9.4L14.6 14.6" /><path d="M14.6 9.4L9.4 14.6" /></>);
export const AlertCircle = make(<><circle cx="12" cy="12" r="8.8" /><path d="M12 8.1V12.6" /><circle cx="12" cy="15.7" r="0.8" fill="currentColor" stroke="none" /></>);
export const AlertTriangle = make(<><path d="M12 5.4L19 18H5L12 5.4Z" /><path d="M12 9.4V13.2" /><circle cx="12" cy="15.6" r="0.75" fill="currentColor" stroke="none" /></>);
export const Info = make(<><circle cx="12" cy="12" r="8.8" /><path d="M12 10.7V15.8" /><circle cx="12" cy="8" r="0.8" fill="currentColor" stroke="none" /></>);

export const Mail = make(<><path d="M4.8 7.3A1.8 1.8 0 0 1 6.6 5.5H17.4A1.8 1.8 0 0 1 19.2 7.3V16.7A1.8 1.8 0 0 1 17.4 18.5H6.6A1.8 1.8 0 0 1 4.8 16.7V7.3Z" /><path d="M5.5 7.2L12 12.2L18.5 7.2" /></>);
export const Lock = make(<><rect x="6.3" y="10.5" width="11.4" height="8" rx="2" /><path d="M8.7 10.5V8.5A3.3 3.3 0 0 1 12 5.2A3.3 3.3 0 0 1 15.3 8.5V10.5" /></>);
export const Eye = make(<><path d="M2.8 12C4.7 8.9 7.8 7.1 12 7.1C16.2 7.1 19.3 8.9 21.2 12C19.3 15.1 16.2 16.9 12 16.9C7.8 16.9 4.7 15.1 2.8 12Z" /><circle cx="12" cy="12" r="2.5" /></>);
export const EyeOff = make(<><path d="M3.2 3.2L20.8 20.8" /><path d="M9.8 7.5C10.5 7.2 11.2 7.1 12 7.1C16.2 7.1 19.3 8.9 21.2 12C20.4 13.3 19.5 14.3 18.5 15.1" /><path d="M15.8 15.8C14.7 16.5 13.4 16.9 12 16.9C7.8 16.9 4.7 15.1 2.8 12C3.6 10.7 4.5 9.7 5.5 8.9" /></>);

export const FileText = make(<><path d="M7 5.5H13.5L17 9V18.5H7V5.5Z" /><path d="M13.5 5.5V9H17" /><path d="M9 12H15" /><path d="M9 14.8H15" /></>);
export const Video = make(<><rect x="4.8" y="7.2" width="11.4" height="9.6" rx="1.6" /><path d="M16.2 10.2L19.2 8.7V15.3L16.2 13.8" /></>);
export const Mic = make(<><rect x="9.2" y="5" width="5.6" height="9" rx="2.8" /><path d="M7 11.7C7 14.4 9.2 16.6 12 16.6C14.8 16.6 17 14.4 17 11.7" /><path d="M12 16.6V19" /></>);
export const Box = make(<><path d="M4.8 8.2L12 4.6L19.2 8.2L12 11.8L4.8 8.2Z" /><path d="M4.8 8.2V15.8L12 19.4V11.8" /><path d="M19.2 8.2V15.8L12 19.4" /></>);
export const Globe = make(<><circle cx="12" cy="12" r="8.8" /><path d="M3.2 12H20.8" /><path d="M12 3.2C14.1 5.5 15.3 8.6 15.3 12C15.3 15.4 14.1 18.5 12 20.8" /><path d="M12 3.2C9.9 5.5 8.7 8.6 8.7 12C8.7 15.4 9.9 18.5 12 20.8" /></>);
export const MonitorPlay = make(<><rect x="3.8" y="5.2" width="16.4" height="11.2" rx="1.8" /><path d="M9.7 9L14.7 11.8L9.7 14.6V9Z" /><path d="M9 19H15" /></>);
export const Code = make(<><path d="M8.6 8.2L5 12L8.6 15.8" /><path d="M15.4 8.2L19 12L15.4 15.8" /><path d="M13.4 6.6L10.6 17.4" /></>);
export const Gamepad2 = make(<><path d="M7.4 10H16.6C18.4 10 19.6 11.9 18.9 13.6L17.9 16.2C17.4 17.5 15.8 18.1 14.5 17.5L12 16.3L9.5 17.5C8.2 18.1 6.6 17.5 6.1 16.2L5.1 13.6C4.4 11.9 5.6 10 7.4 10Z" /><path d="M8.6 12.7H11.2" /><path d="M9.9 11.4V14" /><circle cx="15.6" cy="12.3" r="0.8" fill="currentColor" stroke="none" /><circle cx="17" cy="13.8" r="0.8" fill="currentColor" stroke="none" /></>);
export const Maximize2 = make(<><path d="M8.2 3.8H3.8V8.2" /><path d="M15.8 3.8H20.2V8.2" /><path d="M3.8 15.8V20.2H8.2" /><path d="M20.2 15.8V20.2H15.8" /></>);
export const Minimize2 = make(<><path d="M8.2 3.8V8.2H3.8" /><path d="M15.8 3.8V8.2H20.2" /><path d="M3.8 15.8H8.2V20.2" /><path d="M20.2 15.8H15.8V20.2" /></>);
export const PenTool = make(<><path d="M6.2 17.8L9.2 14.8L15.9 8.1L13 5.2L6.2 12L4.8 19.2L12 17.8" /><path d="M13 5.2L15.9 8.1" /></>);
export const Volume2 = make(<><path d="M4.5 10H8L12 6V18L8 14H4.5V10Z" /><path d="M15 9.3C16.5 10.7 16.5 13.3 15 14.7" /><path d="M17.4 7C20 9.3 20 14.7 17.4 17" /></>);
export const Trash2 = make(<><path d="M5.8 7H18.2" /><path d="M9.3 7V5.4H14.7V7" /><path d="M7.2 7L8 18.2H16L16.8 7" /><path d="M10.2 10.2V15.8" /><path d="M13.8 10.2V15.8" /></>);
export const Save = make(<><path d="M6 5.2H16.2L18.8 7.8V18.8H6V5.2Z" /><path d="M8.6 5.2V9.6H14.8V5.2" /><rect x="8.6" y="12.4" width="6.8" height="4.6" rx="0.8" /></>);
export const GripVertical = make(<><circle cx="9" cy="7" r="0.8" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="0.8" fill="currentColor" stroke="none" /><circle cx="9" cy="17" r="0.8" fill="currentColor" stroke="none" /><circle cx="15" cy="7" r="0.8" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="0.8" fill="currentColor" stroke="none" /><circle cx="15" cy="17" r="0.8" fill="currentColor" stroke="none" /></>);
export const MoreVertical = make(<><circle cx="12" cy="6.8" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="17.2" r="1" fill="currentColor" stroke="none" /></>);
export const ShieldCheck = make(<><path d="M12 4.8L18.5 7.3V12.4C18.5 15.6 15.9 18.3 12 19.5C8.1 18.3 5.5 15.6 5.5 12.4V7.3L12 4.8Z" /><path d="M9.3 12.1L11.1 13.9L14.8 10.2" /></>);
export const History = make(<><path d="M4.8 12A7.2 7.2 0 1 0 7 6.8" /><path d="M4.8 5V8.8H8.6" /><path d="M12 8.4V12L14.4 13.4" /></>);
export const GitCommit = make(<><circle cx="12" cy="12" r="2.4" /><path d="M4 12H9.6" /><path d="M14.4 12H20" /></>);
export const ListChecks = make(<><path d="M9 7.8H18" /><path d="M9 12H18" /><path d="M9 16.2H18" /><path d="M5 7.6L6.2 8.8L7.6 7.2" /><path d="M5 11.8L6.2 13L7.6 11.4" /><path d="M5 16L6.2 17.2L7.6 15.6" /></>);
export const UploadCloud = make(<><path d="M7.2 17.8H16.8A3.4 3.4 0 0 0 17.2 11A4.8 4.8 0 0 0 8 9.8A3.6 3.6 0 0 0 7.2 17.8Z" /><path d="M12 9V15" /><path d="M9.8 11.2L12 9L14.2 11.2" /></>);
export const Download = make(<><path d="M12 5.5V14.5" /><path d="M8.8 11.3L12 14.5L15.2 11.3" /><path d="M5.5 18.5H18.5" /></>);
export const Copy = make(<><rect x="9" y="9" width="9.5" height="9.5" rx="1.4" /><rect x="5.5" y="5.5" width="9.5" height="9.5" rx="1.4" /></>);
export const Share2 = make(<><circle cx="18" cy="5.8" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="18.2" r="2" /><path d="M7.8 11L16.2 6.8" /><path d="M7.8 13L16.2 17.2" /></>);
export const ExternalLink = make(<><path d="M13.5 5.5H18.5V10.5" /><path d="M10 14L18.5 5.5" /><path d="M18.5 13V18.5H5.5V5.5H11" /></>);
export const MessageSquare = make(<><path d="M6.2 6.2H17.8C18.7 6.2 19.4 6.9 19.4 7.8V14.5C19.4 15.4 18.7 16.1 17.8 16.1H11.5L8 19.1V16.1H6.2C5.3 16.1 4.6 15.4 4.6 14.5V7.8C4.6 6.9 5.3 6.2 6.2 6.2Z" /></>);
export const Upload = make(<><path d="M12 18.5V9.5" /><path d="M8.8 12.7L12 9.5L15.2 12.7" /><path d="M5.5 18.5H18.5" /></>);
export const Edit3 = make(<><path d="M5.5 18.5L10 17.6L18 9.6L14.4 6L6.4 14L5.5 18.5Z" /><path d="M13.2 7.2L16.8 10.8" /></>);
export const Loader2 = make(<><path d="M12 4.8A7.2 7.2 0 1 1 6.9 6.9" /><path d="M12 3.2V6.3" /></>);
export const HelpCircle = make(<><circle cx="12" cy="12" r="8.8" /><path d="M9.5 9.7A2.5 2.5 0 1 1 13.9 11.4C13 11.9 12 12.7 12 13.8" /><circle cx="12" cy="16.6" r="0.8" fill="currentColor" stroke="none" /></>);
export const Maximize = make(<><path d="M8 3.8H3.8V8" /><path d="M16 3.8H20.2V8" /><path d="M3.8 16V20.2H8" /><path d="M20.2 16V20.2H16" /></>);
export const RefreshCw = make(<><path d="M19 11A7 7 0 1 0 12 19" /><path d="M19 4.8V11H12.8" /></>);
export const RotateCcw = make(<><path d="M9 6.8A7 7 0 1 1 5.5 12" /><path d="M9 3.8V6.8H6" /></>);
export const WifiOff = make(<><path d="M2.8 8.8A13 13 0 0 1 21.2 8.8" /><path d="M5.6 11.8A9 9 0 0 1 18.4 11.8" /><path d="M8.4 14.8A5 5 0 0 1 15.6 14.8" /><circle cx="12" cy="18" r="1.2" fill="currentColor" stroke="none" /><path d="M3.2 3.2L20.8 20.8" /></>);
export const Smartphone = make(<><rect x="7.8" y="3.6" width="8.4" height="16.8" rx="2" /><path d="M10.8 6.2H13.2" /><circle cx="12" cy="17.2" r="0.75" fill="currentColor" stroke="none" /></>);
export const ShieldAlert = make(<><path d="M12 4.8L18.5 7.3V12.4C18.5 15.6 15.9 18.3 12 19.5C8.1 18.3 5.5 15.6 5.5 12.4V7.3L12 4.8Z" /><path d="M12 9V12.4" /><circle cx="12" cy="15.1" r="0.75" fill="currentColor" stroke="none" /></>);
export const Shield = make(<path d="M12 4.8L18.5 7.3V12.4C18.5 15.6 15.9 18.3 12 19.5C8.1 18.3 5.5 15.6 5.5 12.4V7.3L12 4.8Z" />);
export const Calendar = make(<><rect x="4.8" y="6.2" width="14.4" height="12.6" rx="1.8" /><path d="M8 4.6V7.8" /><path d="M16 4.6V7.8" /><path d="M4.8 10H19.2" /></>);
export const Link = make(<><path d="M9.5 14.5L8 16A3.2 3.2 0 0 1 3.5 11.5L6 9" /><path d="M14.5 9.5L16 8A3.2 3.2 0 0 1 20.5 12.5L18 15" /><path d="M8.5 12.5H15.5" /></>);
export const Languages = make(<><path d="M4.8 6.2H12.2" /><path d="M8.5 6.2V7.2C8.5 10.1 7 12.8 4.8 14.3" /><path d="M6 12.5L7.6 14.1L9.3 12.4" /><path d="M13.5 16.8L16 10.4L18.5 16.8" /><path d="M14.4 14.5H17.6" /></>);
export const Youtube = make(<><rect x="4.8" y="7.2" width="14.4" height="9.6" rx="2.4" /><path d="M10.2 10L15 12L10.2 14V10Z" /></>);
