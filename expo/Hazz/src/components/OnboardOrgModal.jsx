import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import { useToast } from '../context/ToastContext';

export const OnboardOrgModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    orgName: '',
    companyNumber: '',
    address: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    annualFee: '123'
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { getToken } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  const handleClose = (success = false) => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(success);
      setIsClosing(false);
    }, 300); // 300ms for animation
  };

  if (!isOpen && !isClosing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      Object.keys(formData).forEach(k => fd.append(k, formData[k]));
      if (file) fd.append('agreementFile', file);

      const res = await fetch('http://localhost:5000/api/organisations/onboard', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        showToast('Organisation onboarded successfully!', 'success');
        handleClose(true); // pass true to indicate success
      } else {
        showToast(data.message || 'Error onboarding organisation', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isClosing ? 'bg-black/0 opacity-0' : 'bg-black/50 opacity-100'}`}>
      <div className={`bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-300 transform ${isClosing ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Onboard New Organisation</h2>
          <button onClick={() => handleClose(false)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Organisation Name</label>
              <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green focus:ring-1 focus:ring-green outline-none" value={formData.orgName} onChange={e => setFormData({...formData, orgName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Company Number</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green focus:ring-1 focus:ring-green outline-none" value={formData.companyNumber} onChange={e => setFormData({...formData, companyNumber: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green focus:ring-1 focus:ring-green outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Admin First Name</label>
              <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green focus:ring-1 focus:ring-green outline-none" value={formData.adminFirstName} onChange={e => setFormData({...formData, adminFirstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Last Name</label>
              <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green focus:ring-1 focus:ring-green outline-none" value={formData.adminLastName} onChange={e => setFormData({...formData, adminLastName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Email</label>
              <input required type="email" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green focus:ring-1 focus:ring-green outline-none" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Phone</label>
              <input type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green focus:ring-1 focus:ring-green outline-none" value={formData.adminPhone} onChange={e => setFormData({...formData, adminPhone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Annual Fee (£)</label>
              <input required type="number" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green focus:ring-1 focus:ring-green outline-none" value={formData.annualFee} onChange={e => setFormData({...formData, annualFee: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Agreement Document (PDF)</label>
              <input type="file" accept=".pdf" className="w-full px-4 py-1.5 rounded-lg border border-gray-200 focus:border-green outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green/10 file:text-green hover:file:bg-green/20" onChange={e => setFile(e.target.files[0])} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => handleClose(false)} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg bg-green text-white font-semibold hover:bg-green-600 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Onboarding...' : 'Onboard Organisation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};