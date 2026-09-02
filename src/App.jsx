import React, { useState, useEffect } from 'react';
import { useVendorData } from './hooks/useVendorData';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { ChartsSection } from './components/ChartsSection';
import { RegionMap } from './components/RegionMap';
import { DataTable } from './components/DataTable';
import { EvaluationModal } from './components/EvaluationModal';
import { VendorDetailModal } from './components/VendorDetailModal';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { LoginScreen } from './components/LoginScreen';
import { generatePdfReport, generateFullReport } from './utils/exportPdf';

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
    bulkUploadEvaluations,
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

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const isLocalAuth = localStorage.getItem('werkudara_auth') === 'true';
    const isSessionAuth = sessionStorage.getItem('werkudara_auth') === 'true';
    
    if (isLocalAuth || isSessionAuth) {
      const userStr = localStorage.getItem('werkudara_user') || sessionStorage.getItem('werkudara_user');
      setIsAuthenticated(true);
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {
          setCurrentUser({ email: 'ss@werkudara.com', name: 'Eksekutif Werkudara' });
        }
      } else {
        setCurrentUser({ email: 'ss@werkudara.com', name: 'Eksekutif Werkudara' });
      }
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('werkudara_auth');
    localStorage.removeItem('werkudara_user');
    sessionStorage.removeItem('werkudara_auth');
    sessionStorage.removeItem('werkudara_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // State for CRUD Add / Edit Modal
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // State for Excel Bulk Upload Modal
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // State for Vendor Inspector Profile Modal
  const [selectedVendorProfile, setSelectedVendorProfile] = useState(null);

  // State for Interactive Donut Slice Grade Modal
  const [selectedGradeModal, setSelectedGradeModal] = useState(null);

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

  // Render Login Gate if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="page">
      {/* 1. Header with integrated sleek compact filter bar */}
      <Header
        onOpenAddModal={handleOpenAddModal}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        onExportPdf={() => generatePdfReport(filteredGeneral, filters)}
        onFullReport={() => generateFullReport(filteredGeneral, filters)}
        onResetData={resetToInitialData}
        currentUser={currentUser}
        onLogout={handleLogout}
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
        selectedGradeModal={selectedGradeModal}
        onGradeClick={(grade) => setSelectedGradeModal(grade)}
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
        onExportPdf={() => generatePdfReport(filteredGeneral, filters)}
        onFullReport={() => generateFullReport(filteredGeneral, filters)}
      />

      {/* 6. Form CRUD Modal for Add/Edit */}
      <EvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        onSave={handleSaveEvaluation}
        initialRecord={editingRecord}
      />

      {/* 7. Excel Upload Modal */}
      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onUploadSuccess={(records, mode) => bulkUploadEvaluations(records, mode)}
      />

      {/* 8. Vendor Profile Inspector Modal */}
      <VendorDetailModal
        vendorName={selectedVendorProfile}
        allEvaluations={evaluations}
        onClose={() => setSelectedVendorProfile(null)}
      />
    </div>
  );
}
