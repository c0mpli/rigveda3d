# Rig Veda 3D Explorer

An immersive 3D visualization and exploration platform for the ancient Rig Veda texts. Navigate through the 10 Mandalas (books) in a beautiful interactive 3D space, search through verses with AI-powered semantic search, and discover the wisdom of ancient Vedic hymns.

## Features

### 🌌 3D Navigation

- **Interactive Mandala Atoms**: Explore the 10 Mandalas represented as glowing 3D atoms in space
- **Smooth Animations**: Elegant zoom and transition effects when navigating between Mandalas
- **Dynamic Backgrounds**: Each Mandala has its own unique color theme that transforms the entire space
- **Immersive Audio**: Background music to enhance the spiritual exploration experience

### 🔍 Advanced Search

- **AI-Powered Semantic Search**: Uses OpenAI embeddings to understand context and meaning, not just keywords
  - Search by concepts: "divine light", "cosmic order", "inner peace"
  - Explore themes: "battle", "sacrifice", "enlightenment", "creation"
  - Find deities: "Agni", "Indra", "Soma", "Varuna"
- **Text-Based Fallback**: Fast keyword search across Sanskrit, transliteration, and translation
- **Smart Filters**: Filter search results by:
  - Mandala (1-10)
  - Hymn Range
  - Deity
- **Click-to-Navigate**: Click any search result to zoom directly to that Mandala and hymn

### 📖 Hymn Viewing

- **Scrollable Hymn Cards**: Beautiful 3D cards displaying complete hymns with all verses
- **Multiple Text Formats**: View Sanskrit, transliteration, and English translation
- **Audio Playback**: Listen to Sanskrit verses with text-to-speech
- **Word Highlighting**: Interactive word-by-word highlighting during audio playback
- **Word Meanings**: Click any word to see its meaning in a dedicated sidebar

### 📚 Dictionary

- Integrated Sanskrit dictionary for looking up word meanings
- Quick access from the navigation bar

### 🎨 User Interface

- **Collapsible Navbar**: Clean, minimal interface with volume controls, search, and dictionary access
- **Hymns Sidebar**: Browse all hymns in the selected Mandala with easy navigation
- **Filter Indicator**: Visual indicator showing when filters are applied
- **Responsive Design**: Works across different screen sizes

### ⚡ Performance

- Optimized 3D rendering with React Three Fiber
- Efficient search with pre-generated embeddings
- Smooth animations with React Spring
- Post-processing effects with bloom shaders

## Tech Stack

- **React 19** - UI framework
- **React Three Fiber** - 3D rendering with Three.js
- **@react-three/drei** - 3D helpers and utilities
- **@react-three/postprocessing** - Visual effects (bloom, etc.)
- **React Spring** - Smooth animations
- **OpenAI API** - Semantic search with embeddings
- **Wouter** - Lightweight routing
- **Vite** - Fast build tool and dev server

## Getting Started

### Prerequisites

- Node.js 16+ or Bun
- OpenAI API key (optional, for semantic search)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/rigveda3d.git
cd rigveda3d
```

2. Install dependencies:

```bash
npm install
# or
bun install
```

3. (Optional) Set up OpenAI API key for semantic search:

```bash
# Create .env file
echo "VITE_OPENAI_API_KEY=your_api_key_here" > .env
```

4. Start the development server:

```bash
npm run dev
# or
bun dev
```

5. Open your browser to `http://localhost:5173`

## Project Structure

```
rigveda3d/
├── src/
│   ├── components/
│   │   ├── three/          # 3D React Three Fiber components
│   │   │   ├── Atom.jsx           # Mandala atom spheres
│   │   │   ├── Background.jsx     # Dynamic background
│   │   │   ├── HymnCard.jsx       # 3D hymn display cards
│   │   │   ├── ScrollableHymnCard.jsx
│   │   │   ├── HymnCardsContainer.jsx
│   │   │   └── RotatingStars.jsx  # Particle effects
│   │   └── ui/             # 2D UI components
│   │       ├── Navbar.jsx         # Top navigation
│   │       ├── SearchModal.jsx    # Search interface with filters
│   │       ├── FilterModal.jsx    # Standalone filter modal
│   │       ├── Dictionary.jsx     # Dictionary lookup
│   │       ├── HymnsSidebar2D.jsx # Hymn list sidebar
│   │       └── WordMeaningSidebar.jsx
│   ├── data/
│   │   └── MandalaData.js  # Mandala metadata (colors, names, etc.)
│   ├── hooks/
│   │   └── useRigVedaSearch.js    # Search logic hook
│   ├── utils/
│   │   ├── DataLoader.js   # Data loading utilities
│   │   ├── searchUtils.js  # Search and filter functions
│   │   ├── CardShader.js   # Custom GLSL shaders
│   │   └── ColorUtils.js   # Color manipulation
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Entry point
├── public/
│   ├── data/
│   │   └── text/
│   │       ├── rig_veda_texts.json    # Complete Rig Veda text
│   │       ├── verses_index.json      # Verse metadata
│   │       └── embeddings.json        # Pre-computed embeddings
│   └── sounds/
│       └── spacebg.mp3     # Background music
└── package.json
```

## Data Format

The Rig Veda data is structured as follows:

```json
{
  "mandalas": [
    {
      "number": 1,
      "hymns": [
        {
          "number": 1,
          "title": "To Agni",
          "verses": [
            {
              "sanskrit": "अग्निमीळे पुरोहितं...",
              "transliteration": "Agnim īḷe purohitaṃ...",
              "translation": "I praise Agni, the chosen Priest..."
            }
          ]
        }
      ]
    }
  ]
}
```

## Features in Detail

### Search Flow

1. User enters a query in the search modal
2. Optionally applies filters (Mandala, Hymn Range, Deity)
3. System tries semantic search first (if API key available)
4. Falls back to text search if semantic search fails
5. Results are displayed with similarity scores
6. Clicking a result navigates to that Mandala and scrolls to the specific verse

### Navigation Flow

1. Start at the main view with all 10 Mandala atoms
2. Click on a Mandala atom
3. Camera zooms in with smooth animation
4. Mandala info overlay appears
5. Click "Explore" to enter exploration mode
6. Background changes to Mandala's color theme
7. Hymn card appears with scrollable verses
8. Hymns sidebar shows all available hymns
9. Click back button to return to main view

## Configuration

### Environment Variables

- `VITE_OPENAI_API_KEY` - OpenAI API key for semantic search (optional)

### Customization

- **Colors**: Edit `src/data/MandalaData.js` to change Mandala colors
- **Audio**: Replace `public/sounds/spacebg.mp3` for different background music
- **Shaders**: Modify `src/utils/CardShader.js` for custom visual effects

## Performance Optimization

- Pre-computed embeddings stored locally to avoid API calls for every verse
- Efficient 3D rendering with instance meshes where possible
- Lazy loading of hymn content
- Debounced search input
- Optimized shaders and post-processing effects

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

WebGL 2.0 support required for 3D features.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for educational purposes.

## Acknowledgments

- Rig Veda texts sourced from public domain translations
- 3D visualization inspired by ancient Vedic cosmology
- Built with love for preserving and sharing ancient wisdom

## Roadmap

- [ ] Add more detailed commentary for each hymn
- [ ] Data verification for each hymn
- [ ] Implement bookmarking and favorites
- [ ] Add user annotations
- [ ] Mobile optimization
- [ ] Multi-language support
- [ ] Social sharing features

---

**Built with React, Three.js, and AI** • [View Demo](#) • [Report Bug](#) • [Request Feature](#)
