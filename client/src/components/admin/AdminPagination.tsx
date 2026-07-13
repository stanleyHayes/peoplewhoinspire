import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  disabled?: boolean;
}

const pageSizeOptions = [10, 20, 50, 100];

function getPageNumbers(page: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  return Array.from(pages)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);
}

export default function AdminPagination({
  page,
  totalPages,
  total,
  limit,
  itemLabel,
  onPageChange,
  onLimitChange,
  disabled = false,
}: AdminPaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);
  const start = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const end = Math.min(safePage * limit, total);
  const pageNumbers = getPageNumbers(safePage, safeTotalPages);

  return (
    <div className="flex flex-col gap-4 border-t border-navy-950/10 bg-white px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="text-sm text-gray-500">
        Showing <span className="font-semibold text-navy-900">{start}</span>-
        <span className="font-semibold text-navy-900">{end}</span> of{' '}
        <span className="font-semibold text-navy-900">{total}</span> {itemLabel}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <label className="flex items-center gap-2 text-sm text-gray-500">
          Rows
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            disabled={disabled}
            className="rounded-xl border border-navy-950/10 bg-white px-3 py-2 text-sm font-semibold text-navy-900 outline-none transition-all focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(safePage - 1)}
            disabled={disabled || safePage <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-950/10 bg-white text-gray-500 transition-all hover:border-gold-300 hover:text-navy-950 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <FaChevronLeft className="text-xs" />
          </button>

          {pageNumbers.map((pageNumber, index) => {
            const previous = pageNumbers[index - 1];
            const showGap = previous !== undefined && pageNumber - previous > 1;
            return (
              <div key={pageNumber} className="flex items-center gap-1">
                {showGap && <span className="px-1 text-sm text-gray-400">...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(pageNumber)}
                  disabled={disabled}
                  className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition-all ${
                    pageNumber === safePage
                      ? 'bg-navy-950 text-white'
                      : 'border border-navy-950/10 bg-white text-gray-600 hover:border-gold-300 hover:text-navy-950'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {pageNumber}
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => onPageChange(safePage + 1)}
            disabled={disabled || safePage >= safeTotalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-950/10 bg-white text-gray-500 transition-all hover:border-gold-300 hover:text-navy-950 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <FaChevronRight className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
