// components/sound-bath/floating-player.tsx

'use client';

import { useSoundBath } from './sound-bath-context';
import { CHAKRAS } from '@/lib/sound-bath/constants';

export function FloatingPlayer() {
  const {
    isPlaying,
    isExpanded,
    density,
    randomness,
    masterVolume,
    selectedChakras,
    togglePlay,
    setDensity,
    setRandomness,
    setMasterVolume,
    toggleChakra,
    toggleExpanded,
  } = useSoundBath();

  return (
    <div style={styles.container}>
      {isExpanded && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <span style={styles.title}>聲浴</span>
            <button onClick={toggleExpanded} style={styles.closeBtn}>×</button>
          </div>

          <button
            onClick={togglePlay}
            style={{
              ...styles.playBtn,
              backgroundColor: isPlaying ? '#e53935' : '#1e88e5',
            }}
          >
            {isPlaying ? '停止' : '開始'}
          </button>

          <div style={styles.control}>
            <label style={styles.label}>層疊密度</label>
            <input
              type="range"
              min={1}
              max={7}
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.value}>{density}</span>
          </div>

          <div style={styles.control}>
            <label style={styles.label}>隨機度</label>
            <input
              type="range"
              min={0}
              max={100}
              value={randomness}
              onChange={(e) => setRandomness(Number(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.value}>{randomness}%</span>
          </div>

          <div style={styles.control}>
            <label style={styles.label}>音量</label>
            <input
              type="range"
              min={0}
              max={100}
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.value}>{masterVolume}%</span>
          </div>

          <div style={styles.chakras}>
            <label style={styles.label}>脈輪選擇</label>
            <div style={styles.chakraGrid}>
              {CHAKRAS.map((chakra) => {
                const isSelected = selectedChakras.includes(chakra.id);
                return (
                  <button
                    key={chakra.id}
                    onClick={() => toggleChakra(chakra.id)}
                    style={{
                      ...styles.chakraBtn,
                      backgroundColor: isSelected ? chakra.color : 'transparent',
                      border: `2px solid ${chakra.color}`,
                      color: isSelected ? '#fff' : chakra.color,
                    }}
                    title={`${chakra.nameZh} - ${chakra.frequency}Hz`}
                  >
                    {chakra.nameZh}
                  </button>
                );
              })}
            </div>
          </div>

          <p style={styles.hint}>
            {selectedChakras.length === 0
              ? '已選全部 7 脈輪'
              : `已選 ${selectedChakras.length} 個脈輪`}
          </p>
        </div>
      )}

      <button
        onClick={toggleExpanded}
        style={{
          ...styles.fab,
          backgroundColor: isPlaying ? '#43a047' : '#616161',
        }}
        title="聲浴"
      >
        🕉
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px',
  },
  fab: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'background-color 0.3s',
  },
  panel: {
    width: '280px',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    lineHeight: 1,
  },
  playBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'background-color 0.2s',
  },
  control: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    marginBottom: '4px',
  },
  slider: {
    width: 'calc(100% - 40px)',
    marginRight: '8px',
    accentColor: '#1e88e5',
  },
  value: {
    fontSize: '12px',
    color: '#fff',
    width: '32px',
    display: 'inline-block',
    textAlign: 'right',
  },
  chakras: {
    marginTop: '16px',
  },
  chakraGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px',
  },
  chakraBtn: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  hint: {
    fontSize: '11px',
    color: '#666',
    marginTop: '12px',
    textAlign: 'center',
  },
};
