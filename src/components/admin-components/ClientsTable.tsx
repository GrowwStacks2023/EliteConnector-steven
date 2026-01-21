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

interface ClientsTableProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
}

const ClientsTable: React.FC<ClientsTableProps> = ({ clients, onViewClient }) => {
  return (
    <div className="bg-slate-900/50 border border-cyan-900/30 rounded-xl overflow-hidden">
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
      `}</style>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Client
              </th>
              <th className="px-6 py-4 text-left text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Company
              </th>
              <th className="px-6 py-4 text-left text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Projects
              </th>
              <th className="px-6 py-4 text-left text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Joined
              </th>
              <th className="px-6 py-4 text-right text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="font-rajdhani font-bold text-white">
                      {client.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {client.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300 font-rajdhani">
                  {client.company || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`status-badge px-3 py-1 rounded-full text-xs font-rajdhani font-bold ${
                      client.status === 'active'
                        ? 'status-active bg-cyan-500/20 text-cyan-400'
                        : 'status-inactive bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    {client.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xl font-orbitron font-bold text-purple-400">
                    {client.projectsPosted}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 font-rajdhani">
                  {client.joinedDate}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewClient(client)}
                    className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg font-rajdhani font-bold text-sm hover:bg-cyan-500/30 transition-all cyber-button"
                  >
                    VIEW
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {clients.length === 0 && (
        <div className="p-12 text-center text-slate-500 font-rajdhani">
          No clients found
        </div>
      )}
    </div>
  );
};

export default ClientsTable;