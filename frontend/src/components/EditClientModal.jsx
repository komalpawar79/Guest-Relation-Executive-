import { useState } from 'react';
import { clientAPI } from '../api/apiClient';
import { FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export const EditClientModal = ({ client, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    clientName: client?.clientName || '',
    phoneNumber: client?.phoneNumber || '',
    visitDate: client?.visitDate?.split('T')[0] || '',
    closingManager: client?.closingManager || '',
    source: client?.source || '',
    sourcingManager: client?.sourcingManager || '',
    remark: client?.remark || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.clientName.trim()) {
        setError('Client name is required');
        setLoading(false);
        return;
      }

      if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
        setError('Phone number must be 10 digits');
        setLoading(false);
        return;
      }

      if (!formData.visitDate) {
        setError('Visit date is required');
        setLoading(false);
        return;
      }

      if (!formData.closingManager.trim()) {
        setError('Closing manager is required');
        setLoading(false);
        return;
      }

      if (!formData.source) {
        setError('Source is required');
        setLoading(false);
        return;
      }

      if (formData.source === 'Channel Partner' && !formData.sourcingManager.trim()) {
        setError('Sourcing manager is required for Channel Partner source');
        setLoading(false);
        return;
      }

      await clientAPI.updateClient(client._id, formData);
      setSuccess('Client updated successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary">Edit Client</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-danger bg-opacity-10 border border-danger text-danger px-4 py-3 rounded-lg mb-4 flex items-center">
              <FiAlertCircle className="mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-success bg-opacity-10 border border-success text-success px-4 py-3 rounded-lg mb-4 flex items-center">
              <FiCheckCircle className="mr-2" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div>
                <label className="label">Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="input"
                  placeholder="10-digit phone number"
                  required
                />
              </div>

              <div>
                <label className="label">Visit Date *</label>
                <input
                  type="date"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Closing Manager *</label>
                <select
                  name="closingManager"
                  value={formData.closingManager}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select Closing Manager</option>
                  <option value="Pooja Tikude">Pooja Tikude</option>
                  <option value="Manasi Mehta">Manasi Mehta</option>
                  <option value="Ayush Jain">Ayush Jain</option>
                  <option value="Nitesh Sharma">Nitesh Sharma</option>
                </select>
              </div>

              <div>
                <label className="label">Source *</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select Source</option>
                  <option value="Walking">Walking</option>
                  <option value="Reference">Reference</option>
                  <option value="CRM">CRM</option>
                  <option value="Channel Partner">Channel Partner</option>
                  <option value="Revisit">Revisit</option>
                </select>
              </div>

              <div>
                <label className="label">
                  Sourcing Manager {formData.source === 'Channel Partner' && '*'}
                </label>
                <select
                  name="sourcingManager"
                  value={formData.sourcingManager}
                  onChange={handleChange}
                  className="input"
                  required={formData.source === 'Channel Partner'}
                >
                  <option value="">Select Sourcing Manager</option>
                  <option value="Akash Chavan">Akash Chavan</option>
                  <option value="Nitesh Thakur">Nitesh Thakur</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="label">Remark (Optional)</label>
                <input
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  className="input"
                  placeholder="Add any remarks"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Updating...' : 'Update Client'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
