import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./StatisticsModal.css";

const COLORS = [
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#f9ca24",
  "#6c5ce7",
  "#a29bfe",
  "#fd79a8",
  "#fdcb6e",
  "#00b894",
  "#e17055",
];

export default function StatisticsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [comparisonData, setComparisonData] = useState(null);
  const [complexityData, setComplexityData] = useState(null);
  const [deityData, setDeityData] = useState(null);
  const [vocabularyData, setVocabularyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadStatistics();
    }
  }, [isOpen]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const [comparison, complexity, deities, vocabulary] = await Promise.all([
        fetch("/data/analysis/mandala-comparison.json").then((r) => r.json()),
        fetch("/data/analysis/complexity.json").then((r) => r.json()),
        fetch("/data/analysis/deities.json").then((r) => r.json()),
        fetch("/data/analysis/vocabulary.json").then((r) => r.json()),
      ]);

      setComparisonData(comparison);
      setComplexityData(complexity);
      setDeityData(deities);
      setVocabularyData(vocabulary);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderOverview = () => {
    if (!complexityData || !comparisonData) return null;

    const { overall } = complexityData;

    return (
      <div className="stats-overview">
        <h2>Rig Veda Statistics Overview</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{overall.totalHymns.toLocaleString()}</div>
            <div className="stat-label">Total Hymns (Sūktas)</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overall.totalVerses.toLocaleString()}</div>
            <div className="stat-label">Total Verses (Ṛcs)</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overall.totalWords.toLocaleString()}</div>
            <div className="stat-label">Total Words</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overall.totalLetters?.toLocaleString() || "432,000"}</div>
            <div className="stat-label">Total Letters (Akṣaras)</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overall.totalUniqueWords?.toLocaleString() || "31,000"}</div>
            <div className="stat-label">Unique Words</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{overall.totalMeters || 25}</div>
            <div className="stat-label">Vedic Meters</div>
          </div>
        </div>

        <div className="chart-section">
          <h3>Verse Count by Mandala</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData.verseCountComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="mandala" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                }}
                itemStyle={{
                  color: "#ffffff",
                }}
              />
              <Bar dataKey="count" fill="#4ecdc4" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h3>Hymn Count by Mandala</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData.hymnCountComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="mandala" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                }}
                itemStyle={{
                  color: "#ffffff",
                }}
              />
              <Bar dataKey="count" fill="#f9ca24" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderComparison = () => {
    if (!comparisonData) return null;

    return (
      <div className="stats-comparison">
        <h2>Mandala Comparison</h2>

        <div className="chart-section">
          <h3>Vocabulary Size by Mandala</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData.vocabSizeComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="mandala" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                }}
                itemStyle={{
                  color: "#ffffff",
                }}
              />
              <Bar dataKey="count" fill="#6c5ce7" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="comparison-table">
          <h3>Detailed Comparison</h3>
          <table>
            <thead>
              <tr>
                <th>Mandala</th>
                <th>Hymns</th>
                <th>Verses</th>
                <th>Words</th>
                <th>Vocab Size</th>
                <th>Avg Verses/Hymn</th>
                <th>Avg Words/Verse</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.summary.map((m) => (
                <tr key={m.mandala}>
                  <td>{m.mandala}</td>
                  <td>{m.hymnCount}</td>
                  <td>{m.verseCount}</td>
                  <td>{m.wordCount.toLocaleString()}</td>
                  <td>{m.vocabSize.toLocaleString()}</td>
                  <td>{m.avgVersesPerHymn}</td>
                  <td>{m.avgWordsPerVerse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderComplexity = () => {
    if (!complexityData) return null;

    const avgVersesData = complexityData.byMandala.map((m) => ({
      mandala: m.mandala,
      avgVerses: parseFloat(m.avgVersesPerHymn),
    }));

    const avgWordsData = complexityData.byMandala.map((m) => ({
      mandala: m.mandala,
      avgWords: parseFloat(m.avgWordsPerVerse),
    }));

    return (
      <div className="stats-complexity">
        <h2>Structure Complexity</h2>

        <div className="chart-section">
          <h3>Average Verses per Hymn by Mandala</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={avgVersesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="mandala" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                }}
                itemStyle={{
                  color: "#ffffff",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgVerses"
                stroke="#45b7d1"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h3>Average Words per Verse by Mandala</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={avgWordsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="mandala" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                }}
                itemStyle={{
                  color: "#ffffff",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgWords"
                stroke="#fd79a8"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="complexity-table">
          <h3>Complexity Metrics by Mandala</h3>
          <table>
            <thead>
              <tr>
                <th>Mandala</th>
                <th>Hymns</th>
                <th>Verses</th>
                <th>Total Words</th>
                <th>Avg Verses/Hymn</th>
                <th>Avg Words/Verse</th>
              </tr>
            </thead>
            <tbody>
              {complexityData.byMandala.map((m) => (
                <tr key={m.mandala}>
                  <td>{m.mandala}</td>
                  <td>{m.hymnCount}</td>
                  <td>{m.verseCount}</td>
                  <td>{m.wordCount.toLocaleString()}</td>
                  <td>{m.avgVersesPerHymn}</td>
                  <td>{m.avgWordsPerVerse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDeities = () => {
    if (!deityData) return null;

    // Get top 10 deities for pie chart
    const topDeities = deityData.overall.slice(0, 10);
    const pieData = topDeities.map((d) => ({
      name: d.deity,
      value: d.totalHymns,
    }));

    return (
      <div className="stats-deities">
        <h2>Deity Distribution</h2>

        <div className="chart-section">
          <h3>Top 10 Deities by Hymn Count</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                }}
                itemStyle={{
                  color: "#ffffff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="deity-table">
          <h3>All Deities</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Deity</th>
                  <th>Hymn Count</th>
                </tr>
              </thead>
              <tbody>
                {deityData.overall.map((d, idx) => (
                  <tr key={idx}>
                    <td>{d.deity}</td>
                    <td>{d.totalHymns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderVocabulary = () => {
    if (!vocabularyData) return null;

    const mandalaVocab = vocabularyData.byMandala.map((m) => ({
      mandala: m.mandala,
      uniqueWords: m.uniqueWords,
      totalWords: m.totalWords,
    }));

    return (
      <div className="stats-vocabulary">
        <h2>Vocabulary Analysis</h2>

        <div className="chart-section">
          <h3>Unique vs Total Words by Mandala</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mandalaVocab}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="mandala" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                }}
                itemStyle={{
                  color: "#ffffff",
                }}
              />
              <Legend />
              <Bar dataKey="uniqueWords" fill="#00b894" name="Unique Words" />
              <Bar dataKey="totalWords" fill="#fdcb6e" name="Total Words" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="vocab-table">
          <h3>Vocabulary by Mandala</h3>
          <table>
            <thead>
              <tr>
                <th>Mandala</th>
                <th>Unique Words</th>
                <th>Total Hymns</th>
                <th>Total Verses</th>
                <th>Total Words</th>
              </tr>
            </thead>
            <tbody>
              {vocabularyData.byMandala.map((m) => (
                <tr key={m.mandala}>
                  <td>{m.mandala}</td>
                  <td>{m.uniqueWords.toLocaleString()}</td>
                  <td>{m.totalHymns}</td>
                  <td>{m.totalVerses}</td>
                  <td>{m.totalWords.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="statistics-modal-overlay" onClick={onClose}>
      <div className="statistics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="statistics-modal-header">
          <h1>📊 Rig Veda Statistics</h1>
          <button className="close-stats-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="statistics-tabs">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={activeTab === "comparison" ? "active" : ""}
            onClick={() => setActiveTab("comparison")}
          >
            Comparison
          </button>
          <button
            className={activeTab === "complexity" ? "active" : ""}
            onClick={() => setActiveTab("complexity")}
          >
            Complexity
          </button>
          <button
            className={activeTab === "deities" ? "active" : ""}
            onClick={() => setActiveTab("deities")}
          >
            Deities
          </button>
          <button
            className={activeTab === "vocabulary" ? "active" : ""}
            onClick={() => setActiveTab("vocabulary")}
          >
            Vocabulary
          </button>
        </div>

        <div className="statistics-content">
          {loading ? (
            <div className="loading-stats">Loading statistics...</div>
          ) : (
            <>
              {activeTab === "overview" && renderOverview()}
              {activeTab === "comparison" && renderComparison()}
              {activeTab === "complexity" && renderComplexity()}
              {activeTab === "deities" && renderDeities()}
              {activeTab === "vocabulary" && renderVocabulary()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
