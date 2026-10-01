import type { ReportedError } from '$lib/core/errors/reporter';

export type InputMessage = {
	kind: 'error' | 'notice';
	text: string;
	code?: string;
};

export class InputMessages {
	private _message = $state<InputMessage | null>(null);

	get(): InputMessage | null {
		return this._message;
	}

	setError(error: ReportedError): void {
		this._message = { kind: 'error', text: error.message, code: error.code };
	}

	setNotice(text: string): void {
		this._message = { kind: 'notice', text };
	}

	clear(): void {
		this._message = null;
	}
}
