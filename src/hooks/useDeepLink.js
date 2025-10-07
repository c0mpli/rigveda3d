import { useEffect, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { parseHymnReference } from '../utils/deepLinkUtils';

/**
 * Hook to handle deep linking and URL routing
 * @param {object} handlers - Route handlers for different URL patterns
 * @returns {object} Current route information
 */
export default function useDeepLink({
  onMandalaRoute,
  onHymnRoute,
  onDeityRoute,
}) {
  const [, setLocation] = useLocation();
  const processedRef = useRef(false);

  // Check for mandala route
  const [mandalaMatch, mandalaParams] = useRoute('/mandala/:id');
  const [hymnMatch, hymnParams] = useRoute('/hymn/:ref');
  const [deityMatch, deityParams] = useRoute('/deity/:name');

  useEffect(() => {
    if (mandalaMatch && mandalaParams.id && onMandalaRoute && !processedRef.current) {
      const mandalaNumber = parseInt(mandalaParams.id);
      if (mandalaNumber >= 1 && mandalaNumber <= 10) {
        processedRef.current = true;
        onMandalaRoute(mandalaNumber);
        // Clear URL after processing to allow free navigation
        setTimeout(() => {
          setLocation('/');
          processedRef.current = false;
        }, 1000);
      }
    }
  }, [mandalaMatch, mandalaParams, onMandalaRoute, setLocation]);

  useEffect(() => {
    if (hymnMatch && hymnParams.ref && onHymnRoute && !processedRef.current) {
      const parsed = parseHymnReference(hymnParams.ref);
      if (parsed.mandala && parsed.hymn) {
        processedRef.current = true;
        onHymnRoute(parsed);
        // Clear URL after processing to allow free navigation
        setTimeout(() => {
          setLocation('/');
          processedRef.current = false;
        }, 2000);
      }
    }
  }, [hymnMatch, hymnParams, onHymnRoute, setLocation]);

  useEffect(() => {
    if (deityMatch && deityParams.name && onDeityRoute && !processedRef.current) {
      const deityName = deityParams.name.replace(/-/g, ' ');
      processedRef.current = true;
      onDeityRoute(deityName);
      // Clear URL after processing to allow free navigation
      setTimeout(() => {
        setLocation('/');
        processedRef.current = false;
      }, 1000);
    }
  }, [deityMatch, deityParams, onDeityRoute, setLocation]);

  // Navigate to a specific route programmatically
  const navigateTo = {
    mandala: (mandalaNumber) => setLocation(`/mandala/${mandalaNumber}`),
    hymn: (mandala, hymn, verse = null) => {
      const ref = verse ? `${mandala}.${hymn}.${verse}` : `${mandala}.${hymn}`;
      setLocation(`/hymn/${ref}`);
    },
    deity: (deityName) => {
      const normalized = deityName.toLowerCase().replace(/\s+/g, '-');
      setLocation(`/deity/${normalized}`);
    },
    home: () => setLocation('/'),
  };

  return {
    currentRoute: {
      isMandala: mandalaMatch,
      isHymn: hymnMatch,
      isDeity: deityMatch,
      params: mandalaParams || hymnParams || deityParams,
    },
    navigateTo,
  };
}
