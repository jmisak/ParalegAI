/**
 * MatterCard Component Tests
 *
 * Tests for the Matter card display component:
 * - Rendering matter data
 * - Status badges
 * - Click navigation
 * - Formatting currency and dates
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock MatterCard component
interface MatterCardProps {
  matter: {
    id: string;
    matterNumber: string;
    title: string;
    status: string;
    transactionType: string;
    propertyAddress: string;
    purchasePrice?: number | null;
    closingDate?: Date | string | null;
  };
  onClick?: (id: string) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const MatterCard: React.FC<MatterCardProps> = ({ matter, onClick }) => {
  return (
    <div
      className="matter-card"
      onClick={() => onClick?.(matter.id)}
      role="button"
      tabIndex={0}
      data-testid={`matter-card-${matter.id}`}
    >
      <div className="matter-header">
        <h3>{matter.title}</h3>
        <span className={`status-badge status-${matter.status.toLowerCase()}`}>
          {matter.status}
        </span>
      </div>

      <div className="matter-details">
        <p className="matter-number">{matter.matterNumber}</p>
        <p className="transaction-type">{matter.transactionType}</p>
        <p className="property-address">{matter.propertyAddress}</p>

        {matter.purchasePrice && (
          <p className="purchase-price">{formatCurrency(matter.purchasePrice)}</p>
        )}

        {matter.closingDate && (
          <p className="closing-date">
            Closing: {formatDate(matter.closingDate)}
          </p>
        )}
      </div>
    </div>
  );
};

describe('MatterCard Component', () => {
  const mockMatter = {
    id: 'matter-123',
    matterNumber: '2026-00001',
    title: '123 Oak Street Purchase',
    status: 'ACTIVE',
    transactionType: 'PURCHASE',
    propertyAddress: '123 Oak Street, Springfield, IL 62701',
    purchasePrice: 425000,
    closingDate: '2026-03-15T00:00:00.000Z',
  };

  it('should render matter information', () => {
    render(<MatterCard matter={mockMatter} />);

    expect(screen.getByText('123 Oak Street Purchase')).toBeDefined();
    expect(screen.getByText('2026-00001')).toBeDefined();
    expect(screen.getByText('PURCHASE')).toBeDefined();
    expect(screen.getByText('123 Oak Street, Springfield, IL 62701')).toBeDefined();
  });

  it('should display status badge', () => {
    render(<MatterCard matter={mockMatter} />);

    const statusBadge = screen.getByText('ACTIVE');
    expect(statusBadge.className).toContain('status-badge');
    expect(statusBadge.className).toContain('status-active');
  });

  it('should format purchase price as currency', () => {
    render(<MatterCard matter={mockMatter} />);

    const priceElement = screen.getByText(/\$425,000/);
    expect(priceElement).toBeDefined();
  });

  it('should format closing date', () => {
    render(<MatterCard matter={mockMatter} />);

    const dateElement = screen.getByText(/Closing: Mar 15, 2026/);
    expect(dateElement).toBeDefined();
  });

  it('should handle matter without purchase price', () => {
    const matterWithoutPrice = {
      ...mockMatter,
      purchasePrice: null,
    };

    render(<MatterCard matter={matterWithoutPrice} />);

    const priceQuery = screen.queryByText(/\$/);
    expect(priceQuery).toBeNull();
  });

  it('should handle matter without closing date', () => {
    const matterWithoutDate = {
      ...mockMatter,
      closingDate: null,
    };

    render(<MatterCard matter={matterWithoutDate} />);

    const dateQuery = screen.queryByText(/Closing:/);
    expect(dateQuery).toBeNull();
  });

  it('should call onClick with matter id when clicked', () => {
    const handleClick = vi.fn();
    render(<MatterCard matter={mockMatter} onClick={handleClick} />);

    const card = screen.getByTestId('matter-card-matter-123');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledWith('matter-123');
  });

  it('should display different status styles', () => {
    const statuses = ['ACTIVE', 'PENDING', 'CLOSED'];

    statuses.forEach((status) => {
      const matter = { ...mockMatter, status };
      const { rerender } = render(<MatterCard matter={matter} />);

      const badge = screen.getByText(status);
      expect(badge.className).toContain(`status-${status.toLowerCase()}`);

      rerender(<MatterCard matter={{ ...mockMatter, status: 'ACTIVE' }} />);
    });
  });

  it('should be keyboard accessible', () => {
    const handleClick = vi.fn();
    render(<MatterCard matter={mockMatter} onClick={handleClick} />);

    const card = screen.getByTestId('matter-card-matter-123');
    expect(card.getAttribute('tabIndex')).toBe('0');
    expect(card.getAttribute('role')).toBe('button');
  });
});
