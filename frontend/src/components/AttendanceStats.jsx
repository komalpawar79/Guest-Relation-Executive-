import { useState, useEffect } from 'react';
import { attendanceAPI } from '../api/apiClient';
import { getSocket } from '../socket/socket';

const AttendanceStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    managerType: '',
    managerName: '',
    date: '',
  });

  const closingManagers = ['Pooja Tikude', 'Manasi Mehta', 'Ayush Jain', 'Nitesh Sharma', 'Prashant'];
  const sourcingManagers = ['Akash Chavan', 'Nitesh Thakur'];
  const greManagers = ['Komal Pawar'];
  const crmManagers = ['Raj Patil'];

  // Fetch manager statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getManagerStats(filters);

      if (response.data.success) {
        // Ensure stats is always an array
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setStats(data);
        setError('');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch statistics';
      setError(errorMsg);
      setStats([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats on filter change
  useEffect(() => {
    fetchStats();
  }, [filters]);

  // Real-time updates with Socket.IO
  useEffect(() => {
    const socket = getSocket();

    const handleAttendanceAdded = () => {
      fetchStats();
    };

    const handleAttendanceUpdated = () => {
      fetchStats();
    };

    const handleAttendanceDeleted = () => {
      fetchStats();
    };

    socket.on('attendanceAdded', handleAttendanceAdded);
    socket.on('attendanceUpdated', handleAttendanceUpdated);
    socket.on('attendanceDeleted', handleAttendanceDeleted);

    return () => {
      socket.off('attendanceAdded', handleAttendanceAdded);
      socket.off('attendanceUpdated', handleAttendanceUpdated);
      socket.off('attendanceDeleted', handleAttendanceDeleted);
    };
  }, []);

  const getManagerList = (type) => {
    if (type === 'Closing Manager') return closingManagers;
    if (type === 'Sourcing Manager') return sourcingManagers;
    if (type === 'GRE') return greManagers;
    if (type === 'CRM') return crmManagers;
    return [];
  };

  // Calculate overall statistics
  const overallStats = stats.reduce(
    (acc, stat) => ({
      totalDays: acc.totalDays + (stat.totalDays || 0),
      presentDays: acc.presentDays + (stat.presentDays || 0),
      absentDays: acc.absentDays + (stat.absentDays || 0),
      lateDays: acc.lateDays + (stat.lateDays || 0),
      leftEarlyDays: acc.leftEarlyDays + (stat.leftEarlyDays || 0),
    }),
    {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      leftEarlyDays: 0,
    }
  );

  const calculatePercentage = (count, total) => {
    if (total === 0) return '0%';
    return `${((count / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Attendance Statistics</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manager Type</label>
          <select
            value={filters.managerType}
            onChange={(e) => setFilters((prev) => ({ ...prev, managerType: e.target.value, managerName: '' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Manager Types</option>
            <option value="Closing Manager">Closing Manager</option>
            <option value="Sourcing Manager">Sourcing Manager</option>
            <option value="GRE">GRE</option>
            <option value="CRM">CRM</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
          <select
            value={filters.managerName}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, managerName: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Managers</option>
            {filters.managerType 
              ? getManagerList(filters.managerType).map((manager) => (
                  <option key={manager} value={manager}>
                    {manager}
                  </option>
                ))
              : [...closingManagers, ...sourcingManagers].map((manager) => (
                  <option key={manager} value={manager}>
                    {manager}
                  </option>
                ))
            }
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, date: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading statistics...</div>
      ) : stats.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No attendance records found</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600">Total Days</div>
              <div className="text-2xl font-bold text-blue-600">{overallStats.totalDays}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-gray-600">Present</div>
              <div className="text-2xl font-bold text-green-600">{overallStats.presentDays}</div>
              <div className="text-xs text-gray-500 mt-1">
                {calculatePercentage(overallStats.presentDays, overallStats.totalDays)}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-gray-600">Absent</div>
              <div className="text-2xl font-bold text-red-600">{overallStats.absentDays}</div>
              <div className="text-xs text-gray-500 mt-1">
                {calculatePercentage(overallStats.absentDays, overallStats.totalDays)}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-sm text-gray-600">Late</div>
              <div className="text-2xl font-bold text-yellow-600">{overallStats.lateDays}</div>
              <div className="text-xs text-gray-500 mt-1">
                {calculatePercentage(overallStats.lateDays, overallStats.totalDays)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-gray-600">Left Early</div>
              <div className="text-2xl font-bold text-purple-600">{overallStats.leftEarlyDays}</div>
              <div className="text-xs text-gray-500 mt-1">
                {calculatePercentage(overallStats.leftEarlyDays, overallStats.totalDays)}
              </div>
            </div>
          </div>

          {/* Manager-wise Statistics Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-800 font-semibold">
                <tr>
                  <th className="px-4 py-3">Manager Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Total Days</th>
                  <th className="px-4 py-3">Present</th>
                  <th className="px-4 py-3">Absent</th>
                  <th className="px-4 py-3">Late</th>
                  <th className="px-4 py-3">Left Early</th>
                  <th className="px-4 py-3">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, index) => {
                  const attendancePercentage =
                    stat.totalDays === 0
                      ? 0
                      : ((stat.presentDays / stat.totalDays) * 100).toFixed(1);

                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {stat.managerName}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">{stat.managerType}</td>
                      <td className="px-4 py-3 font-medium">{stat.totalDays}</td>
                      <td className="px-4 py-3">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {stat.presentDays}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          {stat.absentDays}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          {stat.lateDays}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {stat.leftEarlyDays}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                            <div
                              className={`h-full ${
                                attendancePercentage >= 80
                                  ? 'bg-green-500'
                                  : attendancePercentage >= 70
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${attendancePercentage}%` }}
                            />
                          </div>
                          <span className="font-semibold text-gray-800 min-w-fit">
                            {attendancePercentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceStats;
