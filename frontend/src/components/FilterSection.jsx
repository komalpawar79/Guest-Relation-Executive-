import { useState, useCallback } from 'react';
import { FiFilter, FiDownload } from 'react-icons/fi';
import { excelAPI } from '../api/apiClient';

export const FilterSection = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    closingManager: '',
    sourcingManager: '',
    gre: '',
    attended: '',
  });
  const [isExporting, setIsExporting] = useState(false);

  // Manager lists
  const closingManagers = ['Pooja Tikude', 'Manasi Mehta', 'Ayush Jain', 'Nitesh Sharma', 'Prashant'];
  const sourcingManagers = ['Akash Chavan', 'Nitesh Thakur'];
  const greStaff = ['Komal Pawar'];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    // Debounce the filter change
    const timeout = setTimeout(() => {
      onFilterChange(newFilters);
    }, 500);

    return () => clearTimeout(timeout);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await excelAPI.exportClients(filters);

      // Create blob and download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `GRE_Report_${new Date().getTime()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      closingManager: '',
      sourcingManager: '',
      gre: '',
      attended: '',
    });
    onFilterChange({
      startDate: '',
      endDate: '',
      closingManager: '',
      sourcingManager: '',
      gre: '',
      attended: '',
    });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <FiFilter />
          Filters
        </h3>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="btn-secondary flex items-center gap-2"
        >
          <FiDownload />
          {isExporting ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label className="label text-sm">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="input text-sm"
          />
        </div>

        <div>
          <label className="label text-sm">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="input text-sm"
          />
        </div>

        <div>
          <label className="label text-sm">Closing Manager</label>
          <select
            name="closingManager"
            value={filters.closingManager}
            onChange={handleFilterChange}
            className="input text-sm"
          >
            <option value="">All</option>
            {closingManagers.map((manager) => (
              <option key={manager} value={manager}>
                {manager}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label text-sm">Sourcing Manager</label>
          <select
            name="sourcingManager"
            value={filters.sourcingManager}
            onChange={handleFilterChange}
            className="input text-sm"
          >
            <option value="">All</option>
            {sourcingManagers.map((manager) => (
              <option key={manager} value={manager}>
                {manager}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label text-sm">GRE Staff</label>
          <select
            name="gre"
            value={filters.gre}
            onChange={handleFilterChange}
            className="input text-sm"
          >
            <option value="">All</option>
            {greStaff.map((staff) => (
              <option key={staff} value={staff}>
                {staff}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label text-sm">Status</label>
          <select
            name="attended"
            value={filters.attended}
            onChange={handleFilterChange}
            className="input text-sm"
          >
            <option value="">All</option>
            <option value="true">Attended</option>
            <option value="false">Pending</option>
          </select>
        </div>
      </div>

      {/* Date Range Info */}
      {(filters.startDate || filters.endDate) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          {filters.startDate && !filters.endDate && (
            <p>📅 Showing data from <strong>{new Date(filters.startDate).toLocaleDateString('en-IN')}</strong> until today</p>
          )}
          {filters.startDate && filters.endDate && (
            <p>📅 Showing data from <strong>{new Date(filters.startDate).toLocaleDateString('en-IN')}</strong> to <strong>{new Date(filters.endDate).toLocaleDateString('en-IN')}</strong></p>
          )}
          {!filters.startDate && filters.endDate && (
            <p>📅 Showing data up to <strong>{new Date(filters.endDate).toLocaleDateString('en-IN')}</strong></p>
          )}
        </div>
      )}

      <button
        onClick={resetFilters}
        className="btn-outline mt-4 text-sm"
      >
        Reset Filters
      </button>
    </div>
  );
};
