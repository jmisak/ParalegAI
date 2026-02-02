import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatterCard } from '../components/legal/MatterCard.js';

describe('MatterCard', () => {
  const defaultProps = {
    id: '1',
    referenceNumber: 'MTR-2024-001',
    title: '123 Main Street, Springfield',
    type: 'purchase' as const,
    status: 'in-progress' as const,
  };

  it('renders correctly with required props', () => {
    render(<MatterCard {...defaultProps} />);

    expect(screen.getByText('MTR-2024-001')).toBeInTheDocument();
    expect(screen.getByText('123 Main Street, Springfield')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Purchase')).toBeInTheDocument();
  });

  it('displays closing date correctly', () => {
    const closingDate = new Date('2024-03-15');
    render(<MatterCard {...defaultProps} closingDate={closingDate} />);

    expect(screen.getByText('Mar 15, 2024')).toBeInTheDocument();
  });

  it('shows days remaining until closing', () => {
    // Set closing date to 5 days from now
    const closingDate = new Date();
    closingDate.setDate(closingDate.getDate() + 5);

    render(<MatterCard {...defaultProps} closingDate={closingDate} />);

    expect(screen.getByText('5 days')).toBeInTheDocument();
  });

  it('shows "Today" when closing is today', () => {
    const closingDate = new Date();
    closingDate.setHours(23, 59, 59);

    render(<MatterCard {...defaultProps} closingDate={closingDate} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('displays document and task counts', () => {
    render(
      <MatterCard
        {...defaultProps}
        documentCount={12}
        taskCount={8}
        completedTasks={5}
      />
    );

    expect(screen.getByText('12 docs')).toBeInTheDocument();
    expect(screen.getByText('8 tasks')).toBeInTheDocument();
    expect(screen.getByText('5/8 tasks')).toBeInTheDocument();
  });

  it('displays progress bar based on completed tasks', () => {
    render(
      <MatterCard
        {...defaultProps}
        taskCount={10}
        completedTasks={5}
      />
    );

    // Progress should be 50%
    const progressBar = document.querySelector('[style*="width: 50%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('displays parties with avatars', () => {
    const parties = [
      { id: '1', name: 'John Doe', role: 'buyer' as const },
      { id: '2', name: 'Jane Smith', role: 'seller' as const },
    ];

    render(<MatterCard {...defaultProps} parties={parties} />);

    // Should show avatar fallback initials
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('shows +X indicator for many parties', () => {
    const parties = [
      { id: '1', name: 'Person One', role: 'buyer' as const },
      { id: '2', name: 'Person Two', role: 'seller' as const },
      { id: '3', name: 'Person Three', role: 'lender' as const },
      { id: '4', name: 'Person Four', role: 'attorney' as const },
      { id: '5', name: 'Person Five', role: 'title' as const },
      { id: '6', name: 'Person Six', role: 'agent' as const },
    ];

    render(<MatterCard {...defaultProps} parties={parties} />);

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MatterCard {...defaultProps} onClick={handleClick} />);

    const card = screen.getByRole('button', { name: /Matter MTR-2024-001/ });
    await user.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is keyboard accessible when clickable', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MatterCard {...defaultProps} onClick={handleClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct status badge variants', () => {
    const statuses = [
      { status: 'pending' as const, label: 'Pending' },
      { status: 'in-progress' as const, label: 'In Progress' },
      { status: 'review' as const, label: 'Under Review' },
      { status: 'approved' as const, label: 'Approved' },
      { status: 'completed' as const, label: 'Completed' },
      { status: 'on-hold' as const, label: 'On Hold' },
    ];

    statuses.forEach(({ status, label }) => {
      const { unmount } = render(
        <MatterCard {...defaultProps} status={status} />
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies correct type badges', () => {
    const types = ['purchase', 'sale', 'refinance', 'commercial', 'residential'] as const;

    types.forEach((type) => {
      const { unmount } = render(<MatterCard {...defaultProps} type={type} />);
      // Type label should be capitalized
      expect(
        screen.getByText(type.charAt(0).toUpperCase() + type.slice(1))
      ).toBeInTheDocument();
      unmount();
    });
  });
});
