import { VyliteError } from './vylite-error';

export type ReportedError = {
	code: string;
	message: string;
};

export class ErrorReporter {
	report(error: unknown): ReportedError {
		if (error instanceof VyliteError) {
			console.error(`[${error.code}] ${error.message}`, error);
			return { code: error.code, message: error.message };
		}

		console.error(`[UNEXPECTED] ${getDetail(error)}`, error);
		return { code: 'UNEXPECTED', message: 'something went wrong.' };
	}
}

function getDetail(error: unknown): string {
	if (error instanceof Error) return error.message || error.name;
	if (typeof error === 'string' && error.trim()) return error;
	return `non-error thrown: ${String(error)}`;
}
