import { useState, useEffect } from 'react';
import StaffAttendanceForm from './StaffAttendanceForm';
import StaffAttendanceTable from './StaffAttendanceTable';
import AttendanceStats from './AttendanceStats';

const StaffAttendanceSection = ({ socket }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAttendanceAdded = () => {
    // Trigger refresh of table and stats
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <StaffAttendanceForm onAttendanceAdded={handleAttendanceAdded} />

      {/* Statistics */}
      <AttendanceStats />

      {/* Table */}
      <StaffAttendanceTable refreshTrigger={refreshTrigger} socket={socket} />
    </div>
  );
};

export default StaffAttendanceSection;
