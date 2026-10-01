export function isTextField(target: EventTarget | null): boolean {
	return (
		target instanceof HTMLElement &&
		target.closest('input, textarea, [contenteditable="true"]') !== null
	);
}
