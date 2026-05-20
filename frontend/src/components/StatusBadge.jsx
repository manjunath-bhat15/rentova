import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const statusConfig = {
  PENDING: {
    labelKey: 'statusPending',
    color: 'var(--accent-warning)',
    bg: 'rgba(253, 203, 110, 0.12)',
    icon: '⏳',
  },
  CONFIRMED: {
    labelKey: 'statusConfirmed',
    color: 'var(--accent-primary)',
    bg: 'rgba(255, 122, 0, 0.12)',
    icon: '✅',
  },
  IN_PROGRESS: {
    labelKey: 'statusInProgress',
    color: 'var(--accent-secondary)',
    bg: 'rgba(0, 206, 201, 0.12)',
    icon: '🔄',
  },
  COMPLETED: {
    labelKey: 'statusCompleted',
    color: 'var(--accent-success)',
    bg: 'rgba(0, 184, 148, 0.12)',
    icon: '🎉',
  },
  CANCELLED: {
    labelKey: 'statusCancelled',
    color: 'var(--accent-danger)',
    bg: 'rgba(255, 107, 107, 0.12)',
    icon: '❌',
  },
};

export default function StatusBadge({ status }) {
  const { t } = useThemeLanguage();
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-xs)',
        fontWeight: 600,
        color: config.color,
        background: config.bg,
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ fontSize: '12px' }}>{config.icon}</span>
      {t(config.labelKey)}
    </span>
  );
}
