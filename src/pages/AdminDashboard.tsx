
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, TradeType } from '../../types';
import Swal from 'sweetalert2';

interface AdminDashboardProps {
  user: User;
}

interface SystemUser {
  id: string;
  name: string;
  trade: string;
  credits: number;
  status: 'Synced' | 'Pending Sync';
}

const INITIAL_USERS: SystemUser[] = [
  { id: 'u1', name: 'John Plumber', trade: 'Plumber', credits: 4, status: 'Synced' },
  { id: 'u2', name: 'Alice Smith', trade: 'Electrician', credits: 12, status: 'Synced' },
  { id: 'u3', name: 'Mark Wood', trade: 'Plasterer', credits: 0, status: 'Pending Sync' }
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'leads'>('stats');
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [viewingUser, setViewingUser] = useState<SystemUser | null>(null);

  const handleDeleteUser = async (userId: string, userName: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${userName}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete user',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setSystemUsers(prev => prev.filter(u => u.id !== userId));
      setViewingUser(null);
      Swal.fire({
        title: 'Deleted!',
        text: 'User has been removed from the system.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const handleManageCredits = async (u: SystemUser) => {
    const { value: credits } = await Swal.fire({
      title: `Update Credits for ${u.name}`,
      text: 'Add or remove credits for this user:',
      input: 'number',
      inputLabel: 'Current Credits: ' + u.credits,
      inputValue: 0,
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!';
        }
        return null;
      }
    });

    if (credits !== undefined) {
      const amount = parseInt(credits);
      const updatedList = systemUsers.map(usr => {
        if (usr.id === u.id) {
          const newUsr = { ...usr, credits: usr.credits + amount };
          if (viewingUser?.id === u.id) setViewingUser(newUsr);
          return newUsr;
        }
        return usr;
      });
      setSystemUsers(updatedList);

      Swal.fire({
        title: 'Updated!',
        text: `Successfully updated credits for ${u.name}.`,
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 hidden lg:block">
        <div className="p-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Admin Menu</h2>
          <nav className="space-y-4">
            <button 
              onClick={() => { setActiveTab('stats'); setViewingUser(null); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'stats' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab('users'); setViewingUser(null); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              User Management
            </button>
            <button 
              onClick={() => { setActiveTab('leads'); setViewingUser(null); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'leads' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Lead Management
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 flex justify-between items-center">
             <div>
               <h1 className="text-3xl font-extrabold text-gray-900 brand-font">Admin Panel</h1>
               <p className="text-gray-500">System Overview & Management</p>
             </div>
             <div className="flex space-x-3">
               {/* <Link to="/post-lead" className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center">
                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                 Post New Lead
               </Link> */}
               <div className="bg-white px-6 py-2 border border-gray-100 rounded-2xl flex items-center shadow-sm">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                  <span className="font-bold text-gray-700 text-sm">Core Systems Online</span>
               </div>
             </div>
          </header>

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                  <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total Sales</span>
                  <div className="text-4xl font-extrabold text-gray-900 mt-2">£12,450</div>
                  <div className="mt-4 flex items-center text-green-500 text-sm font-bold">
                    ↑ 12% this month
                  </div>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                  <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Active Leads</span>
                  <div className="text-4xl font-extrabold text-gray-900 mt-2">142</div>
                  <div className="mt-4 flex items-center text-indigo-500 text-sm font-bold">
                    45 Unlocked
                  </div>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                  <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">New Users</span>
                  <div className="text-4xl font-extrabold text-gray-900 mt-2">{systemUsers.length}</div>
                  <div className="mt-4 flex items-center text-green-500 text-sm font-bold">
                    +5 today
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
               {!viewingUser ? (
                 <>
                   {/* <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                     <h3 className="font-bold text-gray-800">System Users</h3>
                     <button className="text-indigo-600 font-bold text-sm">Export CSV</button>
                   </div> */}
                   <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Users</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Trades</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Credits</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Syncing</th>
                          <th className="px-6 py-4 text-between text-xs font-bold text-gray-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {systemUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-gray-800">{u.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{u.trade}</td>
                            <td className="px-6 py-4 text-sm font-bold text-indigo-600">{u.credits}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${u.status === 'Synced' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-left">
                              <button 
                                onClick={() => setViewingUser(u)}
                                className="text-indigo-600 hover:text-indigo-900 font-bold text-xs -mr-20 uppercase tracking-wider bg-indigo-50 px-4 py-2 rounded-xl transition-all"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                   {systemUsers.length === 0 && (
                     <div className="p-12 text-center text-gray-400 font-medium">
                       No users found.
                     </div>
                   )}
                 </>
               ) : (
                 <div className="p-10">
                    <button 
                      onClick={() => setViewingUser(null)}
                      className="mb-8 flex items-center text-gray-500 font-bold hover:text-indigo-600 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                      Back to User List
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div>
                        <div className="flex items-center space-x-6 mb-8">
                          <div className="w-20 h-20 bg-indigo-100 rounded-[1.5rem] flex items-center justify-center text-3xl font-bold text-indigo-700 uppercase">
                            {viewingUser.name.charAt(0)}
                          </div>
                          <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 brand-font">{viewingUser.name}</h2>
                            <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest">{viewingUser.trade}</p>
                          </div>
                        </div>

                        <div className="space-y-6 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                           <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                             <span className="text-gray-500 font-medium">User ID</span>
                             <span className="text-gray-900 font-bold font-mono text-sm">{viewingUser.id}</span>
                           </div>
                           <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                             <span className="text-gray-500 font-medium">Credit Balance</span>
                             <span className="text-indigo-600 font-bold text-xl">{viewingUser.credits} Credits</span>
                           </div>
                           <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                             <span className="text-gray-500 font-medium">GHL Status</span>
                             <span className={`px-3 py-1 rounded-full text-xs font-bold ${viewingUser.status === 'Synced' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                               {viewingUser.status}
                             </span>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center space-y-4">
                        <div className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
                          <h3 className="font-bold text-gray-900 mb-4">Management Actions</h3>
                          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Perform administrative actions on this user account. All changes are logged and synced with the GHL subaccount.
                          </p>
                          
                          <div className="space-y-3">
                            <button 
                              onClick={() => handleManageCredits(viewingUser)}
                              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                              Manage Credits
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteUser(viewingUser.id, viewingUser.name)}
                              className="w-full py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-bold hover:bg-rose-100 transition-all flex items-center justify-center"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              Delete User
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-6">
               <div className="bg-pastel-peach p-10 rounded-[2.5rem] border border-orange-100 flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-6 md:mb-0">
                    <h3 className="text-2xl font-bold text-orange-900 mb-2">Lead Generation</h3>
                    <p className="text-orange-700 font-medium">Create high-quality leads for your trade network.</p>
                  </div>
                  <Link to="/post-lead" className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-sm hover:bg-orange-700 transition-all">
                    Create New Lead
                  </Link>
               </div>

               <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-gray-50">
                   <h3 className="font-bold text-gray-800">Recent Leads</h3>
                 </div>
                 <div className="p-10 text-center">
                   <p className="text-gray-400 font-medium italic">List of active marketplace leads would appear here...</p>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;