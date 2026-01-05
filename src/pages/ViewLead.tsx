
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, TradeType } from '../../types';

interface ViewLeadProps {
  user: User;
}

const ViewLead: React.FC<ViewLeadProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();

  // Use the current origin for the QR code link to ensure it points back to this app
  const currentOrigin = window.location.origin + window.location.pathname;
  const formUrl = `${currentOrigin}#/form/${id}`;

  // Mock fetching lead details
  const leadData = {
    id,
    clientName: 'James Potter',
    serviceRequired: TradeType.PLUMBER,
    location: 'Godric\'s Hollow',
    description: 'The pipes in the master bathroom are making weird noises and leaking slightly. Needs inspection and possibly replacement of seals.',
    fullContact: {
      phone: '+44 7700 900000',
      email: 'james.p@example.com'
    },
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(formUrl)}`
  };

  const copyLink = () => {
    navigator.clipboard.writeText(formUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center space-x-2">
           <Link to="/my-purchases" className="text-indigo-600 font-bold hover:underline flex items-center">
             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
             Back to Purchases
           </Link>
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-indigo-600 p-10 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <span className="px-3 py-1 bg-indigo-500/50 text-white border border-indigo-400 text-[10px] font-bold rounded-full uppercase tracking-widest mb-4 inline-block">
                  Purchased Lead
                </span>
                <h1 className="text-4xl font-extrabold brand-font">{leadData.clientName}</h1>
                <p className="mt-2 text-indigo-100 font-medium">{leadData.serviceRequired} Service Required</p>
              </div>
              {/* <div className="mt-6 md:mt-0 text-right">
                <div className="text-xs text-indigo-200 uppercase font-bold tracking-tighter mb-1">GHL Subaccount</div>
                <div className="font-mono text-sm bg-indigo-700 px-3 py-1 rounded border border-indigo-500">
                  ACC_{user.id.substring(0, 8)}
                </div>
              </div> */}
            </div>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 brand-font">Project Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Location</label>
                  <p className="text-gray-800 font-medium">{leadData.location}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Full Description</label>
                  <p className="text-gray-600 leading-relaxed font-medium">{leadData.description}</p>
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                       <span className="w-6 h-6 flex items-center justify-center bg-indigo-50 rounded mr-3">📞</span>
                       <span className="font-medium">{leadData.fullContact.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                       <span className="w-6 h-6 flex items-center justify-center bg-indigo-50 rounded mr-3">✉️</span>
                       <span className="font-medium">{leadData.fullContact.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-indigo-50 rounded-[2.5rem] p-10 border-2 border-dashed border-indigo-100">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-indigo-900 brand-font">Send Questionnaire</h3>
                <p className="text-xs text-indigo-600 mt-1">Ask the lead for more info</p>
              </div>
              
              <div className="bg-white p-4 rounded-3xl shadow-lg mb-6">
                <img src={leadData.qrUrl} alt="QR Code" className="w-48 h-48" />
              </div>

              <div className="w-full">
                <button 
                  onClick={copyLink}
                  className="w-full mb-3 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all"
                >
                  Copy Link for Lead
                </button>
                <p className="text-[10px] text-gray-400 text-center leading-tight">
                  This QR points to your unique project form. When filled, responses will be synced to your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLead;
