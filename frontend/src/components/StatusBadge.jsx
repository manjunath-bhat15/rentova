import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Icon } from './Icon';

const statusConfig = {
  PENDING: {
    labelKey: 'statusPending',
    color: 'var(--accent-warning)',
    bg: 'rgba(253, 203, 110, 0.12)',
    iconName: 'pending',
  },
  CONFIRMED: {
    labelKey: 'statusConfirmed',
    color: 'var(--accent-primary)',
    bg: 'rgba(255, 122, 0, 0.12)',
    iconName: 'confirmed',
  },
  IN_PROGRESS: {
    labelKey: 'statusInProgress',
    color: 'var(--accent-secondary)',
    bg: 'rgba(0, 206, 201, 0.12)',
    iconName: 'inProgress',
  },
  COMPLETED: {
    labelKey: 'statusCompleted',
    color: 'var(--accent-success)',
    bg: 'rgba(0, 184, 148, 0.12)',
    iconName: 'completed',
  },
  CANCELLED: {
    labelKey: 'statusCancelled',
    color: 'var(--accent-danger)',
    bg: 'rgba(255, 107, 107, 0.12)',
    iconName: 'cancelled',
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
      <Icon name={config.iconName} style={{ width: '13px', height: '13px', color: config.color }} />
      {t(config.labelKey)}
    </span>
  );
}
