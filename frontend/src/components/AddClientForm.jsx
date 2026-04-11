import { useState } from 'react';
import { clientAPI } from '../api/apiClient';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export const AddClientForm = ({ onClientAdded, socket }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    phoneNumber: '',
    visitDate: '',
    closingManager: '',
    source: '',
    sourcingManager: '',
    remark: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (!formData.clientName.trim()) {
        setError('Client name is required');
        setLoading(false);
        return;
      }

      // Phone number is optional, but if provided, must be 10 digits
      if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber)) {
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

      // Sourcing manager is always optional now

      const response = await clientAPI.addClient(formData);

      setSuccess('Client added successfully!');
      setFormData({
        clientName: '',
        phoneNumber: '',
        visitDate: '',
        closingManager: '',
        source: '',
        sourcingManager: '',
        remark: '',
      });

      if (onClientAdded) {
        onClientAdded(response.data.data);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-primary">Add New Client</h2>

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
            <label className="label">Phone Number (Optional)</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="input"
              placeholder="10-digit phone number (optional)"
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
            </select>
          </div>

          <div>
            <label className="label">Sourcing Manager (Optional)</label>
            <select
              name="sourcingManager"
              value={formData.sourcingManager}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select Sourcing Manager</option>
              <option value="Akash Chavan">Akash Chavan</option>
              <option value="Nitesh Thakur">Nitesh Thakur</option>
            </select>
          </div>

          <div>
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-6"
        >
          {loading ? 'Adding Client...' : 'Add Client'}
        </button>
      </form>
    </div>
  );
};
