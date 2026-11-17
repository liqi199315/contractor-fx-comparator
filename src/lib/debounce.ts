export interface DebouncedController {
	schedule: () => void;
	flush: () => boolean;
	cancel: () => void;
	isPending: () => boolean;
}

export function createDebouncedController(
	callback: () => void,
	delayMs = 250,
): DebouncedController {
	let timerId: ReturnType<typeof setTimeout> | null = null;

	return {
		schedule(): void {
			if (timerId !== null) {
				clearTimeout(timerId);
			}
			timerId = setTimeout(() => {
				timerId = null;
				callback();
			}, delayMs);
		},
		flush(): boolean {
			if (timerId === null) {
				return false;
			}
			clearTimeout(timerId);
			timerId = null;
			callback();
			return true;
		},
		cancel(): void {
			if (timerId !== null) {
				clearTimeout(timerId);
				timerId = null;
			}
		},
		isPending(): boolean {
			return timerId !== null;
		},
	};
}
