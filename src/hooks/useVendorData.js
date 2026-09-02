import { useState, useEffect, useMemo } from 'react';
import { initialData } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'vendor_evaluations_v31_cat';

export function useVendorData() {
  const [evaluations, setEvaluations] = useState(() => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('vendor_evaluations_') && key !== LOCAL_STORAGE_KEY) {
          localStorage.removeItem(key);
        }
      });
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const catSet = new Set(parsed.map(e => e.category));
          if (catSet.size >= 30) {
            return parsed;
          } else {
            console.log('Stale cache detected (categories count < 30), resetting to initialData...');
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load evaluations from localStorage:', e);
    }
    return initialData;
  });

  const [filters, setFilters] = useState({
    bulan: '',
    vendor: '',
    event: '',
    category: '',
    grade: '',
    location: '',
    rekomendasi: '',
    search: ''
  });

  const [overviewMode, setOverviewMode] = useState('topbottom'); // 'topbottom' | 'all'
  const [donutCalcMode, setDonutCalcMode] = useState('row'); // 'row' | 'vendor'

  // Persist evaluations to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(evaluations));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [evaluations]);

  // CRUD Handlers
  const addEvaluation = (newRecord) => {
    const nextId = evaluations.length > 0 ? Math.max(...evaluations.map(e => Number(e.id || 0))) + 1 : 1;
    const record = {
      ...newRecord,
      id: nextId,
      nilai: Number(newRecord.nilai)
    };
    setEvaluations(prev => [record, ...prev]);
  };

  const updateEvaluation = (id, updatedFields) => {
    setEvaluations(prev => prev.map(e => {
      if (String(e.id) === String(id)) {
        return {
          ...e,
          ...updatedFields,
          id: e.id,
          nilai: Number(updatedFields.nilai ?? e.nilai)
        };
      }
      return e;
    }));
  };

  const deleteEvaluation = (id) => {
    setEvaluations(prev => prev.filter(e => String(e.id) !== String(id)));
  };

  const resetToInitialData = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke data terbaru? Data tersimpan lama di browser akan dihapus dan diganti.')) {
      setEvaluations(initialData);
      try {
        localStorage.removeItem('vendor_evaluations_v1');
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
      } catch (e) {
        console.error('Failed to reset localStorage:', e);
      }
    }
  };

  const setFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      bulan: '',
      vendor: '',
      event: '',
      category: '',
      grade: '',
      location: '',
      rekomendasi: '',
      search: ''
    });
  };

  // Helper arrays for options
  const uniqueMonths = useMemo(() => {
    return [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
  }, []);

  const matchBulan = (dBulan, selectedBulan) => {
    if (!selectedBulan) return true;
    if (!dBulan) return false;
    const b1 = dBulan.toLowerCase();
    const b2 = selectedBulan.toLowerCase();
    return b1.includes(b2) || b2.includes(b1);
  };

  const uniqueVendors = useMemo(() => {
    return Array.from(new Set(evaluations.map(d => d.vendor).filter(Boolean))).sort();
  }, [evaluations]);

  const uniqueEvents = useMemo(() => {
    return Array.from(new Set(evaluations.map(d => d.event).filter(Boolean))).sort();
  }, [evaluations]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(evaluations.map(d => d.category).filter(Boolean))).sort();
  }, [evaluations]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(evaluations.map(d => d.alamat).filter(Boolean))).sort();
  }, [evaluations]);

  // Filtered Datasets according to Brief Rules
  const filteredGeneral = useMemo(() => {
    return evaluations.filter(d => {
      if (filters.bulan && !matchBulan(d.bulan, filters.bulan)) return false;
      if (filters.vendor && d.vendor !== filters.vendor) return false;
      if (filters.event && d.event !== filters.event) return false;
      if (filters.category && d.category !== filters.category) return false;
      if (filters.grade && d.huruf !== filters.grade) return false;
      if (filters.location && d.alamat !== filters.location) return false;
      if (filters.rekomendasi && d.rekomendasi !== filters.rekomendasi) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match = d.vendor?.toLowerCase().includes(q) ||
                      d.event?.toLowerCase().includes(q) ||
                      d.category?.toLowerCase().includes(q) ||
                      d.alamat?.toLowerCase().includes(q) ||
                      d.rekomendasi?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [evaluations, filters]);

  // Overview ignores Vendor filter for filtering out rows
  const filteredOverview = useMemo(() => {
    return evaluations.filter(d => {
      if (filters.bulan && !matchBulan(d.bulan, filters.bulan)) return false;
      if (filters.event && d.event !== filters.event) return false;
      if (filters.category && d.category !== filters.category) return false;
      if (filters.grade && d.huruf !== filters.grade) return false;
      if (filters.location && d.alamat !== filters.location) return false;
      if (filters.rekomendasi && d.rekomendasi !== filters.rekomendasi) return false;
      return true;
    });
  }, [evaluations, filters]);

  // Trend IGNORES Bulan filter (always Jan-Jun)
  const filteredTrend = useMemo(() => {
    return evaluations.filter(d => {
      if (filters.vendor && d.vendor !== filters.vendor) return false;
      if (filters.event && d.event !== filters.event) return false;
      if (filters.category && d.category !== filters.category) return false;
      if (filters.grade && d.huruf !== filters.grade) return false;
      if (filters.location && d.alamat !== filters.location) return false;
      if (filters.rekomendasi && d.rekomendasi !== filters.rekomendasi) return false;
      return true;
    });
  }, [evaluations, filters]);

  // Repeat dataset responding to all active filters
  const filteredRepeat = useMemo(() => {
    return evaluations.filter(d => {
      if (filters.bulan && !matchBulan(d.bulan, filters.bulan)) return false;
      if (filters.vendor && d.vendor !== filters.vendor) return false;
      if (filters.event && d.event !== filters.event) return false;
      if (filters.category && d.category !== filters.category) return false;
      if (filters.grade && d.huruf !== filters.grade) return false;
      if (filters.location && d.alamat !== filters.location) return false;
      if (filters.rekomendasi && d.rekomendasi !== filters.rekomendasi) return false;
      return true;
    });
  }, [evaluations, filters]);

  // Category IGNORES Category filter for filtering out rows
  const filteredCategory = useMemo(() => {
    return evaluations.filter(d => {
      if (filters.bulan && !matchBulan(d.bulan, filters.bulan)) return false;
      if (filters.vendor && d.vendor !== filters.vendor) return false;
      if (filters.event && d.event !== filters.event) return false;
      if (filters.grade && d.huruf !== filters.grade) return false;
      if (filters.location && d.alamat !== filters.location) return false;
      if (filters.rekomendasi && d.rekomendasi !== filters.rekomendasi) return false;
      return true;
    });
  }, [evaluations, filters]);

  return {
    evaluations,
    filters,
    setFilter,
    resetFilters,
    overviewMode,
    setOverviewMode,
    donutCalcMode,
    setDonutCalcMode,
    addEvaluation,
    updateEvaluation,
    deleteEvaluation,
    resetToInitialData,
    uniqueMonths,
    uniqueVendors,
    uniqueEvents,
    uniqueCategories,
    uniqueLocations,
    filteredGeneral,
    filteredOverview,
    filteredTrend,
    filteredRepeat,
    filteredCategory
  };
}
