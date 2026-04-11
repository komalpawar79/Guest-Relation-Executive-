import { useState, useEffect } from 'react';
import { reportAPI } from '../api/apiClient';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

export const AnalyticsDashboard = ({ filters }) => {
  const [analytics, setAnalytics] = useState(null);
  const [managerAnalytics, setManagerAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, managerRes] = await Promise.all([
        reportAPI.getAnalytics(filters),
        reportAPI.getManagerAnalytics(filters),
      ]);

      setAnalytics(analyticsRes.data.data);
      setManagerAnalytics(managerRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Clients"
            value={analytics.totalCount?.[0]?.total || 0}
            color="bg-blue-50 text-blue-600"
          />
          <StatsCard
            title="Attended"
            value={
              analytics.attendanceCount?.find((a) => a._id === true)?.count || 0
            }
            color="bg-green-50 text-green-600"
          />
          <StatsCard
            title="Pending"
            value={
              analytics.attendanceCount?.find((a) => a._id === false)?.count || 0
            }
            color="bg-yellow-50 text-yellow-600"
          />
          <StatsCard
            title="Attendance Rate"
            value={
              analytics.attendanceCount?.[0]?.count
                ? `${Math.round(
                    ((analytics.attendanceCount?.find((a) => a._id === true)
                      ?.count || 0) /
                      (analytics.totalCount?.[0]?.total || 1)) *
                      100
                  )}%`
                : '0%'
            }
            color="bg-purple-50 text-purple-600"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients Per Day */}
        {analytics?.clientsPerDay && analytics.clientsPerDay.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Clients Per Day</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.clientsPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Manager Distribution */}
        {analytics?.managerDistribution &&
          analytics.managerDistribution.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">
                Clients by Manager
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.managerDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

        {/* Attendance Status */}
        {analytics?.attendanceCount && (
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Attendance Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.attendanceCount.map((item) => ({
                    name: item._id ? 'Attended' : 'Pending',
                    value: item.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Closing Manager Stats */}
        {managerAnalytics?.closingManager &&
          managerAnalytics.closingManager.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">
                Closing Manager Performance
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {managerAnalytics.closingManager.map((manager) => (
                  <div
                    key={manager._id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">{manager._id}</p>
                      <p className="text-sm text-textSecondary">
                        {manager.totalClients} clients
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {Math.round(manager.attendanceRate * 100)}%
                      </p>
                      <p className="text-sm text-textSecondary">
                        {manager.attended} attended
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, color }) => (
  <div className={`card ${color} border-0`}>
    <p className="text-sm font-medium opacity-75">{title}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);
