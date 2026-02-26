import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Plus, Edit, Copy, Pause, Trash2, MoreVertical, Search } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const mockCharacters = [
  {
    id: 1,
    name: 'Nike Air Max Guide',
    product: 'Nike Air Max 97',
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    conversations: 342,
    lastActive: '2 hours ago',
  },
  {
    id: 2,
    name: 'iPhone Pro Expert',
    product: 'iPhone 15 Pro',
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1592286927505-c8b8b1a0b9e3?w=400',
    conversations: 891,
    lastActive: '5 minutes ago',
  },
  {
    id: 3,
    name: 'Dyson Assistant',
    product: 'Dyson V15 Detect',
    status: 'Processing',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
    conversations: 0,
    lastActive: 'Never',
  },
  {
    id: 4,
    name: 'Tesla Model Guide',
    product: 'Tesla Model 3',
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400',
    conversations: 567,
    lastActive: '1 day ago',
  },
  {
    id: 5,
    name: 'MacBook Advisor',
    product: 'MacBook Pro M3',
    status: 'Paused',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    conversations: 234,
    lastActive: '3 days ago',
  },
  {
    id: 6,
    name: 'Sony Headphone Helper',
    product: 'Sony WH-1000XM5',
    status: 'Draft',
    image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400',
    conversations: 0,
    lastActive: 'Never',
  },
];

const filters = ['All', 'Live', 'Processing', 'Draft', 'Paused'];

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  Live: { bg: 'bg-[#DAA520]/20', text: 'text-[#DAA520]', border: 'border-[#DAA520]/40' },
  Processing: { bg: 'bg-[#FF8C00]/20', text: 'text-[#FF8C00]', border: 'border-[#FF8C00]/40' },
  Draft: { bg: 'bg-[#6A6A6A]/20', text: 'text-[#B0B0B0]', border: 'border-[#6A6A6A]/40' },
  Paused: { bg: 'bg-[#B8860B]/20', text: 'text-[#B8860B]', border: 'border-[#B8860B]/40' },
};

export function MyCharacters() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharacters = mockCharacters.filter((char) => {
    const matchesFilter = selectedFilter === 'All' || char.status === selectedFilter;
    const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         char.product.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="w-24 h-24 rounded-full bg-[#2A343C] border-2 border-dashed border-[#B8860B]/40 flex items-center justify-center mx-auto mb-6">
        <Plus className="w-12 h-12 text-[#FF8C00]/50" />
      </div>
      <h3 className="text-[#F5F5DC] text-2xl font-bold mb-2">No characters yet</h3>
      <p className="text-[#FFDAB9]/70 mb-6">Create your first character to get started</p>
      <Link
        to="/dashboard/characters/new"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC] font-semibold rounded-full transition-all"
      >
        <Plus className="w-5 h-5" />
        Create Character
      </Link>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#F5F5DC] mb-2">My Guys</h1>
          <p className="text-[#FFDAB9]/70">Manage all your product characters</p>
        </div>
        <Link
          to="/dashboard/characters/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC] font-semibold rounded-full transition-all self-start lg:self-auto"
        >
          <Plus className="w-5 h-5" />
          Create New
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedFilter === filter
                  ? 'bg-gradient-to-r from-[#FF8C00] to-[#B8860B] text-[#F5F5DC]'
                  : 'bg-[#2A343C] text-[#FFDAB9]/70 border border-[#B8860B]/30 hover:border-[#DAA520]/50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6A6A6A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search characters..."
            className="w-full pl-10 pr-4 py-2 bg-[#2A343C] border border-[#B8860B]/30 rounded-full text-[#F5F5DC] placeholder:text-[#6A6A6A] focus:border-[#FF8C00] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Characters Grid */}
      {filteredCharacters.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character, index) => (
            <CharacterCard key={character.id} character={character} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function CharacterCard({ character, index }: any) {
  const statusStyle = statusColors[character.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-[#2A343C] border border-[#B8860B]/30 rounded-xl overflow-hidden hover:border-[#DAA520]/50 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 bg-[#1E262E] overflow-hidden">
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
            {character.status}
          </span>
        </div>

        {/* Menu */}
        <div className="absolute top-3 right-3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="w-8 h-8 rounded-full bg-[#2A343C]/80 backdrop-blur-sm hover:bg-[#1E262E] text-[#FFDAB9] flex items-center justify-center transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[180px] bg-[#2A343C] border border-[#B8860B]/30 rounded-lg p-1 shadow-xl z-50"
                sideOffset={5}
              >
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-[#FFDAB9] hover:bg-[#1E262E] hover:text-[#FF8C00] rounded cursor-pointer outline-none text-sm">
                  <Edit className="w-4 h-4" />
                  Edit
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-[#FFDAB9] hover:bg-[#1E262E] hover:text-[#DAA520] rounded cursor-pointer outline-none text-sm">
                  <Copy className="w-4 h-4" />
                  Duplicate
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-[#FFDAB9] hover:bg-[#1E262E] hover:text-[#B8860B] rounded cursor-pointer outline-none text-sm">
                  <Pause className="w-4 h-4" />
                  Pause
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-[#B8860B]/20 my-1" />
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-[#CD5C5C] hover:bg-[#CD5C5C]/10 rounded cursor-pointer outline-none text-sm">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Gradient stroke accent on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B, #B7410E)',
          }}
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-[#F5F5DC] font-semibold text-lg mb-1">{character.name}</h3>
        <p className="text-[#FFDAB9]/60 text-sm mb-4">{character.product}</p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-[#6A6A6A] mb-4">
          <span>{character.conversations} conversations</span>
          <span>Active {character.lastActive}</span>
        </div>

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
            <Copy className="w-4 h-4" />
            Embed
          </button>
        </div>
      </div>
    </motion.div>
  );
}
