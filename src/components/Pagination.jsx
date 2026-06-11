import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({
  currentPage,
  totalPages,
  totalResults,
  limit,
  onPageChange,
  onLimitChange,
}) {
  if (totalPages <= 1 && totalResults === 0) return null;

  const startRange = (currentPage - 1) * limit + 1;
  const endRange = Math.min(currentPage * limit, totalResults);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      if (start === 1) {
        end = maxVisible;
      } else if (end === totalPages) {
        start = totalPages - maxVisible + 1;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-slate-200 rounded-b-2xl">
      {/* Metrics text info */}
      <div className="text-xs font-semibold text-slate-500">
        {totalResults > 0 ? (
          <>
            Showing <span className="font-bold text-slate-800">{startRange}</span> to{' '}
            <span className="font-bold text-slate-800">{endRange}</span> of{' '}
            <span className="font-bold text-slate-800">{totalResults}</span> records
          </>
        ) : (
          'No records found'
        )}
      </div>

      {/* Navigation Buttons and Page Size Selector */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Page Limit Selector */}
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Show</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-650 focus:outline-none focus:border-green-500 focus:bg-white transition"
            >
              {[5, 10, 20, 50].map((val) => (
                <option key={val} value={val}>
                  {val} rows
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Button Group Styling */}
        <div className="inline-flex rounded-xl shadow-sm -space-x-px border border-slate-200 overflow-hidden">
          {/* Previous Page Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3.5 py-2 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-400 transition cursor-pointer"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-4 py-2 text-xs font-bold transition cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-[#4f46e5] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Page Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3.5 py-2 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-400 transition cursor-pointer"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
