export const loadRigVedaData = async () => {
  try {
    const response = await fetch('/data/text/complete_rigveda_all_mandalas.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading Rig Veda data:', error);
    return null;
  }
};

// Get random hymns from a mandala
export const getRandomHymnsFromMandala = (mandalaData, mandalaNumber, count = 3) => {
  if (!mandalaData) return [];

  const mandalaKey = `Mandala ${mandalaNumber}`;
  const mandala = mandalaData[mandalaKey];
  if (!mandala) return [];

  // Get all sukta keys
  const suktaKeys = Object.keys(mandala);
  const suktaCount = suktaKeys.length;
  const selectedIndices = new Set();

  while (selectedIndices.size < Math.min(count, suktaCount)) {
    selectedIndices.add(Math.floor(Math.random() * suktaCount));
  }

  // Get the selected hymns and format them
  return Array.from(selectedIndices).map(index => {
    const suktaKey = suktaKeys[index];
    const suktaNum = parseInt(suktaKey.split(' ')[1]);
    const riks = mandala[suktaKey];

    // Get first rik
    const rik = riks && riks.length > 0
      ? riks[0]
      : null;

    if (!rik) return null;

    return {
      number: `${mandalaNumber}.${suktaNum}`,
      title: `Rig Veda Mandala ${mandalaNumber} Sukta ${suktaNum}`,
      sanskrit: rik.samhita?.devanagari?.text || '',
      transliteration: rik.padapatha?.transliteration?.text || '',
      translation: rik.translation || 'No translation available',
    };
  }).filter(Boolean);
};

// Get all hymns from a mandala
export const getAllHymnsFromMandala = (mandalaData, mandalaNumber, filters = {}) => {
  if (!mandalaData) return [];

  const mandalaKey = `Mandala ${mandalaNumber}`;
  const mandala = mandalaData[mandalaKey];
  if (!mandala) return [];

  let suktaKeys = Object.keys(mandala).sort((a, b) => {
    const numA = parseInt(a.split(' ')[1]);
    const numB = parseInt(b.split(' ')[1]);
    return numA - numB;
  });

  // Apply hymn range filter
  if (filters.hymnFrom || filters.hymnTo) {
    const hymnFrom = filters.hymnFrom ? parseInt(filters.hymnFrom) : 0;
    const hymnTo = filters.hymnTo ? parseInt(filters.hymnTo) : Infinity;
    suktaKeys = suktaKeys.filter(key => {
      const suktaNum = parseInt(key.split(' ')[1]);
      return suktaNum >= hymnFrom && suktaNum <= hymnTo;
    });
  }

  return suktaKeys.map(suktaKey => {
    const suktaNum = parseInt(suktaKey.split(' ')[1]);
    const riks = mandala[suktaKey];

    const firstRik = riks && riks.length > 0
      ? riks[0]
      : null;

    if (!firstRik) return null;

    // Transform riks to verses format for backward compatibility
    const verses = riks.map(rik => ({
      number: rik.rik_number,
      sanskrit: rik.samhita?.devanagari?.text || '',
      transliteration: rik.padapatha?.transliteration?.text || '',
      translation: rik.translation || '',
    }));

    return {
      number: `${mandalaNumber}.${suktaNum}`,
      hymnNumber: suktaNum,
      title: `Rig Veda Mandala ${mandalaNumber} Sukta ${suktaNum}`,
      sanskrit: firstRik.samhita?.devanagari?.text || '',
      transliteration: firstRik.padapatha?.transliteration?.text || '',
      translation: firstRik.translation || 'No translation available',
      verseCount: riks.length,
      verses: verses,
    };
  }).filter(Boolean);
};

// Get specific hymns by their numbers
export const getSpecificHymns = (mandalaData, hymnReferences) => {
  if (!mandalaData) return [];

  return hymnReferences.map(ref => {
    const [mandalaNum, suktaNum] = ref.split('.').map(Number);
    const mandalaKey = `Mandala ${mandalaNum}`;
    const suktaKey = `Sukta ${suktaNum}`;

    const mandala = mandalaData[mandalaKey];
    if (!mandala) return null;

    const riks = mandala[suktaKey];
    if (!riks || riks.length === 0) return null;

    const firstRik = riks[0];

    return {
      number: ref,
      hymnNumber: suktaNum,
      title: `Rig Veda Mandala ${mandalaNum} Sukta ${suktaNum}`,
      sanskrit: firstRik.samhita?.devanagari?.text || '',
      transliteration: firstRik.padapatha?.transliteration?.text || '',
      translation: firstRik.translation || 'No translation available',
      verseCount: riks.length,
    };
  }).filter(Boolean);
};

// Important hymns for each mandala (curated selection)
export const IMPORTANT_HYMNS = {
  1: ['1.1', '1.32', '1.154'],
  2: ['2.1', '2.28', '2.35'],
  3: ['3.62', '3.1', '3.54'],
  4: ['4.26', '4.42', '4.57'],
  5: ['5.1', '5.80', '5.85'],
  6: ['6.16', '6.47', '6.61'],
  7: ['7.49', '7.86', '7.88'],
  8: ['8.48', '8.79', '8.100'],
  9: ['9.1', '9.66', '9.113'],
  10: ['10.129', '10.90', '10.85'],
};
