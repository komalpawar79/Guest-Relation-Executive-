import { useState, useEffect } from 'react';
import { attendanceAPI } from '../api/apiClient';

const StaffAttendanceTable = ({ refreshTrigger, socket }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [filters, setFilters] = useState({
    managerName: '',
    managerType: '',
    status: '',
    date: '',
  });

  const closingManagers = ['Pooja Tikude', 'Manasi Mehta', 'Ayush Jain', 'Nitesh Sharma', 'Prashant'];
  const sourcingManagers = ['Akash Chavan', 'Nitesh Thakur'];
  const greManagers = ['Komal Pawar'];
  const crmManagers = ['Raj Patil'];

  // Fetch attendance records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
      };
      
      // Add filters to params, converting date to startDate/endDate
      if (filters.date) {
        params.startDate = filters.date;
        params.endDate = filters.date;
      }
      if (filters.managerType) params.managerType = filters.managerType;
      if (filters.managerName) params.managerName = filters.managerName;
      if (filters.status) params.status = filters.status;
      
      const response = await attendanceAPI.getAttendance(params);

      if (response.data.success) {
        // Ensure records is always an array
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setRecords(data);
        setError('');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch records';
      setError(errorMsg);
      setRecords([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and on refreshTrigger
  useEffect(() => {
    fetchRecords();
  }, [page, filters, refreshTrigger]);

  // Helper function to check if record matches current filters
  const matchesFilters = (record) => {
    if (filters.date) {
      const recordDate = record.date.split('T')[0];
      if (recordDate !== filters.date) return false;
    }
    if (filters.managerType && record.managerType !== filters.managerType) return false;
    if (filters.managerName && record.managerName !== filters.managerName) return false;
    if (filters.status && record.status !== filters.status) return false;
    return true;
  };

  // Socket.IO listeners
  useEffect(() => {
    if (!socket) return;

    const handleAttendanceAdded = (data) => {
      // Only add if it matches current filters
      if (matchesFilters(data)) {
        setRecords((prev) => [data, ...prev]);
      }
    };

    const handleAttendanceUpdated = (data) => {
      setRecords((prev) => {
        // If updated record matches filters, update or add it
        if (matchesFilters(data)) {
          const exists = prev.some((r) => r._id === data._id);
          if (exists) {
            return prev.map((record) => (record._id === data._id ? data : record));
          } else {
            return [data, ...prev];
          }
        } else {
          // If it doesn't match filters, remove it from view
          return prev.filter((record) => record._id !== data._id);
        }
      });
      setEditingId(null);
      setEditData(null);
    };

    const handleAttendanceDeleted = (id) => {
      setRecords((prev) => prev.filter((record) => record._id !== id));
    };

    socket.on('attendanceAdded', handleAttendanceAdded);
    socket.on('attendanceUpdated', handleAttendanceUpdated);
    socket.on('attendanceDeleted', handleAttendanceDeleted);

    return () => {
      socket.off('attendanceAdded', handleAttendanceAdded);
      socket.off('attendanceUpdated', handleAttendanceUpdated);
      socket.off('attendanceDeleted', handleAttendanceDeleted);
    };
  }, [socket, filters]);

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await attendanceAPI.deleteAttendance(id);
      if (response.data.success) {
        setRecords((prev) => prev.filter((record) => record._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  // Handle edit start
  const handleEditStart = (record) => {
    setEditingId(record._id);
    setEditData({ ...record });
  };

  // Handle edit save
  const handleEditSave = async (id) => {
    try {
      // If status is Absent or Week Off, set checkInTime to status
      const updateData = {
        ...editData,
        checkInTime: (editData.status === 'Absent' || editData.status === 'Week Off') ? editData.status : editData.checkInTime,
      };
      
      const response = await attendanceAPI.updateAttendance(id, updateData);
      if (response.data.success) {
        setRecords((prev) =>
          prev.map((record) => (record._id === id ? response.data.data : record))
        );
        setEditingId(null);
        setEditData(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update record');
    }
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  const getManagerList = (type) => {
    if (type === 'Closing Manager') return closingManagers;
    if (type === 'Sourcing Manager') return sourcingManagers;
    if (type === 'GRE') return greManagers;
    if (type === 'CRM') return crmManagers;
    return [];
  };

  // Helper function to compare times correctly (HH:MM format)
  const isLateTime = (timeStr) => {
    if (!timeStr) return false;
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const checkInMinutes = hours * 60 + minutes;
      const cutoffMinutes = 10 * 60 + 30; // 10:30
      return checkInMinutes > cutoffMinutes;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Attendance Records</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={filters.managerType}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, managerType: e.target.value }));
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Manager Types</option>
          <option value="Closing Manager">Closing Manager</option>
          <option value="Sourcing Manager">Sourcing Manager</option>
          <option value="GRE">GRE</option>
          <option value="CRM">CRM</option>
        </select>

        <select
          value={filters.managerName}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, managerName: e.target.value }));
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Managers</option>
          {[...closingManagers, ...sourcingManagers, ...greManagers, ...crmManagers].map((manager) => (
            <option key={manager} value={manager}>
              {manager}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, status: e.target.value }));
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
          <option value="Left Early">Left Early</option>
          <option value="Week Off">Week Off</option>
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, date: e.target.value }));
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-100 text-gray-800 font-semibold">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Check-in</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-3 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-3 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              records.map((record) =>
                editingId === record._id ? (
                  <tr key={record._id} className="bg-yellow-50 border-b">
                    <td className="px-4 py-3">
                      <select
                        value={editData.managerName}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            managerName: e.target.value,
                          }))
                        }
                        className="px-2 py-1 border border-gray-300 rounded"
                      >
                        {getManagerList(editData.managerType).map((manager) => (
                          <option key={manager} value={manager}>
                            {manager}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={editData.date.split('T')[0]}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editData.checkInTime}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            checkInTime: e.target.value,
                          }))
                        }
                        disabled={editData.status === 'Absent' || editData.status === 'Week Off'}
                        placeholder={editData.status === 'Absent' || editData.status === 'Week Off' ? editData.status : ''}
                        className="px-2 py-1 border border-gray-300 rounded text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={editData.status}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Left Early">Left Early</option>
                        <option value="Week Off">Week Off</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleEditSave(record._id)}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={record._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {record.managerName}
                    </td>
                    <td className="px-4 py-3">{record.date.split('T')[0]}</td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        record.status === 'Absent' 
                          ? 'text-gray-600' 
                          : isLateTime(record.checkInTime) ? 'text-red-600' : 'text-gray-800'
                      }`}
                    >
                      {record.status === 'Absent' && !record.checkInTime ? 'Absent' : record.checkInTime}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'Absent'
                            ? 'bg-red-100 text-red-800'
                            : record.status === 'Late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleEditStart(record)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded disabled:bg-gray-200 hover:bg-gray-400"
        >
          Previous
        </button>
        <span className="text-gray-600">Page {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={records.length < 10}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded disabled:bg-gray-200 hover:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StaffAttendanceTable;
