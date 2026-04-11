import { useState } from 'react';
import { reportAPI, excelAPI } from '../api/apiClient';
import { FiDownload, FiCalendar, FiAlertCircle } from 'react-icons/fi';

export const ReportsSection = () => {
  const [reportType, setReportType] = useState('daily');
  const [dailyDate, setDailyDate] = useState('');
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [yearlyYear, setYearlyYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReport = async () => {
    setError('');
    setLoading(true);

    try {
      let response;
      if (reportType === 'daily') {
        if (!dailyDate) {
          setError('Please select a date');
          setLoading(false);
          return;
        }
        response = await reportAPI.getDailyReport(dailyDate);
      } else if (reportType === 'monthly') {
        response = await reportAPI.getMonthlyReport(monthlyMonth, monthlyYear);
      } else if (reportType === 'yearly') {
        response = await reportAPI.getYearlyReport(yearlyYear);
      }

      setReportData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    setLoading(true);
    try {
      let filters = {};
      
      if (reportType === 'daily') {
        filters.startDate = dailyDate;
        filters.endDate = dailyDate;
      } else if (reportType === 'monthly') {
        const monthStart = new Date(monthlyYear, monthlyMonth - 1, 1);
        const monthEnd = new Date(monthlyYear, monthlyMonth, 0);
        filters.startDate = monthStart.toISOString().split('T')[0];
        filters.endDate = monthEnd.toISOString().split('T')[0];
      } else if (reportType === 'yearly') {
        filters.startDate = `${yearlyYear}-01-01`;
        filters.endDate = `${yearlyYear}-12-31`;
      }

      const response = await excelAPI.exportClients({
        ...filters,
        reportType: reportType.charAt(0).toUpperCase() + reportType.slice(1),
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GRE_${reportType}_Report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      setError('Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-2">Reports</h2>
        <p className="text-textSecondary">Generate reports based on date range</p>
      </div>

      {/* Report Type Selection */}
      <div className="card">
        <h3 className="text-lg font-bold text-primary mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setReportType('daily')}
            className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
              reportType === 'daily'
                ? 'border-primary bg-primary bg-opacity-10'
                : 'border-gray-200 hover:border-primary'
            }`}
          >
            <div className="text-3xl mb-2">📅</div>
            <h4 className="font-bold text-primary">Daily Report</h4>
            <p className="text-sm text-textSecondary">Single day statistics</p>
          </button>

          <button
            onClick={() => setReportType('monthly')}
            className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
              reportType === 'monthly'
                ? 'border-primary bg-primary bg-opacity-10'
                : 'border-gray-200 hover:border-primary'
            }`}
          >
            <div className="text-3xl mb-2">📊</div>
            <h4 className="font-bold text-primary">Monthly Report</h4>
            <p className="text-sm text-textSecondary">Month performance</p>
          </button>

          <button
            onClick={() => setReportType('yearly')}
            className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
              reportType === 'yearly'
                ? 'border-primary bg-primary bg-opacity-10'
                : 'border-gray-200 hover:border-primary'
            }`}
          >
            <div className="text-3xl mb-2">📈</div>
            <h4 className="font-bold text-primary">Yearly Report</h4>
            <p className="text-sm text-textSecondary">Year overview</p>
          </button>
        </div>

        {/* Date Selection */}
        <div className="border-t pt-6">
          <h4 className="font-bold text-textPrimary mb-4 flex items-center gap-2">
            <FiCalendar />
            Select Date
          </h4>

          {reportType === 'daily' && (
            <div className="space-y-4">
              <div className="max-w-xs">
                <label className="label">Report Date *</label>
                <input
                  type="date"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                  className="input"
                />
                <p className="text-sm text-textSecondary mt-2">
                  Select the date for which you want to view client statistics
                </p>
              </div>
            </div>
          )}

          {reportType === 'monthly' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <div>
                  <label className="label">Month *</label>
                  <select
                    value={monthlyMonth}
                    onChange={(e) => setMonthlyMonth(parseInt(e.target.value))}
                    className="input"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Year *</label>
                  <select
                    value={monthlyYear}
                    onChange={(e) => setMonthlyYear(parseInt(e.target.value))}
                    className="input"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <p className="text-sm text-textSecondary">
                {new Date(monthlyYear, monthlyMonth - 1).toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          {reportType === 'yearly' && (
            <div className="space-y-4">
              <div className="max-w-xs">
                <label className="label">Year *</label>
                <select
                  value={yearlyYear}
                  onChange={(e) => setYearlyYear(parseInt(e.target.value))}
                  className="input"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <p className="text-sm text-textSecondary">
                Annual report for {yearlyYear}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-danger bg-opacity-10 border border-danger text-danger px-4 py-3 rounded-lg flex items-center">
            <FiAlertCircle className="mr-2" />
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-6 border-t pt-6">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          {reportData && (
            <button
              onClick={handleExportReport}
              disabled={loading}
              className="btn-secondary flex items-center justify-center gap-2 flex-1"
            >
              <FiDownload />
              {loading ? 'Exporting...' : 'Export to Excel'}
            </button>
          )}
        </div>
      </div>

      {/* Report Data Display */}
      {reportData && (
        <div className="card">
          <h3 className="text-lg font-bold text-primary mb-6">Report Summary</h3>

          {reportType === 'daily' && (
            <div>
              <p className="text-textSecondary mb-4">
                Report for: <strong>{new Date(reportData.date).toLocaleDateString('en-IN')}</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatBox
                  label="Total Clients"
                  value={reportData.summary.totalClients}
                  color="bg-blue-50 text-blue-600"
                />
                <StatBox
                  label="Attended"
                  value={reportData.summary.attended}
                  color="bg-green-50 text-green-600"
                />
                <StatBox
                  label="Pending"
                  value={reportData.summary.notAttended}
                  color="bg-yellow-50 text-yellow-600"
                />
                <StatBox
                  label="Attendance Rate"
                  value={`${Math.round(
                    (reportData.summary.attended / (reportData.summary.totalClients || 1)) * 100
                  )}%`}
                  color="bg-purple-50 text-purple-600"
                />
              </div>

              {reportData.details && reportData.details.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-textPrimary mb-4">Client Details</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Phone</th>
                          <th className="px-4 py-2 text-left">Manager</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.details.map((client) => (
                          <tr key={client._id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium">{client.clientName}</td>
                            <td className="px-4 py-2">{client.phoneNumber}</td>
                            <td className="px-4 py-2">{client.closingManager}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  client.attended
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {client.attended ? 'Attended' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {reportType === 'monthly' && (
            <div>
              <p className="text-textSecondary mb-4">
                Report for: <strong>{new Date(monthlyYear, monthlyMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>
              </p>
              {reportData.dailyBreakdown && reportData.dailyBreakdown.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-right">Attended</th>
                        <th className="px-4 py-2 text-right">Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.dailyBreakdown.map((day) => (
                        <tr key={day._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">{day._id}</td>
                          <td className="px-4 py-2 text-right font-bold">{day.totalClients}</td>
                          <td className="px-4 py-2 text-right text-green-600">{day.attended}</td>
                          <td className="px-4 py-2 text-right text-yellow-600">{day.notAttended}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-textSecondary">No data available for this month</p>
              )}
            </div>
          )}

          {reportType === 'yearly' && (
            <div>
              <p className="text-textSecondary mb-4">
                Report for: <strong>{yearlyYear}</strong>
              </p>
              {reportData.monthlyBreakdown && reportData.monthlyBreakdown.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left">Month</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-right">Attended</th>
                        <th className="px-4 py-2 text-right">Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.monthlyBreakdown.map((month) => (
                        <tr key={month._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">{month._id}</td>
                          <td className="px-4 py-2 text-right font-bold">{month.totalClients}</td>
                          <td className="px-4 py-2 text-right text-green-600">{month.attended}</td>
                          <td className="px-4 py-2 text-right text-yellow-600">{month.notAttended}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-textSecondary">No data available for this year</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, color }) => (
  <div className={`card ${color} border-0`}>
    <p className="text-sm font-medium opacity-75">{label}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);
