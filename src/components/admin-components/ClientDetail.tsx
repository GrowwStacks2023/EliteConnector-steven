import React from 'react';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  projectsPosted: number;
  totalSpent: number;
}

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
  onToggleStatus: (id: string, status: 'active' | 'inactive', name: string) => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({
  client,
  onBack,
  onToggleStatus
}) => {
  return (
    <div className="space-y-6">
      <style>{`
        .status-badge {
          position: relative;
          padding-left: 1.5rem;
        }
        
        .status-badge::before {
          content: '';
          position: absolute;
          left: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .status-active::before {
          background-color: #22d3ee;
          box-shadow: 0 0 10px #22d3ee;
        }
        
        .status-inactive::before {
          background-color: #64748b;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .metric-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(34, 211, 238, 0.1);
          transition: all 0.3s ease;
        }
        
        .cyber-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .cyber-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .cyber-button:hover::before {
          left: 100%;
        }
      `}</style>

      <button
        onClick={onBack}
        className="flex items-center text-cyan-400 font-rajdhani font-bold hover:text-cyan-300 transition-colors"
      >
        <span className="mr-2">←</span> BACK TO LIST
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="metric-card p-8 rounded-xl">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-4xl font-orbitron font-black text-white"
                style={{boxShadow: '0 0 30px rgba(192, 132, 252, 0.5)'}}>
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-orbitron font-black text-white mb-2">
                  {client.name}
                </h2>
                <p className="text-purple-400 font-rajdhani text-lg font-bold mb-1">
                  {client.company || 'Individual Client'}
                </p>
                <p className="text-slate-400 font-mono text-sm">
                  {client.email}
                </p>
              </div>
            </div>
          </div>

          <div className="metric-card p-8 rounded-xl">
            <h3 className="text-xl font-orbitron font-bold text-white mb-6">
              ACCOUNT DETAILS
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-700">
                <span className="text-slate-400 font-rajdhani">User ID</span>
                <span className="text-white font-mono text-sm">
                  {client.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-700">
                <span className="text-slate-400 font-rajdhani">Projects Posted</span>
                <span className="text-3xl font-orbitron font-bold text-purple-400">
                  {client.projectsPosted}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-700">
                <span className="text-slate-400 font-rajdhani">Total Spent</span>
                <span className="text-2xl font-orbitron font-bold text-green-400">
                  £{client.totalSpent}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-700">
                <span className="text-slate-400 font-rajdhani">Status</span>
                <span
                  className={`status-badge px-3 py-1 rounded-full text-xs font-rajdhani font-bold ${
                    client.status === 'active'
                      ? 'status-active bg-cyan-500/20 text-cyan-400'
                      : 'status-inactive bg-slate-700/50 text-slate-400'
                  }`}
                >
                  {client.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-400 font-rajdhani">Member Since</span>
                <span className="text-white font-rajdhani font-bold">
                  {client.joinedDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="metric-card p-6 rounded-xl">
            <h3 className="font-rajdhani font-bold text-white mb-4 tracking-wider">
              ADMIN ACTIONS
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => onToggleStatus(client.id, client.status, client.name)}
                className={`w-full py-3 rounded-lg font-rajdhani font-bold transition-all cyber-button ${
                  client.status === 'active'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                }`}
              >
                {client.status === 'active' ? 'DEACTIVATE' : 'ACTIVATE'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;