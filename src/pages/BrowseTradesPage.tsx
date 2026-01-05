
import React, { useState } from 'react';
import { TradeType } from '../../types';

interface TradeCardProps {
  name: string;
  type: string;
  rating: number;
  completedJobs: number;
  experience: string;
}

const TradeCard: React.FC<TradeCardProps> = ({ name, type, rating, completedJobs, experience }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg transition-all">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-16 h-16 bg-pastel-blue rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-700">
        {name.charAt(0)}
      </div>
      <div>
        <h3 className="font-bold text-lg text-gray-900">{name}</h3>
        <p className="text-sm text-indigo-600 font-semibold">{type}</p>
      </div>
    </div>
    <div className="space-y-3 mb-6">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400 font-medium">Experience</span>
        <span className="text-gray-900 font-bold">{experience}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400 font-medium">Rating</span>
        <div className="flex items-center text-yellow-500 font-bold">
          ★ {rating}
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400 font-medium">Completed Jobs</span>
        <span className="text-gray-900 font-bold">{completedJobs}</span>
      </div>
    </div>
    <button className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all">
      View Profile
    </button>
  </div>
);

const BrowseTradesPage: React.FC = () => {
  const [filter, setFilter] = useState('All');

  const trades = [
    { name: 'John Plumber', type: TradeType.PLUMBER, rating: 4.9, completedJobs: 142, experience: '12 Years' },
    { name: 'Sparky Mike', type: TradeType.ELECTRICIAN, rating: 4.8, completedJobs: 98, experience: '8 Years' },
    { name: 'Smooth Dave', type: TradeType.PLASTERER, rating: 5.0, completedJobs: 54, experience: '15 Years' },
    { name: 'Karen Carpenter', type: TradeType.CARPENTER, rating: 4.7, completedJobs: 112, experience: '5 Years' },
    { name: 'Paul Painter', type: TradeType.PAINTER, rating: 4.6, completedJobs: 210, experience: '20 Years' },
  ];

  const filteredTrades = filter === 'All' ? trades : trades.filter(t => t.type === filter);

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 brand-font mb-4">Elite Trade Professionals</h1>
          <p className="text-gray-500 font-medium">Browse our hand-picked and verified service providers.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {['All', ...Object.values(TradeType)].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                filter === t ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredTrades.map((trade, i) => (
            <TradeCard key={i} {...trade} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseTradesPage;
