import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Guru } from '../../types';
import { UserAvatar } from './UserAvatar';

export interface SearchablePembinaOption {
  id: string;
  namaLengkap: string;
  nip?: string;
  username?: string;
  spesialisasi?: string;
  avatarUrl?: string;
}

export interface SearchablePembinaSelectProps {
  value: string;
  onChange: (id: string) => void;
  options: SearchablePembinaOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

export const SearchablePembinaSelect: React.FC<SearchablePembinaSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih Guru / Pembina Terdaftar...',
  searchPlaceholder = 'Ketik nama guru, NIP, atau eskul...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedPembina = useMemo(() => {
    return options.find((p) => p.id === value);
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return options;
    return options.filter((p) => {
      const matchName = p.namaLengkap.toLowerCase().includes(q);
      const matchNip = p.nip ? p.nip.toLowerCase().includes(q) : false;
      const matchSpecialization = p.spesialisasi ? p.spesialisasi.toLowerCase().includes(q) : false;
      const matchUsername = p.username ? p.username.toLowerCase().includes(q) : false;
      return matchName || matchNip || matchSpecialization || matchUsername;
    });
  }, [options, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full p-2.5 bg-slate-50 border rounded-md text-xs flex items-center justify-between gap-2 transition-all cursor-pointer text-left ${
          isOpen
            ? 'border-[#00B884] ring-2 ring-[#00B884]/20 bg-white'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedPembina ? (
            <>
              <UserAvatar
                name={selectedPembina.namaLengkap}
                className="size-6 text-[10px] shrink-0 ring-1 ring-slate-200 shadow-2xs"
              />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-slate-800 truncate block">
                  {selectedPembina.namaLengkap}
                </span>
                {selectedPembina.spesialisasi && (
                  <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                    {selectedPembina.spesialisasi}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#00B884]' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-72"
          >
            {/* Search Input Bar */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70 relative flex items-center gap-2">
              <Search className="size-3.5 text-slate-400 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-50">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((p) => {
                  const isSelected = p.id === value;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelect(p.id)}
                      className={`p-2 rounded-md flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-950 font-semibold'
                          : 'hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <UserAvatar
                          name={p.namaLengkap}
                          className="size-7 text-[10px] shrink-0 ring-1 ring-slate-200 shadow-2xs"
                        />
                        <div className="min-w-0 flex-1 text-left">
                          <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                            <span>{p.namaLengkap}</span>
                            {p.nip && (
                              <span className="text-[10px] font-normal text-slate-400">
                                ({p.nip})
                              </span>
                            )}
                          </div>
                          {p.spesialisasi && (
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              {p.spesialisasi}
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="size-4 text-[#00B884] shrink-0" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-6 px-4 text-center text-slate-400 text-xs">
                  <User className="size-6 mx-auto text-slate-300 mb-1.5" />
                  <p className="font-medium text-slate-600">Tidak ada guru/pembina ditemukan</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Coba kata kunci pencarian lain
                  </p>
                </div>
              )}
            </div>

            {/* Dropdown Footer Stats */}
            <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Menampilkan {filteredOptions.length} dari {options.length} guru/pembina</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[#00B884] hover:underline cursor-pointer"
                >
                  Reset filter
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
