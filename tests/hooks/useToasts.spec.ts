import { renderHook, act } from '@testing-library/react-hooks';
import { useToasts } from '../../src/hooks/useToasts';

describe('useToasts', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with empty toasts', () => {
    const { result } = renderHook(() => useToasts());
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should add a toast', () => {
    const { result } = renderHook(() => useToasts());

    act(() => {
      result.current.addToast('Test message', 'success');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: 'Test message',
      type: 'success'
    });
  });

  it('should remove a toast', () => {
    const { result } = renderHook(() => useToasts());

    act(() => {
      result.current.addToast('Test message', 'success');
      const toastId = result.current.toasts[0].id;
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('should automatically remove toasts after duration', () => {
    const { result } = renderHook(() => useToasts());

    act(() => {
      result.current.addToast('Test message', 'success', 2000);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('should handle different toast types', () => {
    const { result } = renderHook(() => useToasts());

    act(() => {
      result.current.addToast('Success message', 'success');
      result.current.addToast('Error message', 'error');
      result.current.addToast('Warning message', 'warning');
      result.current.addToast('Info message', 'info');
    });

    expect(result.current.toasts).toHaveLength(4);
    expect(result.current.toasts[0].type).toBe('success');
    expect(result.current.toasts[1].type).toBe('error');
    expect(result.current.toasts[2].type).toBe('warning');
    expect(result.current.toasts[3].type).toBe('info');
  });

  it('should handle multiple toasts with different durations', () => {
    const { result } = renderHook(() => useToasts());

    act(() => {
      result.current.addToast('Short message', 'success', 1000);
      result.current.addToast('Long message', 'info', 3000);
    });

    expect(result.current.toasts).toHaveLength(2);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Long message');

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });
}); 