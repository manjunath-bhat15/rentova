import React from 'react';

export function Icon({ name, className = '', label, style }) {
  const isDecorative = !label;

  const getSvg = () => {
    switch (name) {
      case 'overview':
      case 'dashboard':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case 'nearby':
      case 'map':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        );
      case 'listings':
      case 'services':
        return (
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
        );
      case 'add':
      case 'create':
        return (
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        );
      case 'bookings':
      case 'calendar':
        return (
          <svg viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'wallet':
        return (
          <svg viewBox="0 0 24 24">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <line x1="16" y1="15" x2="18" y2="15" />
          </svg>
        );
      case 'chat':
      case 'messages':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'bell':
      case 'notifications':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
      case 'hq':
      case 'commandCenter':
        return (
          <svg viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        );
      case 'users':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'logout':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        );
      case 'logo':
        return (
          <svg viewBox="0 0 24 24" strokeWidth="2.5">
            <path d="M4.5 16.5c-1.5-1.5-2.5-3.5-2.5-5.5s1-4 2.5-5.5 3.5-2.5 5.5-2.5 4 1 5.5 2.5L22 12l-6.5 6.5c-1.5 1.5-3.5 2.5-5.5 2.5s-4-1-5.5-2.5z" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          </svg>
        );
      case 'trash':
      case 'delete':
        return (
          <svg viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        );
      case 'edit':
      case 'modify':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        );

      // Booking Statuses
      case 'PENDING':
      case 'bookingCreated':
      case 'BOOKING_CREATED':
      case 'pending':
        return (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case 'CONFIRMED':
      case 'bookingConfirmed':
      case 'BOOKING_CONFIRMED':
      case 'confirmed':
        return (
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case 'IN_PROGRESS':
      case 'bookingInProgress':
      case 'BOOKING_IN_PROGRESS':
      case 'inProgress':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        );
      case 'COMPLETED':
      case 'bookingCompleted':
      case 'BOOKING_COMPLETED':
      case 'completed':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'CANCELLED':
      case 'bookingCancelled':
      case 'BOOKING_CANCELLED':
      case 'cancelled':
        return (
          <svg viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        );

      // Wallet / Transaction types
      case 'TOP_UP':
      case 'WALLET_TOPUP':
      case 'topUp':
        return (
          <svg viewBox="0 0 24 24">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <line x1="12" y1="15" x2="12" y2="15.01" />
          </svg>
        );
      case 'BOOKING_PAYMENT':
      case 'bookingPayment':
        return (
          <svg viewBox="0 0 24 24">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        );
      case 'BOOKING_PAYOUT':
      case 'WALLET_PAYOUT':
      case 'bookingPayout':
        return (
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case 'REFUND':
      case 'WALLET_REFUND':
      case 'refund':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M3 2v6h6M3 8a9 9 0 1 1 2.24 7.62" />
          </svg>
        );
      case 'TRANSFER':
      case 'transfer':
        return (
          <svg viewBox="0 0 24 24">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14M7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        );
      case 'CHAT_MESSAGE':
      case 'chatMessage':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );

      default:
        return null;
    }
  };

  const baseSvg = getSvg();
  if (!baseSvg) return null;

  return (
    <span
      className={`icon-ui-container ${className}`}
      role={isDecorative ? undefined : 'img'}
      aria-label={label}
      aria-hidden={isDecorative ? 'true' : undefined}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}
    >
      {React.cloneElement(baseSvg, {
        className: `icon-ui ${baseSvg.props.className || ''}`.trim(),
        xmlns: 'http://www.w3.org/2000/svg',
        fill: baseSvg.props.fill || 'none',
        stroke: baseSvg.props.stroke || 'currentColor',
        strokeWidth: baseSvg.props.strokeWidth || '2',
        strokeLinecap: baseSvg.props.strokeLinecap || 'round',
        strokeLinejoin: baseSvg.props.strokeLinejoin || 'round',
      })}
    </span>
  );
}
