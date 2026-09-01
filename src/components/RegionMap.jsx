import React from 'react';
import mapImg from '../assets/indonesia-map-reference.png';

export function RegionMap({ filteredData, onCityClick }) {
  // Aggregate city stats from filteredData
  const cityStats = {};
  filteredData.forEach(d => {
    const loc = d.alamat || 'Lainnya';
    if (!cityStats[loc]) cityStats[loc] = { sum: 0, count: 0 };
    cityStats[loc].sum += Number(d.nilai);
    cityStats[loc].count += 1;
  });

  const getCityData = (name) => {
    const key = Object.keys(cityStats).find(k => k.toLowerCase().includes(name.toLowerCase()));
    if (!key || cityStats[key].count === 0) return { count: 0, avg: 0, gradeClass: 'dot-empty', radius: 5 };
    const stat = cityStats[key];
    const avg = parseFloat((stat.sum / stat.count).toFixed(1));
    let gradeClass = 'dot-poor';
    if (avg >= 85) gradeClass = 'dot-excellent';
    else if (avg >= 75) gradeClass = 'dot-good';
    else if (avg >= 65) gradeClass = 'dot-fair';

    const radius = Math.min(15, Math.max(7, 5 + Math.sqrt(stat.count) * 1.8));
    return { count: stat.count, avg, gradeClass, radius };
  };

  // Exact geographic coordinates strictly aligned with the Indonesia Province Map reference:
  // Medan -> North Sumatra (purple area)
  // Jakarta -> West Java / Banten border coastal tip
  // Bandung -> West Java interior
  // Magelang -> Central Java interior (north of Yogyakarta)
  // Yogyakarta -> DI Yogyakarta south coast
  // Salatiga -> Central Java interior (north-east of Magelang)
  // Surabaya -> East Java north-east coast (facing Madura)
  // Jawa Timur -> East Java interior
  // Bali -> Bali island (east of East Java)
  const cities = [
    { name: 'Medan', cx: 98, cy: 163, labelPos: 'top', textAnchor: 'middle' },
    { name: 'Jakarta', cx: 265, cy: 326, labelPos: 'top', textAnchor: 'middle' },
    { name: 'Bandung', cx: 285, cy: 353, labelPos: 'bottom', textAnchor: 'middle' },
    { name: 'Magelang', cx: 355, cy: 338, labelPos: 'left', textAnchor: 'end' },
    { name: 'Yogyakarta', cx: 362, cy: 367, labelPos: 'bottom', textAnchor: 'middle' },
    { name: 'Salatiga', cx: 375, cy: 322, labelPos: 'top-right', textAnchor: 'start' },
    { name: 'Surabaya', cx: 435, cy: 329, labelPos: 'top', textAnchor: 'middle' },
    { name: 'Jawa Timur', cx: 452, cy: 358, labelPos: 'bottom-right', textAnchor: 'start' },
    { name: 'Bali', cx: 528, cy: 365, labelPos: 'right', textAnchor: 'start' }
  ];

  const getLabelY = (c, data) => {
    if (c.labelPos === 'top') return c.cy - data.radius - 6;
    if (c.labelPos === 'bottom') return c.cy + data.radius + 13;
    if (c.labelPos === 'left' || c.labelPos === 'top-right') return c.cy - 4;
    if (c.labelPos === 'bottom-right') return c.cy + 12;
    if (c.labelPos === 'right') return c.cy + 4;
    return c.cy - data.radius - 6;
  };

  const getLabelX = (c, data) => {
    if (c.labelPos === 'left') return c.cx - data.radius - 6;
    if (c.labelPos === 'right') return c.cx + data.radius + 6;
    if (c.labelPos === 'top-right' || c.labelPos === 'bottom-right') return c.cx + data.radius + 4;
    return c.cx;
  };

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>Persebaran &amp; Performa Vendor per Wilayah (Peta Indonesia)</h2>
          <p>
            Ukuran titik = jumlah evaluasi vendor di wilayah tersebut. Warna titik = rata-rata skor performa (Grade A ≥85, Grade B 75–84, Grade C 65–74, Grade D &lt;65).
          </p>
        </div>
        <span className="tag">Peta Provinsi Negara Kesatuan Republik Indonesia</span>
      </div>

      <div className="map-wrap">
        <div style={{ position: 'relative', flex: 1, minWidth: 0, background: '#FFFFFF', borderRadius: '12px', padding: '12px', border: '1px solid var(--line)' }}>
          <svg viewBox="0 0 1000 480" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <filter id="glowShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" floodColor="#0F2A57" />
              </filter>
            </defs>

            {/* BACKGROUND MAP IMAGE EXACTLY MATCHING USER OUTLINE REFERENCE */}
            <image href={mapImg} x="0" y="0" width="1000" height="480" preserveAspectRatio="none" />

            {/* CITY DOT MARKERS */}
            {cities.map(c => {
              const data = getCityData(c.name);
              const lx = getLabelX(c, data);
              const ly = getLabelY(c, data);

              return (
                <g
                  key={c.name}
                  className="city"
                  onClick={() => onCityClick && onCityClick(c.name)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Pulse ring for active data cities */}
                  {data.count > 0 && (
                    <circle
                      cx={c.cx}
                      cy={c.cy}
                      r={data.radius + 4}
                      fill="none"
                      stroke={data.gradeClass === 'dot-excellent' ? '#0F2A57' : data.gradeClass === 'dot-good' ? '#2563C9' : '#D69A25'}
                      strokeWidth="2"
                      opacity="0.35"
                    />
                  )}

                  {/* Main Marker Circle */}
                  <circle
                    cx={c.cx}
                    cy={c.cy}
                    r={data.radius}
                    className={`dot ${data.gradeClass}`}
                    filter="url(#glowShadow)"
                  >
                    <title>{`${c.name}: ${data.count} evaluasi, Rata-rata Skor: ${data.avg}`}</title>
                  </circle>

                  {/* City Text Label with Outline Stroke */}
                  <text
                    x={lx}
                    y={ly}
                    className="axis-label"
                    textAnchor={c.textAnchor}
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      fill: 'var(--navy-950)',
                      paintOrder: 'stroke',
                      stroke: '#ffffff',
                      strokeWidth: '4px',
                      strokeLinejoin: 'round'
                    }}
                  >
                    {c.name} {data.count > 0 ? `(${data.count})` : ''}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="map-legend">
          <div className="map-legend-title">Rata-rata Skor</div>
          <span><i className="dot dot-excellent"></i> Grade A / Excellent (&ge;85)</span>
          <span><i className="dot dot-good"></i> Grade B / Good (75–84)</span>
          <span><i className="dot dot-fair"></i> Grade C / Fair (65–74)</span>
          <span><i className="dot dot-poor"></i> Grade D / Poor (&lt;65)</span>

          <div className="map-legend-title" style={{ marginTop: '12px' }}>Ukuran Titik</div>
          <span className="size-hint">
            <i className="size-dot s1"></i> Sedikit
            <i className="size-dot s3"></i> Banyak
          </span>

          <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--ink-600)', background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}>
            💡 <strong>Tips:</strong> Klik nama kota pada peta untuk memfilter data dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}
