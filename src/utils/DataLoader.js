export const loadRigVedaData = async () => {
  try {
    const response = await fetch('/data/text/rig_veda_texts.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading Rig Veda data:', error);
    return null;
  }
};

// Get random hymns from a mandala
export const getRandomHymnsFromMandala = (mandalaData, mandalaNumber, count = 3) => {
  if (!mandalaData || !mandalaData.mandalas) return [];

  const mandala = mandalaData.mandalas.find(m => m.number === mandalaNumber);
  if (!mandala || !mandala.hymns) return [];

  // Get random hymn indices
  const hymnCount = mandala.hymns.length;
  const selectedIndices = new Set();

  while (selectedIndices.size < Math.min(count, hymnCount)) {
    selectedIndices.add(Math.floor(Math.random() * hymnCount));
  }

  // Get the selected hymns and format them
  return Array.from(selectedIndices).map(index => {
    const hymn = mandala.hymns[index];
    // Get first verse or a random verse
    const verse = hymn.verses && hymn.verses.length > 0
      ? hymn.verses[0]
      : { sanskrit: '', transliteration: '', translation: 'No translation available' };

    return {
      number: `${mandalaNumber}.${hymn.number}`,
      title: hymn.title || `Hymn ${hymn.number}`,
      sanskrit: verse.sanskrit || '',
      transliteration: verse.transliteration || '',
      translation: verse.translation || 'No translation available',
    };
  });
};

// Get all hymns from a mandala
export const getAllHymnsFromMandala = (mandalaData, mandalaNumber) => {
  if (!mandalaData || !mandalaData.mandalas) return [];

  const mandala = mandalaData.mandalas.find(m => m.number === mandalaNumber);
  if (!mandala || !mandala.hymns) return [];

  return mandala.hymns.map(hymn => {
    const verse = hymn.verses && hymn.verses.length > 0
      ? hymn.verses[0]
      : { sanskrit: '', transliteration: '', translation: 'No translation available' };

    return {
      number: `${mandalaNumber}.${hymn.number}`,
      hymnNumber: hymn.number,
      title: hymn.title || `Hymn ${hymn.number}`,
      sanskrit: verse.sanskrit || '',
      transliteration: verse.transliteration || '',
      translation: verse.translation || 'No translation available',
      verseCount: hymn.verses ? hymn.verses.length : 0,
      verses: hymn.verses || [], // Include all verses
    };
  });
};

// Get specific hymns by their numbers
export const getSpecificHymns = (mandalaData, hymnReferences) => {
  if (!mandalaData || !mandalaData.mandalas) return [];

  return hymnReferences.map(ref => {
    const [mandalaNum, hymnNum] = ref.split('.').map(Number);
    const mandala = mandalaData.mandalas.find(m => m.number === mandalaNum);

    if (!mandala) return null;

    const hymn = mandala.hymns.find(h => h.number === hymnNum);
    if (!hymn || !hymn.verses || hymn.verses.length === 0) return null;

    const verse = hymn.verses[0];

    return {
      number: ref,
      hymnNumber: hymn.number,
      title: hymn.title || `Hymn ${hymnNum}`,
      sanskrit: verse.sanskrit || '',
      transliteration: verse.transliteration || '',
      translation: verse.translation || 'No translation available',
      verseCount: hymn.verses ? hymn.verses.length : 0,
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
