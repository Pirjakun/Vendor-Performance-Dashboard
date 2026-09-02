import React, { useMemo, useRef, useState, useCallback } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import indonesiaTopoJson from '../assets/indonesia-provinces.json';

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

export function RegionMap({ filteredData, onCityClick }) {
  const svgRef = useRef(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

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
    else if (avg >= 70) gradeClass = 'dot-good';
    else if (avg >= 55) gradeClass = 'dot-fair';

    const radius = Math.min(15, Math.max(7, 5 + Math.sqrt(stat.count) * 1.8));
    return { count: stat.count, avg, gradeClass, radius };
  };

  // Convert TopoJSON to GeoJSON features & project to SVG viewBox 778 x 394
  const { provinceFeatures, pathGenerator, cities } = useMemo(() => {
    const geoData = topojson.feature(indonesiaTopoJson, indonesiaTopoJson.objects.gadm36_IDN_1);
    const projection = geoMercator().fitSize([778, 394], geoData);
    const pathGen = geoPath().projection(projection);

    const cityCoords = [
      { name: 'Medan', lon: 98.6722, lat: 3.5952, labelPos: 'top', textAnchor: 'middle' },
      { name: 'Jakarta', lon: 106.8456, lat: -6.2088, labelPos: 'top', textAnchor: 'middle' },
      { name: 'Bandung', lon: 107.6191, lat: -6.9175, labelPos: 'bottom', textAnchor: 'middle' },
      { name: 'Magelang', lon: 110.2177, lat: -7.4706, labelPos: 'left', textAnchor: 'end' },
      { name: 'Yogyakarta', lon: 110.3695, lat: -7.7956, labelPos: 'bottom', textAnchor: 'middle' },
      { name: 'Salatiga', lon: 110.5084, lat: -7.3305, labelPos: 'top-right', textAnchor: 'start' },
      { name: 'Surabaya', lon: 112.7521, lat: -7.2575, labelPos: 'top', textAnchor: 'middle' },
      { name: 'Jawa Timur', lon: 112.3, lat: -7.6, labelPos: 'bottom-right', textAnchor: 'start' },
      { name: 'Bali', lon: 115.2167, lat: -8.6500, labelPos: 'right', textAnchor: 'start' }
    ];

    const projectedCities = cityCoords.map(c => {
      const [cx, cy] = projection([c.lon, c.lat]);
      return { ...c, cx, cy };
    });

    return {
      provinceFeatures: geoData.features,
      pathGenerator: pathGen,
      cities: projectedCities
    };
  }, []);

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

  // ── Zoom helpers ────────────────────────────────────────────────────────────
  const clampScale = (s) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s));

  const applyZoom = useCallback((delta, originX = 389, originY = 197) => {
    setTransform(prev => {
      const newScale = clampScale(prev.scale * (delta > 0 ? 1.25 : 0.8));
      const ratio = newScale / prev.scale;
      const newX = originX - ratio * (originX - prev.x);
      const newY = originY - ratio * (originY - prev.y);
      return { scale: newScale, x: newX, y: newY };
    });
  }, []);

  // Wheel zoom — zoom towards cursor position in SVG coordinates
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // Map mouse position to SVG viewBox coordinates
    const svgX = ((e.clientX - rect.left) / rect.width) * 778;
    const svgY = ((e.clientY - rect.top) / rect.height) * 394;
    applyZoom(e.deltaY < 0 ? 1 : -1, svgX, svgY);
  }, [applyZoom]);

  // Drag pan
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    e.currentTarget.style.cursor = 'grabbing';
  }, [transform]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = 778 / rect.width;
    const scaleY = 394 / rect.height;
    const dx = (e.clientX - dragStart.current.x) * scaleX;
    const dy = (e.clientY - dragStart.current.y) * scaleY;
    setTransform(prev => ({ ...prev, x: dragStart.current.tx + dx, y: dragStart.current.ty + dy }));
  }, []);

  const handleMouseUp = useCallback((e) => {
    isDragging.current = false;
    if (e.currentTarget) e.currentTarget.style.cursor = 'grab';
  }, []);

  // Touch support
  const lastTouchDist = useRef(null);
  const lastTouchMid = useRef(null);

  const getTouchDist = (t) => {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      lastTouchDist.current = getTouchDist(e.touches);
      lastTouchMid.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
    } else if (e.touches.length === 1) {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, tx: transform.x, ty: transform.y };
    }
  }, [transform]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();

    if (e.touches.length === 2) {
      const dist = getTouchDist(e.touches);
      const mid = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      if (lastTouchDist.current) {
        const ratio = dist / lastTouchDist.current;
        const svgX = ((mid.x - rect.left) / rect.width) * 778;
        const svgY = ((mid.y - rect.top) / rect.height) * 394;
        setTransform(prev => {
          const newScale = clampScale(prev.scale * ratio);
          const r = newScale / prev.scale;
          return { scale: newScale, x: svgX - r * (svgX - prev.x), y: svgY - r * (svgY - prev.y) };
        });
      }
      lastTouchDist.current = dist;
      lastTouchMid.current = mid;
    } else if (e.touches.length === 1 && isDragging.current) {
      const scaleX = 778 / rect.width;
      const scaleY = 394 / rect.height;
      const dx = (e.touches[0].clientX - dragStart.current.x) * scaleX;
      const dy = (e.touches[0].clientY - dragStart.current.y) * scaleY;
      setTransform(prev => ({ ...prev, x: dragStart.current.tx + dx, y: dragStart.current.ty + dy }));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    lastTouchDist.current = null;
  }, []);

  const handleReset = () => setTransform({ scale: 1, x: 0, y: 0 });
  const handleZoomIn = () => applyZoom(1);
  const handleZoomOut = () => applyZoom(-1);

  const transformStr = `translate(${transform.x}, ${transform.y}) scale(${transform.scale})`;

  return (
    <div className="card" id="region-map-card">
      <div className="card-head">
        <div>
          <h2>Persebaran &amp; Performa Vendor per Wilayah</h2>
          <p>
            Ukuran titik = jumlah evaluasi vendor di wilayah tersebut. Warna titik = rata-rata skor performa (Grade A ≥85, Grade B 70–84.99, Grade C 55–69.99, Grade D &lt;55).
          </p>
        </div>
        <span className="tag">Peta Wilayah Indonesia</span>
      </div>

      <div className="map-wrap">
        <div style={{ position: 'relative', flex: 1, minWidth: 0, background: '#F4F8FD', borderRadius: '12px', padding: '12px', border: '1px solid var(--line)', boxShadow: 'inset 0 1px 4px rgba(15,42,87,0.05)' }}>

          {/* ── Zoom Controls ── */}
          <div style={{
            position: 'absolute', top: '18px', right: '18px', zIndex: 10,
            display: 'flex', flexDirection: 'column', gap: '4px'
          }}>
            {[
              { label: '+', title: 'Zoom In', action: handleZoomIn },
              { label: '−', title: 'Zoom Out', action: handleZoomOut },
              { label: '↺', title: 'Reset Zoom', action: handleReset }
            ].map(btn => (
              <button
                key={btn.label}
                title={btn.title}
                onClick={btn.action}
                style={{
                  width: '30px', height: '30px',
                  borderRadius: '7px',
                  border: '1px solid var(--line)',
                  background: '#fff',
                  color: 'var(--navy-900)',
                  fontSize: btn.label === '↺' ? '15px' : '18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(15,42,87,0.10)',
                  lineHeight: 1,
                  transition: 'background 0.15s, transform 0.1s',
                  userSelect: 'none'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#EEF4FF'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* ── Zoom Level Badge ── */}
          {transform.scale > 1.05 && (
            <div style={{
              position: 'absolute', bottom: '18px', right: '18px', zIndex: 10,
              background: 'rgba(15,42,87,0.75)', color: '#fff',
              fontSize: '11px', fontWeight: 700,
              padding: '3px 8px', borderRadius: '6px',
              pointerEvents: 'none'
            }}>
              {Math.round(transform.scale * 100)}%
            </div>
          )}

          {/* ── Hint drag ── */}
          <div style={{
            position: 'absolute', bottom: '18px', left: '18px', zIndex: 10,
            fontSize: '10.5px', color: 'var(--ink-500)',
            background: 'rgba(255,255,255,0.85)',
            padding: '3px 8px', borderRadius: '6px',
            border: '1px solid var(--line)',
            pointerEvents: 'none'
          }}>
            🖱 Scroll untuk zoom · Drag untuk geser
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 778 394"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: 'auto', display: 'block', cursor: transform.scale > 1 ? 'grab' : 'default', userSelect: 'none' }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <defs>
              <filter id="glowShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" floodColor="#0F2A57" />
              </filter>
              <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(15,42,87,0.03)" strokeWidth="1" />
              </pattern>
              <clipPath id="mapClip">
                <rect width="778" height="394" />
              </clipPath>
            </defs>

            {/* Ocean Background */}
            <rect width="778" height="394" fill="url(#gridPattern)" rx="8" />

            {/* Zoomable/Pannable group */}
            <g clipPath="url(#mapClip)" transform={transformStr} style={{ transition: isDragging.current ? 'none' : 'transform 0.12s ease-out' }}>
              {/* PROVINCE PATHS */}
              <g className="indonesia-provinces-map" fill="#D6E5F7" stroke="#7BA4D5" strokeWidth="0.8" strokeLinejoin="round" strokeLinecap="round">
                {provinceFeatures.map((feat, idx) => (
                  <path
                    key={feat.properties.GID_1 || idx}
                    d={pathGenerator(feat)}
                    className="province-path"
                    style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                  >
                    <title>{feat.properties.NAME_1}</title>
                  </path>
                ))}
              </g>

              {/* CITY DOT MARKERS */}
              {cities.map(c => {
                const data = getCityData(c.name);
                const lx = getLabelX(c, data);
                const ly = getLabelY(c, data);
                // Scale down text and rings as zoom increases so they don't get huge
                const invScale = 1 / transform.scale;

                return (
                  <g
                    key={c.name}
                    className="city"
                    onClick={() => onCityClick && onCityClick(c.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Pulse ring */}
                    {data.count > 0 && (
                      <circle
                        cx={c.cx}
                        cy={c.cy}
                        r={(data.radius + 4) * invScale}
                        fill="none"
                        stroke={data.gradeClass === 'dot-excellent' ? '#0F2A57' : data.gradeClass === 'dot-good' ? '#2563C9' : '#D69A25'}
                        strokeWidth={2 * invScale}
                        opacity="0.35"
                        style={{ pointerEvents: 'none' }}
                      />
                    )}

                    {/* Main Marker */}
                    <circle
                      cx={c.cx}
                      cy={c.cy}
                      r={data.radius * invScale}
                      className={`dot ${data.gradeClass}`}
                      filter="url(#glowShadow)"
                    >
                      <title>{`${c.name}: ${data.count} evaluasi, Rata-rata Skor: ${data.avg}`}</title>
                    </circle>

                    {/* Label */}
                    <text
                      x={lx}
                      y={ly}
                      className="axis-label"
                      textAnchor={c.textAnchor}
                      style={{
                        fontSize: `${11 * invScale}px`,
                        fontWeight: 800,
                        fill: 'var(--navy-950)',
                        paintOrder: 'stroke',
                        stroke: '#ffffff',
                        strokeWidth: `${4 * invScale}px`,
                        strokeLinejoin: 'round',
                        pointerEvents: 'none'
                      }}
                    >
                      {c.name} {data.count > 0 ? `(${data.count})` : ''}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="map-legend">
          <div className="map-legend-title">Rata-rata Skor</div>
          <span><i className="dot dot-excellent"></i> Grade A (&ge;85)</span>
          <span><i className="dot dot-good"></i> Grade B (70–84.99)</span>
          <span><i className="dot dot-fair"></i> Grade C (55–69.99)</span>
          <span><i className="dot dot-poor"></i> Grade D (&lt;55)</span>

          <div className="map-legend-title" style={{ marginTop: '12px' }}>Ukuran Titik</div>
          <span className="size-hint">
            <i className="size-dot s1"></i> Sedikit
            <i className="size-dot s3"></i> Banyak
          </span>

          <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--ink-600)', background: '#fff', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}>
            💡 <strong>Tips:</strong> Klik nama kota untuk filter. Scroll/pinch untuk zoom. Drag untuk geser.
          </div>
        </div>
      </div>
    </div>
  );
}
