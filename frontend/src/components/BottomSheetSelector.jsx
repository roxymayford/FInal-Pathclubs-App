import React, { useState, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';

export default function BottomSheetSelector({
  isOpen,
  onClose,
  title,
  items = [],
  selectedItems = [],
  onConfirm
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelected, setLocalSelected] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [renderSheet, setRenderSheet] = useState(false);

  // Handle animation states
  useEffect(() => {
    let timeoutId;
    if (isOpen) {
      setRenderSheet(true);
      setLocalSelected([...selectedItems]);
      setSearchQuery('');
      // Small delay to ensure render happens before animation starts
      timeoutId = setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to finish before unmounting
      timeoutId = setTimeout(() => setRenderSheet(false), 300);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen, selectedItems]);

  if (!renderSheet) return null;

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (item) => {
    setLocalSelected(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleConfirm = () => {
    onConfirm(localSelected);
    onClose();
  };

  const overlayClass = `fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${
    isAnimating ? 'opacity-100' : 'opacity-0'
  }`;

  const sheetClass = `fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 flex flex-col transition-transform duration-300 ease-out transform ${
    isAnimating ? 'translate-y-0' : 'translate-y-full'
  }`;

  return (
    <div className="relative z-50">
      {/* Overlay */}
      <div className={overlayClass} onClick={onClose} />

      {/* Bottom Sheet */}
      <div
        className={sheetClass}
        style={{ maxHeight: '75vh', height: '100%' }}
      >
        {/* Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {localSelected.length} dipilih
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={`Cari ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Tidak ada hasil untuk "{searchQuery}"
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredItems.map((item, idx) => {
                const isSelected = localSelected.includes(item);
                return (
                  <li key={idx}>
                    <button
                      onClick={() => toggleSelection(item)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-indigo-50/50 text-indigo-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className={`text-base ${isSelected ? 'font-medium' : ''}`}>
                        {item}
                      </span>
                      {isSelected && (
                        <Check size={20} className="text-indigo-600" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white rounded-b-3xl">
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
