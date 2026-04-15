import { useState } from 'react';
import { attendanceAPI } from '../api/apiClient';

const StaffAttendanceForm = ({ onAttendanceAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const closingManagers = ['Pooja Tikude', 'Manasi Mehta', 'Ayush Jain', 'Nitesh Sharma', 'Prashant'];
  const sourcingManagers = ['Akash Chavan', 'Nitesh Thakur'];
  const greManagers = ['Komal Pawar'];
  const crmManagers = ['Raj Patil'];

  const [formData, setFormData] = useState({
    managerName: '',
    managerType: 'Closing Manager',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '',
    status: 'Present',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getManagerList = () => {
    if (formData.managerType === 'Closing Manager') return closingManagers;
    if (formData.managerType === 'Sourcing Manager') return sourcingManagers;
    if (formData.managerType === 'GRE') return greManagers;
    if (formData.managerType === 'CRM') return crmManagers;
    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validation
    if (!formData.managerName || !formData.managerType || !formData.date) {
      setError('All fields are required');
      return;
    }

    // Check-in time is required only if status is not Absent, Week Off, or Leave
    if (formData.status !== 'Absent' && formData.status !== 'Week Off' && formData.status !== 'Leave' && !formData.checkInTime) {
      setError('Check-in time is required');
      return;
    }

    try {
      setLoading(true);
      
      // If status is Absent, Week Off, or Leave, set checkInTime to status
      const submitData = {
        ...formData,
        checkInTime: (formData.status === 'Absent' || formData.status === 'Week Off' || formData.status === 'Leave') ? formData.status : formData.checkInTime,
      };
      
      const response = await attendanceAPI.addAttendance(submitData);

      if (response.data.success) {
        setSuccessMsg('Attendance marked successfully');
        // Reset form
        setFormData({
          managerName: '',
          managerType: 'Closing Manager',
          date: new Date().toISOString().split('T')[0],
          checkInTime: '',
          status: 'Present',
        });

        // Notify parent component
        if (onAttendanceAdded) {
          onAttendanceAdded(response.data.data);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to mark attendance';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mark Attendance</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manager Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager Type <span className="text-red-500">*</span>
            </label>
            <select
              name="managerType"
              value={formData.managerType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Closing Manager">Closing Manager</option>
              <option value="Sourcing Manager">Sourcing Manager</option>
              <option value="GRE">GRE</option>
              <option value="CRM">CRM</option>
            </select>
          </div>

          {/* Manager Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager Name <span className="text-red-500">*</span>
            </label>
            <select
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Manager</option>
              {getManagerList().map((manager) => (
                <option key={manager} value={manager}>
                  {manager}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Left Early">Left Early</option>
              <option value="Week Off">Week Off</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          {/* Check-in Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Time {formData.status !== 'Absent' && formData.status !== 'Week Off' && formData.status !== 'Leave' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="checkInTime"
              placeholder="e.g., 09:30 AM"
              value={formData.checkInTime}
              onChange={handleChange}
              disabled={formData.status === 'Absent' || formData.status === 'Leave'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {(formData.status === 'Absent' || formData.status === 'Leave') && (
              <p className="text-xs text-gray-500 mt-1">Not required for {formData.status} status</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => {
              setFormData({
                managerName: '',
                managerType: 'Closing Manager',
                date: new Date().toISOString().split('T')[0],
                checkInTime: '',
                status: 'Present',
              });
              setError('');
              setSuccessMsg('');
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Marking...' : 'Mark Attendance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffAttendanceForm;
