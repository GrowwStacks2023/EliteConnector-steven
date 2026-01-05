
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TradeType } from '../../types';
import Swal from 'sweetalert2';

const SubmitLeadPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submissionType, setSubmissionType] = useState<'manual' | 'csv'>('manual');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processCSV(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processCSV(files[0]);
    }
  };

  const processCSV = (file: File) => {
    if (file.name.endsWith('.csv')) {
      setFileName(file.name);
      // Simulate parsing and uploading
      Swal.fire({
        title: 'Parsing CSV...',
        text: 'Extracting lead data and validating formats.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
          setTimeout(() => {
            Swal.close();
            setSubmitted(true);
          }, 2000);
        }
      });
    } else {
      Swal.fire('Invalid File', 'Please upload a valid .csv file.', 'error');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-indigo-50">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-lg mx-4">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">✓</div>
          <h2 className="text-3xl font-extrabold text-gray-900 brand-font mb-4">
            {submissionType === 'manual' ? 'Lead Created!' : 'Bulk Import Successful!'}
          </h2>
          <p className="text-gray-600 font-medium mb-8">
            {submissionType === 'manual' 
              ? 'The lead has been successfully posted to the marketplace.' 
              : 'All valid leads from your CSV have been processed and are now live in the marketplace.'}
          </p>
          <div className="space-x-4">
            <button onClick={() => { setSubmitted(false); setFileName(null); }} className="text-indigo-600 font-bold hover:underline">
              {submissionType === 'manual' ? 'Post Another Lead' : 'Import Another CSV'}
            </button>
            <Link to="/admin" className="text-gray-500 font-bold hover:underline">Back to Admin Panel</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-indigo-50/50 min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 brand-font mb-4">Admin: Create New Leads</h1>
          <p className="text-gray-600 font-medium">Choose between manual entry or bulk CSV import.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex">
            <button 
              onClick={() => setSubmissionType('manual')}
              className={`px-8 py-3 rounded-xl font-bold transition-all text-sm ${submissionType === 'manual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-indigo-600'}`}
            >
              Manual Form
            </button>
            <button 
              onClick={() => setSubmissionType('csv')}
              className={`px-8 py-3 rounded-xl font-bold transition-all text-sm ${submissionType === 'csv' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-indigo-600'}`}
            >
              CSV Bulk Upload
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-indigo-50">
          {submissionType === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Lead / Client Name</label>
                    <input type="text" required placeholder="e.g. Alice Johnson" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Trade Category</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all">
                      {Object.values(TradeType).map(trade => (
                        <option key={trade} value={trade}>{trade}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Location</label>
                    <input type="text" required placeholder="City, Postcode" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Credit Price</label>
                    <input type="number" defaultValue={1} min={1} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Project Description</label>
                    <textarea rows={6} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all" placeholder="Full details for the trade..."></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Project Drawings (Optional)</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-300 transition-colors cursor-pointer bg-gray-50 group">
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📂</div>
                      <span className="text-xs text-gray-400 font-bold block mb-2 uppercase tracking-tight">Drag & Drop Files</span>
                      <input type="file" multiple className="hidden" id="drawings" />
                      <label htmlFor="drawings" className="text-indigo-600 text-sm font-bold hover:underline cursor-pointer">Select Asset</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-[0.98]">
                  Publish Single Lead
                </button>
              </div>
            </form>
          ) : (
            <div className="p-10">
              <div className="mb-8 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                <h3 className="text-lg font-bold text-indigo-900 mb-2 brand-font">CSV Requirements</h3>
                <p className="text-sm text-indigo-700 leading-relaxed font-medium">
                  Ensure your file includes columns for: <span className="font-bold">Name, Trade, Location, Price, Description</span>. 
                  You can download our template below to ensure 100% data sync accuracy.
                </p>
                <button className="mt-4 text-indigo-600 font-bold text-sm flex items-center hover:underline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Download CSV Template
                </button>
              </div>

              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`border-4 border-dashed rounded-[3rem] p-16 text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-100 hover:border-indigo-200 bg-gray-50'}`}
              >
                <div className="text-6xl mb-6">📊</div>
                <h3 className="text-2xl font-bold text-gray-900 brand-font mb-2">Drop your CSV here</h3>
                <p className="text-gray-500 font-medium mb-8">Maximum file size 10MB. Supports up to 500 leads per upload.</p>
                
                <input 
                  type="file" 
                  id="csv-upload" 
                  className="hidden" 
                  accept=".csv" 
                  onChange={handleFileSelect}
                />
                <label 
                  htmlFor="csv-upload" 
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all cursor-pointer inline-block"
                >
                  Select File from Computer
                </label>

                {fileName && (
                  <div className="mt-6 flex items-center justify-center space-x-2 text-indigo-600 font-bold animate-pulse">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    <span>{fileName} loaded</span>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                 <p className="text-xs text-gray-400 font-medium italic">All leads will be validated against active trade categories before being published.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitLeadPage;
