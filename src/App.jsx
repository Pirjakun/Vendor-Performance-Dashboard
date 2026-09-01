import React, { useState } from 'react';
import { useVendorData } from './hooks/useVendorData';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { ChartsSection } from './components/ChartsSection';
import { RegionMap } from './components/RegionMap';
import { DataTable } from './components/DataTable';
import { EvaluationModal } from './components/EvaluationModal';
import { VendorDetailModal } from './components/VendorDetailModal';

export default function App() {
  const {
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
  } = useVendorData();

  // State for CRUD Add / Edit Modal
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // State for Vendor Inspector Profile Modal
  const [selectedVendorProfile, setSelectedVendorProfile] = useState(null);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsEvaluationModalOpen(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setIsEvaluationModalOpen(true);
  };

  const handleSaveEvaluation = (formData) => {
    if (editingRecord && editingRecord.id) {
      updateEvaluation(editingRecord.id, formData);
    } else {
      addEvaluation(formData);
    }
  };

  const handleVendorClick = (vendorName) => {
    setSelectedVendorProfile(vendorName);
  };

  const handleCityClick = (cityName) => {
    setFilter('location', cityName);
  };

  return (
    <div className="page">
      {/* 1. Header with integrated sleek compact filter bar (Contoh Terbaru style) */}
      <Header
        onOpenAddModal={handleOpenAddModal}
        onResetData={resetToInitialData}
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        uniqueMonths={uniqueMonths}
        uniqueVendors={uniqueVendors}
        uniqueEvents={uniqueEvents}
        uniqueCategories={uniqueCategories}
        uniqueLocations={uniqueLocations}
      />

      {/* 2. KPI Summary Cards */}
      <KpiCards filteredData={filteredGeneral} />

      {/* 3. Interactive Diagrams & Charts */}
      <ChartsSection
        filteredOverview={filteredOverview}
        filteredTrend={filteredTrend}
        filteredGeneral={filteredGeneral}
        filteredRepeat={filteredRepeat}
        filteredCategory={filteredCategory}
        allEvaluations={evaluations}
        selectedVendor={filters.vendor}
        selectedCategory={filters.category}
        overviewMode={overviewMode}
        setOverviewMode={setOverviewMode}
        donutCalcMode={donutCalcMode}
        setDonutCalcMode={setDonutCalcMode}
        onVendorClick={handleVendorClick}
      />

      {/* 4. Region Map (Persebaran & Performa Vendor per Wilayah) */}
      <RegionMap
        filteredData={filteredGeneral}
        onCityClick={handleCityClick}
      />

      {/* 5. CRUD Data Table */}
      <DataTable
        filteredData={filteredGeneral}
        onEdit={handleEditRecord}
        onDelete={deleteEvaluation}
        onVendorClick={handleVendorClick}
        searchQuery={filters.search}
        setSearchQuery={(q) => setFilter('search', q)}
      />

      {/* 6. Form CRUD Modal for Add/Edit */}
      <EvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        onSave={handleSaveEvaluation}
        initialRecord={editingRecord}
      />

      {/* 7. Vendor Profile Inspector Modal */}
      <VendorDetailModal
        vendorName={selectedVendorProfile}
        allEvaluations={evaluations}
        onClose={() => setSelectedVendorProfile(null)}
      />
    </div>
  );
}
