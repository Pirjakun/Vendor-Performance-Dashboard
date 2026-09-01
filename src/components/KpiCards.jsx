import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function KpiCards({ filteredData }) {
  const vendorSet = new Set(filteredData.map(d => d.vendor));
  const eventSet = new Set(filteredData.map(d => d.event));
  const totalRecords = filteredData.length;

  let avgScore = 0;
  if (totalRecords > 0) {
    const sum = filteredData.reduce((acc, curr) => acc + (Number(curr.nilai) || 0), 0);
    avgScore = parseFloat((sum / totalRecords).toFixed(1));
  }

  const isUp = avgScore >= 80;

  return (
    <div className="kpi-row">
      <div className="kpi">
        <div className="kpi-label">Total Vendor</div>
        <div className="kpi-value">{vendorSet.size}</div>
        <div className="kpi-sub">Vendor unik pada periode aktif</div>
      </div>

      <div className="kpi">
        <div className="kpi-label">Total Event</div>
        <div className="kpi-value">{eventSet.size}</div>
        <div className="kpi-sub">Event yang menggunakan vendor ({totalRecords} evaluasi)</div>
      </div>

      <div className="kpi">
        <div className="kpi-label">Average Performance</div>
        <div className="kpi-value">{avgScore > 0 ? avgScore : '0.0'}</div>
        <div className={`kpi-delta ${isUp ? 'up' : 'down'}`}>
          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isUp ? '▲ Performa Baik / Target Tercapai' : '▼ Perlu Perhatian & Evaluasi'}
        </div>
      </div>
    </div>
  );
}
