import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export const Pagination = ({
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderTop: '1px solid var(--border-light)',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '13px',
        color: 'var(--navy-600)',
      }}
    >
      <div>
        Showing <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{startItem}</span> to{' '}
        <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{endItem}</span> of{' '}
        <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{totalElements}</span> results
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          icon={<ChevronLeft size={16} />}
        >
          Previous
        </Button>
        <span style={{ padding: '0 8px', fontWeight: 500 }}>
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          icon={<ChevronRight size={16} />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
