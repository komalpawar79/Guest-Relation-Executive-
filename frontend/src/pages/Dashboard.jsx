import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AddClientForm } from '../components/AddClientForm';
import { ClientsTable } from '../components/ClientsTable';
import { FilterSection } from '../components/FilterSection';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { ReportsSection } from '../components/ReportsSection';
import StaffAttendanceSection from '../components/StaffAttendanceSection';
import { FiLogOut, FiHome, FiFileText, FiUsers, FiPlus, FiClock } from 'react-icons/fi';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const [filters, setFilters] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Connect to Socket.IO
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClientAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-primary sticky top-0 z-40">
        <div className="px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">GRE Dashboard</h1>
            <p className="text-textSecondary text-sm">
              Welcome, {user?.name}! ({user?.role?.toUpperCase()})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 shadow-md overflow-y-auto">
          <nav className="py-6 px-4 space-y-2">
            <NavItem
              icon={<FiHome size={20} />}
              label="Overview"
              active={currentTab === 'overview'}
              onClick={() => setCurrentTab('overview')}
            />
            <NavItem
              icon={<FiPlus size={20} />}
              label="Add Client"
              active={currentTab === 'add-client'}
              onClick={() => setCurrentTab('add-client')}
            />
            <NavItem
              icon={<FiUsers size={20} />}
              label="All Clients"
              active={currentTab === 'all-clients'}
              onClick={() => setCurrentTab('all-clients')}
            />
            <NavItem
              icon={<FiFileText size={20} />}
              label="Reports"
              active={currentTab === 'reports'}
              onClick={() => setCurrentTab('reports')}
            />
            <NavItem
              icon={<FiClock size={20} />}
              label="Staff Attendance"
              active={currentTab === 'staff-attendance'}
              onClick={() => setCurrentTab('staff-attendance')}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {currentTab === 'overview' && (
              <div className="space-y-6">
                <FilterSection onFilterChange={setFilters} />
                <AnalyticsDashboard filters={filters} />
                <ClientsTable
                  filters={filters}
                  socket={socket}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            )}

            {currentTab === 'add-client' && (
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <AddClientForm onClientAdded={handleClientAdded} socket={socket} />
                </div>
              </div>
            )}

            {currentTab === 'all-clients' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-2">All Clients</h2>
                  <p className="text-textSecondary">View all clients from the database in real-time</p>
                </div>
                <ClientsTable
                  filters={{}}
                  socket={socket}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            )}

            {currentTab === 'reports' && (
              <ReportsSection />
            )}

            {currentTab === 'staff-attendance' && (
              <StaffAttendanceSection socket={socket} />
            )}
          </div>
        </main>
      </div>

      {/* Footer - Always at Bottom */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-full mx-auto px-6 py-4 text-center text-textSecondary text-sm">
          <p>&copy; 2026 GRE Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
      active
        ? 'bg-primary bg-opacity-10 text-primary border-l-4 border-primary'
        : 'text-textSecondary hover:bg-gray-50 hover:text-primary'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
