import { useState } from 'react';
import { copyToClipboard } from '../../utils/deepLinkUtils';

const BUTTON_BASE_STYLE = {
  padding: '8px 16px',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  backdropFilter: 'blur(10px)',
};

const ICON_STYLE = {
  fontSize: '1rem',
};

export default function CopyLinkButton({ url, label = 'Copy Link', color = '#ffffff' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    const success = await copyToClipboard(url);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        ...BUTTON_BASE_STYLE,
        borderColor: copied ? color : 'rgba(255, 255, 255, 0.2)',
        background: copied ? `${color}20` : 'rgba(255, 255, 255, 0.1)',
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          e.target.style.background = `${color}30`;
          e.target.style.borderColor = color;
          e.target.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.target.style.transform = 'translateY(0)';
        }
      }}
    >
      <span style={ICON_STYLE}>{copied ? '✓' : '🔗'}</span>
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  );
}
