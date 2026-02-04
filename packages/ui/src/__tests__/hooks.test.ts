import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '../hooks/useDebounce.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated' });

    // Value should still be initial
    expect(result.current).toBe('initial');

    // Fast forward past debounce delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now value should be updated
    expect(result.current).toBe('updated');
  });

  it('resets timer on subsequent changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // First update
    rerender({ value: 'first' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // Second update before timeout
    rerender({ value: 'second' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // Complete the second timer
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('second');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Call multiple times
    result.current('a');
    result.current('b');
    result.current('c');

    // Callback should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    // Fast forward past debounce delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Callback should have been called once with the last value
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('c');
  });

  it('cleans up on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(callback, 500)
    );

    result.current('test');
    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Callback should not have been called after unmount
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('returns stored value when it exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('stored');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });

  it('supports function updater', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('handles complex objects', () => {
    const initialValue = { name: 'John', age: 30 };
    const { result } = renderHook(() => useLocalStorage('user', initialValue));

    expect(result.current[0]).toEqual(initialValue);

    act(() => {
      result.current[1]({ name: 'Jane', age: 25 });
    });

    expect(result.current[0]).toEqual({ name: 'Jane', age: 25 });
  });

  it('handles arrays', () => {
    const { result } = renderHook(() => useLocalStorage('items', ['a', 'b']));

    act(() => {
      result.current[1]((prev) => [...prev, 'c']);
    });

    expect(result.current[0]).toEqual(['a', 'b', 'c']);
  });
});
