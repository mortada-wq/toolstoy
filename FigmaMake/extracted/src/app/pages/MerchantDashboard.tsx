import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { MessageSquare, TrendingUp, CheckCircle, AlertCircle, Plus, ExternalLink, Code, Edit } from 'lucide-react';

// Mock data
const stats = [
  { label: 'Active Characters', value: '12', subtext: '+3 this month', icon: CheckCircle, color: '#DAA520' },
  { label: 'Conversations', value: '2,847', subtext: '+18% from last week', icon: MessageSquare, color: '#FF8C00' },
  { label: 'Response Quality', value: '94%', subtext: 'Avg. satisfaction', icon: TrendingUp, color: '#B8860B' },
  { label: 'Knowledge Gaps', value: '7', subtext: 'Need attention', icon: AlertCircle, color: '#CD5C5C' },
];

const characters = [
  {
    id: 1,
    name: 'Nike Air Max Guide',
    product: 'Nike Air Max 97',
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    conversations: 342,
  },
  {
    id: 2,
    name: 'iPhone Pro Expert',
    product: 'iPhone 15 Pro',
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1592286927505-c8b8b1a0b9e3?w=400',
    conversations: 891,
  },
  {
    id: 3,
    name: 'Dyson Assistant',
    product: 'Dyson V15 Detect',
    status: 'Processing',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
    conversations: 0,
  },
];

const activities = [
  { type: 'conversation', text: 'Nike Air Max Guide answered a pricing question', time: '5 minutes ago' },
  { type: 'update', text: 'iPhone Pro Expert knowledge base updated', time: '2 hours ago' },
  { type: 'milestone', text: 'Dyson Assistant reached 100 conversations', time: '1 day ago' },
];

export function MerchantDashboard() {
  const userName = 'Alex';
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-[#F5F5DC] mb-2">
          {greeting}, {userName}.
        </h1>
        <p className="text-[#FFDAB9]/70 text-lg">
          Here's what your characters have been up to.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Gradient stroke accent on top */}
              <div 
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
                style={{
                  background: `linear-gradient(90deg, ${stat.color}, #DAA520, #B8860B)`,
                  opacity: 0.5,
                }}
              />
              
              <div className="bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-6 hover:border-[#DAA520]/50 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>
                
                <p className="text-[#FFDAB9]/60 text-sm mb-1">{stat.label}</p>
                <p className="text-[#F5F5DC] text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-[#6A6A6A] text-xs">{stat.subtext}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Gradient Divider */}
      <div 
        className="h-[1px] my-8"
        style={{
          background: 'linear-gradient(90deg, transparent, #FF8C00, #DAA520, #B8860B, #B7410E, transparent)',
          opacity: 0.3,
        }}
      />

      {/* My Characters Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5DC]">My Characters</h2>
          <Link 
            to="/dashboard/characters"
            className="text-[#FF8C00] hover:text-[#B7410E] transition-colors flex items-center gap-2 text-sm font-medium"
          >
            View All
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#2A343C] border border-[#B8860B]/30 rounded-xl overflow-hidden hover:border-[#DAA520]/50 transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Image */}
              <div className="relative h-40 bg-[#1E262E] overflow-hidden">
                <img 
                  src={character.image} 
                  alt={character.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    character.status === 'Live' 
                      ? 'bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520]/40' 
                      : 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/40'
                  }`}>
                    {character.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-[#F5F5DC] font-semibold text-lg mb-1">{character.name}</h3>
                <p className="text-[#FFDAB9]/60 text-sm mb-4">{character.product}</p>
                
                {character.status === 'Live' && (
                  <p className="text-[#6A6A6A] text-xs mb-4">
                    {character.conversations} conversations
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/characters/edit/${character.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1E262E] hover:bg-[#FF8C00]/20 text-[#FFDAB9] hover:text-[#FF8C00] rounded-lg text-sm transition-all border border-[#B8860B]/20"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1E262E] hover:bg-[#DAA520]/20 text-[#FFDAB9] hover:text-[#DAA520] rounded-lg text-sm transition-all border border-[#B8860B]/20">
                    <Code className="w-4 h-4" />
                    Embed
                  </button>
                </div>
              </div>

              {/* Gradient stroke accent on hover */}
              <div 
                className="h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B, #B7410E)',
                }}
              />
            </motion.div>
          ))}

          {/* Create New Card */}
          <Link
            to="/dashboard/characters/new"
            className="bg-[#2A343C] border-2 border-dashed border-[#B8860B]/40 rounded-xl p-6 hover:border-[#FF8C00] hover:bg-[#FF8C00]/5 transition-all duration-300 flex flex-col items-center justify-center min-h-[280px] group"
          >
            <div className="w-16 h-16 rounded-full bg-[#FF8C00]/10 group-hover:bg-[#FF8C00]/20 flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-8 h-8 text-[#FF8C00]" />
            </div>
            <p className="text-[#F5F5DC] font-semibold mb-1">Create New Character</p>
            <p className="text-[#FFDAB9]/60 text-sm text-center">
              Bring another product to life
            </p>
          </Link>
        </div>
      </div>

      {/* Optional Activity Feed */}
      <div className="bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-6">
        <h3 className="text-[#F5F5DC] font-semibold text-lg mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="w-2 h-2 rounded-full bg-[#FF8C00] mt-2" />
              <div className="flex-1">
                <p className="text-[#FFDAB9] text-sm">{activity.text}</p>
                <p className="text-[#6A6A6A] text-xs mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
