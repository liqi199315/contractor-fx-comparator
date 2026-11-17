import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDebouncedController } from '../src/lib/debounce';

describe('createDebouncedController', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('coalesces rapid schedule calls and fires once after 250ms', () => {
		const spy = vi.fn();
		const debouncer = createDebouncedController(spy, 250);

		debouncer.schedule();
		vi.advanceTimersByTime(100);
		debouncer.schedule();
		vi.advanceTimersByTime(100);
		debouncer.schedule();
		expect(spy).not.toHaveBeenCalled();
		expect(debouncer.isPending()).toBe(true);

		vi.advanceTimersByTime(249);
		expect(spy).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(debouncer.isPending()).toBe(false);
	});

	it('flushes pending work synchronously and prevents duplicate timer execution', () => {
		const spy = vi.fn();
		const debouncer = createDebouncedController(spy, 250);

		expect(debouncer.flush()).toBe(false);

		debouncer.schedule();
		vi.advanceTimersByTime(80);
		expect(debouncer.flush()).toBe(true);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(debouncer.isPending()).toBe(false);

		vi.advanceTimersByTime(300);
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('cancels pending work without invoking the callback', () => {
		const spy = vi.fn();
		const debouncer = createDebouncedController(spy, 250);

		debouncer.schedule();
		expect(debouncer.isPending()).toBe(true);

		debouncer.cancel();
		expect(debouncer.isPending()).toBe(false);

		vi.advanceTimersByTime(500);
		expect(spy).not.toHaveBeenCalled();
	});
});
