import React from 'react';

interface Job {
  id: string;
  title: string;
  trade: string;
  clientName: string;
  location: string;
  budget: number;
  status: 'active' | 'unlocked' | 'completed' | 'expired';
  postedDate: string;
  viewCount: number;
  unlockCount: number;
}

interface JobsTableProps {
  jobs: Job[];
  onDeleteJob: (jobId: string, jobTitle: string) => void;
}

const JobsTable: React.FC<JobsTableProps> = ({ jobs, onDeleteJob }) => {
  return (
    <div className="bg-slate-900/50 border border-cyan-900/30 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Job Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Trade
              </th>
              <th className="px-6 py-4 text-left text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Client
              </th>
              <th className="px-6 py-4 text-left text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Budget
              </th>
              <th className="px-6 py-4 text-left text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Views/Unlocks
              </th>
              <th className="px-6 py-4 text-right text-xs font-rajdhani font-bold text-cyan-400 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-rajdhani font-bold text-white">
                    {job.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    Posted {job.postedDate}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-rajdhani font-bold">
                    {job.trade}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300 font-rajdhani">
                  {job.clientName}
                </td>
                <td className="px-6 py-4 text-slate-400 font-rajdhani">
                  {job.location}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xl font-orbitron font-bold text-green-400">
                    £{job.budget}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-rajdhani font-bold ${
                      job.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : job.status === 'unlocked'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : job.status === 'completed'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    {job.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-300 font-rajdhani">
                    👁️ {job.viewCount} / 🔓 {job.unlockCount}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDeleteJob(job.id, job.title)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg font-rajdhani font-bold text-sm hover:bg-red-500/30 transition-all cyber-button"
                  >
                    DELETE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {jobs.length === 0 && (
        <div className="p-12 text-center text-slate-500 font-rajdhani">
          No jobs found
        </div>
      )}
    </div>
  );
};

export default JobsTable;