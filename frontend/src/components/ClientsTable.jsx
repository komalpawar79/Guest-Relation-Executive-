import { useState, useEffect } from 'react';
import { clientAPI } from '../api/apiClient';
import { EditClientModal } from './EditClientModal';
import { FiEdit2, FiTrash2, FiCheckCircle, FiCircle } from 'react-icons/fi';
import { format } from 'date-fns';

export const ClientsTable = ({ filters, socket, refreshTrigger }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRemark, setEditRemark] = useState('');
  const [editingClient, setEditingClient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [closingManagerFilter, setClosingManagerFilter] = useState('');
  const [sourcingManagerFilter, setSourcingManagerFilter] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pages: 1,
    total: 0,
  });

  useEffect(() => {
    setPagination({ currentPage: 1, pages: 1, total: 0 });
    fetchClients();
  }, [filters, refreshTrigger, dateFilter, sourceFilter, closingManagerFilter, sourcingManagerFilter]);

  useEffect(() => {
    if (!socket) return;

    socket.on('clientAdded', (newClient) => {
      setClients((prev) => [newClient, ...prev]);
    });

    socket.on('clientUpdated', (updatedClient) => {
      setClients((prev) =>
        prev.map((client) =>
          client._id === updatedClient._id ? updatedClient : client
        )
      );
    });

    socket.on('remarkUpdated', (updatedClient) => {
      setClients((prev) =>
        prev.map((client) =>
          client._id === updatedClient._id ? updatedClient : client
        )
      );
    });

    socket.on('attendanceUpdated', (updatedClient) => {
      setClients((prev) =>
        prev.map((client) =>
          client._id === updatedClient._id ? updatedClient : client
        )
      );
    });

    socket.on('clientDeleted', (clientId) => {
      setClients((prev) => prev.filter((client) => client._id !== clientId));
    });

    return () => {
      socket.off('clientAdded');
      socket.off('clientUpdated');
      socket.off('remarkUpdated');
      socket.off('attendanceUpdated');
      socket.off('clientDeleted');
    };
  }, [socket]);

  const fetchClients = async (pageNum = 1) => {
    setLoading(true);
    try {
      const queryParams = {
        ...filters,
        page: pageNum,
        limit: 20,
      };
      if (dateFilter) {
        queryParams.visitDate = dateFilter;
      }
      if (sourceFilter) {
        queryParams.source = sourceFilter;
      }
      if (closingManagerFilter) {
        queryParams.closingManager = closingManagerFilter;
      }
      if (sourcingManagerFilter) {
        queryParams.sourcingManager = sourcingManagerFilter;
      }

      const response = await clientAPI.getClients(queryParams);
      setClients(response.data.data.clients);
      setPagination({
        currentPage: response.data.data.currentPage,
        pages: response.data.data.pages,
        total: response.data.data.total,
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRemark = async (clientId, remark) => {
    try {
      const response = await clientAPI.updateRemark(clientId, remark);
      setClients((prev) =>
        prev.map((client) =>
          client._id === clientId ? response.data.data : client
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error('Error updating remark:', error);
    }
  };

  const handleToggleAttended = async (client) => {
    try {
      const response = await clientAPI.markAttended(client._id, {
        attended: !client.attended,
        attendedBy: !client.attended ? client.closingManager : '',
      });
      setClients((prev) =>
        prev.map((c) => (c._id === client._id ? response.data.data : c))
      );
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const handleDelete = async (clientId) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await clientAPI.deleteClient(clientId);
        setClients((prev) => prev.filter((c) => c._id !== clientId));
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  if (loading && clients.length === 0) {
    return (
      <div className="card">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <h2 className="text-xl font-bold mb-4 text-textPrimary">Clients List</h2>

      {/* Date & Source & Managers Filter */}
      <div className="mb-4 pb-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-textPrimary mb-2">Filter by Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPagination({ ...pagination, currentPage: 1 });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-textPrimary mb-2">Filter by Source</label>
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPagination({ ...pagination, currentPage: 1 });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">All Sources</option>
            <option value="Walking">Walking</option>
            <option value="Reference">Reference</option>
            <option value="CRM">CRM</option>
            <option value="Channel Partner">Channel Partner</option>
            <option value="Revisit">Revisit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-textPrimary mb-2">Filter by Closing Mgr</label>
          <select
            value={closingManagerFilter}
            onChange={(e) => {
              setClosingManagerFilter(e.target.value);
              setPagination({ ...pagination, currentPage: 1 });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">All Closing Mgrs</option>
            {[...new Set(clients.map(c => c.closingManager).filter(Boolean))].sort().map(manager => (
              <option key={manager} value={manager}>{manager}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-textPrimary mb-2">Filter by Sourcing Mgr</label>
          <select
            value={sourcingManagerFilter}
            onChange={(e) => {
              setSourcingManagerFilter(e.target.value);
              setPagination({ ...pagination, currentPage: 1 });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">All Sourcing Mgrs</option>
            {[...new Set(clients.map(c => c.sourcingManager).filter(Boolean))].sort().map(manager => (
              <option key={manager} value={manager}>{manager}</option>
            ))}
          </select>
        </div>
      </div>

      {clients.length === 0 ? (
        <p className="text-center text-textSecondary py-8">No clients found</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Sourcing Mgr
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Closing Mgr
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Remark
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{client.clientName}</td>
                    <td className="px-4 py-3 text-sm">{client.phoneNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(client.visitDate), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                        {client.source || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{client.sourcingManager || '-'}</td>
                    <td className="px-4 py-3 text-sm">{client.closingManager}</td>
                    <td className="px-4 py-3 text-sm max-w-xs">
                      {editingId === client._id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editRemark}
                            onChange={(e) => setEditRemark(e.target.value)}
                            className="input text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() =>
                              handleUpdateRemark(client._id, editRemark)
                            }
                            className="text-primary font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => {
                            setEditingId(client._id);
                            setEditRemark(client.remark);
                          }}
                          className="cursor-pointer hover:text-primary"
                        >
                          {client.remark || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={client.attended ? 'attended' : 'pending'}
                        onChange={(e) => {
                          const attended = e.target.value === 'attended';
                          handleToggleAttended({ ...client, attended: !attended });
                        }}
                        className="input text-sm py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="attended">Attended</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingClient(client);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Client"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(client._id)}
                          className="text-danger hover:text-red-700"
                          title="Delete Client"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-textSecondary">
              Showing {clients.length} of {pagination.total} clients
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  fetchClients(Math.max(1, pagination.currentPage - 1))
                }
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                {pagination.currentPage} / {pagination.pages}
              </span>
              <button
                onClick={() =>
                  fetchClients(
                    Math.min(
                      pagination.pages,
                      pagination.currentPage + 1
                    )
                  )
                }
                disabled={pagination.currentPage === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingClient(null);
          }}
          onSuccess={() => fetchClients()}
        />
      )}
    </div>
  );
};
