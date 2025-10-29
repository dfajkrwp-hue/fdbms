import React from 'react';

const iconProps = {
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  stroke: "currentColor"
};

export const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export const TrashIcon = ({ className = "h-6 w-6 text-[var(--color-danger)] hover:text-[var(--color-danger-hover)]" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Fix: Updated SettingsIcon to accept a className prop.
export const SettingsIcon = ({ className = "h-6 w-6 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const ShareIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);

export const LoadIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const CloseIcon = () => (
  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const ReportIcon = ({ className = "h-6 w-6 mr-2", style }: { className?: string, style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const PdfIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const UploadIcon = ({ className = "h-6 w-6 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const ChevronRightIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export const ChevronDownIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export const ChevronUpIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7-7" />
    </svg>
);

export const EditIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

export const DatabaseIcon = ({ className = "h-6 w-6 mr-2", style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7a8 8 0 0116 0" />
    </svg>
);

export const PaperclipIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);

export const PrintIcon = ({ className = "h-6 w-6", style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

export const CashIcon = ({ className = "h-6 w-6", style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export const WalletIcon = ({ className = "h-6 w-6", style }: { className?: string, style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} {...iconProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

export const DownloadIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const UserGroupIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export const KeyIcon = ({ className = "h-6 w-6", style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2h2v-2h2v-2l2.257-2.257A6 6 0 0121 8z" />
    </svg>
);

export const RefreshIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 19v-5h-5M4 4a14.952 14.952 0 0113.253 6.747m-13.253 0H20m-16 0A14.952 14.952 0 007.253 17.253m12.747 0A14.952 14.952 0 0116.747 6.747m0 10.506H4" />
    </svg>
);

export const ChartBarIcon = ({ className = "h-6 w-6", style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const CurrencyRupeeIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M18 5h-11h3a4 4 0 0 1 0 8h-3l6 6"></path>
       <line x1="7" y1="9" x2="18" y2="9"></line>
    </svg>
);

export const DocumentTextIcon = ({ className = "h-6 w-6 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const DotsVerticalIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
    </svg>
);

export const WhatsappIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413C24 18.667 18.664 24 .107 24h.001zM11.951 3.511c-4.636 0-8.403 3.768-8.403 8.403.002 1.543.424 3.033 1.218 4.354l-.824 3.012 3.075-.803c1.288.715 2.748 1.103 4.234 1.104 4.637 0 8.403-3.768 8.403-8.403s-3.766-8.403-8.403-8.403zM17.935 15.228c-.201-.101-1.18-.583-1.362-.65-.182-.066-.314-.101-.446.101-.132.202-.515.65-.632.782-.117.131-.234.148-.435.048-.201-.1-.847-.313-1.614-.998-.596-.532-.998-1.192-1.115-1.393-.117-.201-.012-.313.089-.414.092-.092.201-.234.302-.349.101-.117.133-.202.2-.335.066-.132.033-.249-.017-.35-.05-.102-.446-1.074-.612-1.472-.16-.388-.328-.335-.446-.341-.117-.006-.249-.006-.381-.006s-.349.049-.531.249c-.182.2-.693.679-.693 1.644s.71 1.907.807 2.045c.098.139 1.393 2.128 3.376 2.973.498.213.89.34.1.18.448.188.847.164 1.164.1c.36-.073 1.18-.484 1.346-.948.164-.464.164-.86.117-.948-.049-.088-.182-.132-.383-.233z"/>
    </svg>
);

export const TruckIcon = ({ className = "h-6 w-6", style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.5,13.5H19.82A3,3,0,0,0,17,11.68V7A1,1,0,0,0,16,6H15a1,1,0,0,0-1,1v5H4.42A2.43,2.43,0,0,0,2,14.42V17a1,1,0,0,0,1,1H4a3,3,0,0,0,6,0h6a3,3,0,0,0,6,0h1a1,1,0,0,0,1-1V14.5A1,1,0,0,0,21.5,13.5ZM7,19a1,1,0,1,1,1-1A1,1,0,0,1,7,19Zm10,0a1,1,0,1,1,1-1A1,1,0,0,1,17,19ZM4,12.57A.43.43,0,0,1,4.42,12H13V7.5a.5.5,0,0,1,.5-.5H16a.5.5,0,0,1,.5.5V12h.58a1,1,0,0,1,.95.68,1,1,0,0,1-.25,1.06L16.42,15H4Z"/>
    </svg>
);

export const BadgeCheckIcon = ({ className = "h-6 w-6", style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
);

export const InfoIcon = ({ className = "h-6 w-6 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const FacebookIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.29h-3.128V11.69h3.128V9.396c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.02h-3.12V24h6.116c.735 0 1.325-.59 1.325-1.325V1.325C24 .59 23.41 0 22.675 0z"/>
    </svg>
);

export const WebsiteIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} {...iconProps} xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m-9 9h18" />
    </svg>
);

export const BuildingOfficeIcon = ({ className = "h-6 w-6 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

export const UserCircleIcon = ({ className = "h-10 w-10 text-[var(--color-primary)]" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15c2.486 0 4.743.996 6.397 2.653A7.488 7.488 0 0112 19.5a7.488 7.488 0 01-5.855-2.688zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
    </svg>
);

export const MailIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} {...iconProps} xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export const HomeIcon = ({ className = "h-6 w-6 mr-2", style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

export const ArrowLeftIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

export const ArrowRightIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

export const ClipboardCheckIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

export const BookOpenIcon = ({ className = "h-6 w-6 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

export const ClipboardDocumentListIcon = ({ className = "h-6 w-6 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

export const BellIcon = ({ className = "h-6 w-6 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

export const EyeIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

export const XCircleIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Fix: Added ClockIcon component to be used in the AG Office tray for pending items.
export const ClockIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);