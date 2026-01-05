
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const LeadQuestionnairePage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
    estimatedQuote: '',
    earliestStart: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send the proposal to the backend
    // and associate it with the lead and the logged-in Service Provider
    const savedProposals = JSON.parse(localStorage.getItem('ec_proposals') || '{}');
    const leadProposals = savedProposals[leadId || ''] || [];
    
    const newProposal = {
      id: `prop-${Date.now()}`,
      tradeId: 'trade-current', // Placeholder for actual user ID
      tradeName: formData.fullName,
      tradeRating: 4.8,
      message: formData.message,
      quote: formData.estimatedQuote,
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    };

    savedProposals[leadId || ''] = [...leadProposals, newProposal];
    localStorage.setItem('ec_proposals', JSON.stringify(savedProposals));

    Swal.fire({
      title: 'Proposal Submitted!',
      text: 'Your interest and quote have been sent to the client. They will review your profile and respond shortly.',
      icon: 'success',
      confirmButtonColor: '#4f46e5'
    }).then(() => {
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">✓</div>
          <h2 className="text-3xl font-extrabold text-gray-900 brand-font mb-4">Interest Registered!</h2>
          <p className="text-gray-600 font-medium mb-8 leading-relaxed">
            Your professional proposal has been sent. If the client accepts, you'll receive their direct contact details to finalize the project.
          </p>
          <button 
            onClick={() => window.close()} 
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-indigo-50/50 min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            Service Provider Proposal
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 brand-font mb-4">Submit Your Quote</h1>
          <p className="text-gray-600 font-medium">Introduce yourself to the client and provide an initial estimate for the project.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-indigo-50">
          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Your Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Professional Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                    placeholder="e.g. John's Elite Plumbing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Project Proposal</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message to Client</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                    placeholder="Tell the client why you're the best choice for this job..."
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Quote (£)</label>
                    <input
                      type="text"
                      required
                      value={formData.estimatedQuote}
                      onChange={e => setFormData({ ...formData, estimatedQuote: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                      placeholder="e.g. £250 - £300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Earliest Availability</label>
                    <input
                      type="date"
                      required
                      value={formData.earliestStart}
                      onChange={e => setFormData({ ...formData, earliestStart: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50">
              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                Submit Proposal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadQuestionnairePage;
