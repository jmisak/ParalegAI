import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DeadlineAlert,
  calculateUrgency,
  formatTimeRemaining,
} from '../components/legal/DeadlineAlert.js';

describe('DeadlineAlert', () => {
  it('renders correctly with required props', () => {
    const deadline = new Date('2024-12-31');
    render(<DeadlineAlert deadline={deadline} label="Closing Date" />);

    expect(screen.getByText('Closing Date')).toBeInTheDocument();
    expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument();
  });

  it('displays time remaining', () => {
    // Set deadline to 7 days from now
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);

    render(<DeadlineAlert deadline={deadline} label="Due Date" showTimeRemaining />);

    expect(screen.getByText(/7 days remaining/i)).toBeInTheDocument();
  });

  it('hides time remaining when showTimeRemaining is false', () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);

    render(
      <DeadlineAlert
        deadline={deadline}
        label="Due Date"
        showTimeRemaining={false}
      />
    );

    expect(screen.queryByText(/remaining/i)).not.toBeInTheDocument();
  });

  it('shows completed state with line-through', () => {
    const deadline = new Date('2024-01-01');
    render(<DeadlineAlert deadline={deadline} label="Past Due" completed />);

    const alert = screen.getByText('Past Due').closest('div');
    expect(alert).toHaveClass('line-through');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <DeadlineAlert
        deadline={new Date('2024-12-31')}
        label="Click Me"
        onClick={handleClick}
      />
    );

    await user.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct size classes', () => {
    const deadline = new Date('2024-12-31');

    const { rerender } = render(
      <DeadlineAlert deadline={deadline} label="Small" size="sm" />
    );
    expect(screen.getByText('Small').closest('div')).toHaveClass('text-xs');

    rerender(<DeadlineAlert deadline={deadline} label="Medium" size="md" />);
    expect(screen.getByText('Medium').closest('div')).toHaveClass('text-sm');

    rerender(<DeadlineAlert deadline={deadline} label="Large" size="lg" />);
    expect(screen.getByText('Large').closest('div')).toHaveClass('text-base');
  });

  it('allows urgency override', () => {
    // Even with a far deadline, should show critical if overridden
    const farDeadline = new Date();
    farDeadline.setMonth(farDeadline.getMonth() + 6);

    render(
      <DeadlineAlert
        deadline={farDeadline}
        label="Urgent Override"
        urgency="critical"
      />
    );

    const alert = screen.getByText('Urgent Override').closest('div');
    expect(alert).toHaveClass('border-red-200');
  });
});

describe('calculateUrgency', () => {
  it('returns "passed" when completed', () => {
    const deadline = new Date();
    expect(calculateUrgency(deadline, true)).toBe('passed');
  });

  it('returns "critical" for past deadlines', () => {
    const pastDeadline = new Date();
    pastDeadline.setDate(pastDeadline.getDate() - 1);
    expect(calculateUrgency(pastDeadline, false)).toBe('critical');
  });

  it('returns "critical" for deadlines within 1 day', () => {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 12);
    expect(calculateUrgency(deadline, false)).toBe('critical');
  });

  it('returns "high" for deadlines within 3 days', () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 2);
    expect(calculateUrgency(deadline, false)).toBe('high');
  });

  it('returns "medium" for deadlines within 7 days', () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);
    expect(calculateUrgency(deadline, false)).toBe('medium');
  });

  it('returns "low" for deadlines beyond 7 days', () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);
    expect(calculateUrgency(deadline, false)).toBe('low');
  });
});

describe('formatTimeRemaining', () => {
  it('formats overdue dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    expect(formatTimeRemaining(pastDate)).toBe('3 days overdue');
  });

  it('formats hours remaining', () => {
    const date = new Date();
    date.setHours(date.getHours() + 5);
    expect(formatTimeRemaining(date)).toBe('5 hours remaining');
  });

  it('formats days remaining', () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    expect(formatTimeRemaining(date)).toBe('3 days remaining');
  });

  it('formats weeks remaining', () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    expect(formatTimeRemaining(date)).toBe('2 weeks remaining');
  });

  it('formats months remaining', () => {
    const date = new Date();
    date.setDate(date.getDate() + 60);
    expect(formatTimeRemaining(date)).toBe('2 months remaining');
  });
});
