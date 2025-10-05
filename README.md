# Rig Veda 3D Explorer

An immersive 3D visualization platform for exploring the ancient Rig Veda texts. Navigate through 10 Mandalas in interactive 3D space with AI-powered semantic search.

🌐 **Live Demo**: [https://rigveda3d.vercel.app/](https://rigveda3d.vercel.app/)

## Features

- **3D Navigation**: Explore 10 Mandalas as interactive atoms in 3D space with smooth animations and dynamic color themes
- **AI-Powered Search**: Semantic search using OpenAI embeddings for contextual understanding, with filters and direct verse navigation
- **Multi-format Text**: View verses in Sanskrit (Devanagari), transliteration, and English translation
- **Audio Narration**: Listen to narrations in Hindi or English with word-by-word highlighting
- **Sanskrit Dictionary**: Integrated word lookup for meanings
- **Responsive UI**: Clean interface with collapsible controls and browsable hymns sidebar

## Installation

1. **Clone and install**

```bash
git clone https://github.com/yourusername/rigveda3d.git
cd rigveda3d
bun install  # or npm install
```

2. **Optional: Add embeddings for offline semantic search**

The embeddings.json file (193 MB) is not included in the repo. The app will work without it using text-based search. For semantic search:

- Contact the repository owner for the embeddings file, or
- Use the OpenAI API key (step 3) for live semantic search

3. **Configure API key** (optional, for semantic search)

```bash
echo "VITE_OPENAI_API_KEY=your_api_key_here" > .env
```

4. **Run development server**

```bash
bun dev  # or npm run dev
```

4. **Open browser**

```
http://localhost:5173
```

## Roadmap

- [ ] Bookmarking and favorites system
- [ ] User annotations and notes
- [✓] Mobile app version
- [ ] Multi-language interface support
- [ ] Social sharing capabilities
- [ ] Statistics about Rig Veda
- [ ] Interactive dictionary to learn Sanskrit words from the Veda
- [ ] Quiz mode for Vedic vocabulary
- [ ] Dictionary-based quiz system
- [ ] Backstory and context for each hymn

## Sources

**Text Data**: [Rigveda Dataset on Kaggle](https://www.kaggle.com/datasets/varunrajuvangar/rigved-all-sukta-verses-and-meaning-dataset)
**Audio Data**: [Rigveda Audios](https://github.com/aasi-archive/rv-audio)

## License

MIT License - Free for educational and personal use.

## Acknowledgments

Built with reverence for ancient Vedic wisdom and modern web technology.
