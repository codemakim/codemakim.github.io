"use client";

interface SortOptionsProps {
  sortOrder: 'desc' | 'asc';
  onSortChange: (order: 'desc' | 'asc') => void;
}

export default function SortOptions({ sortOrder, onSortChange }: SortOptionsProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onSortChange('desc')}
        className={`${
          sortOrder === 'desc' ? 'btn-primary' : 'tag'
        } px-4 py-2 text-sm font-medium`}
      >
        <span className="flex items-center gap-2">
          최신순
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <button
        onClick={() => onSortChange('asc')}
        className={`${
          sortOrder === 'asc' ? 'btn-primary' : 'tag'
        } px-4 py-2 text-sm font-medium`}
      >
        <span className="flex items-center gap-2">
          오래된순
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </span>
      </button>
    </div>
  );
}

