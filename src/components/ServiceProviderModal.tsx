import React, { useState, useEffect } from 'react';
import { LeadPurchase, fetchServiceProviderProjects, PortfolioProject } from '../services/purchaseService';

interface ServiceProviderModalProps {
  purchase: LeadPurchase;
  onClose: () => void;
}

const ServiceProviderModal: React.FC<ServiceProviderModalProps> = ({ purchase, onClose }) => {
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'projects'>('profile');

  const { service_provider } = purchase;

  useEffect(() => {
    loadPortfolioProjects();
  }, []);

  const loadPortfolioProjects = async () => {
    try {
      setLoading(true);
      const projects = await fetchServiceProviderProjects(service_provider.id);
      setPortfolioProjects(projects);
    } catch (err) {
      console.error('Error loading portfolio projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-3xl">
                {service_provider.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{service_provider.full_name}</h2>
                  {service_provider.is_verified && (
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                      ✓ Verified
                    </span>
                  )}
                </div>
                {service_provider.serviceType && (
                  <p className="text-indigo-100 text-lg">🔧 {service_provider.serviceType}</p>
                )}
                {service_provider.address && (
                  <p className="text-indigo-100 text-sm mt-1">
                    📍 {service_provider.address}
                    {service_provider.zipcode && `, ${service_provider.zipcode}`}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-4 font-semibold transition-all ${
              activeTab === 'profile'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-4 font-semibold transition-all ${
              activeTab === 'projects'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Portfolio ({portfolioProjects.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Professional Details */}
              {(service_provider.qualifications || service_provider.experience) && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Professional Information</h3>
                  <div className="space-y-3">
                    {service_provider.qualifications && (
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Qualifications</p>
                        <p className="text-gray-700 text-sm">{service_provider.qualifications}</p>
                      </div>
                    )}
                    {service_provider.experience && (
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Experience</p>
                        <p className="text-gray-700 text-sm">{service_provider.experience}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {service_provider.phone && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                      <span className="text-2xl">📞</span>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Phone</p>
                        <a 
                          href={`tel:${service_provider.phone}`} 
                          className="text-indigo-600 font-semibold hover:underline"
                        >
                          {service_provider.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {service_provider.email && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                      <span className="text-2xl">✉️</span>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
                        <a 
                          href={`mailto:${service_provider.email}`} 
                          className="text-indigo-600 font-semibold hover:underline break-all"
                        >
                          {service_provider.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Purchase Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-4 bg-indigo-50 rounded-2xl">
                    <span className="text-gray-600">Purchased On</span>
                    <span className="font-semibold text-gray-900">{formatDate(purchase.purchased_at)}</span>
                  </div>
                  <div className="flex justify-between p-4 bg-indigo-50 rounded-2xl">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-semibold text-green-600">£{purchase.price_paid}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {service_provider.phone && (
                  <a
                    href={`tel:${service_provider.phone}`}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all text-center"
                  >
                    📞 Call Now
                  </a>
                )}
                {service_provider.email && (
                  <a
                    href={`mailto:${service_provider.email}`}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all text-center"
                  >
                    ✉️ Send Email
                  </a>
                )}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-gray-500 mt-4">Loading portfolio...</p>
                </div>
              ) : portfolioProjects.length > 0 ? (
                <div className="space-y-4">
                  {portfolioProjects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-gray-900 text-lg">{project.title}</h4>
                        <span className="text-sm text-gray-500">{formatDate(project.date_completed)}</span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{project.description}</p>

                      {/* Project Images */}
                      {project.images && project.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                          {project.images.map((image, idx) => (
                            <img
                              key={idx}
                              src={image}
                              alt={`${project.title} - ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(image, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📁</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Portfolio Projects Yet</h3>
                  <p className="text-gray-500 text-sm">This service provider hasn't added any portfolio projects yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderModal;