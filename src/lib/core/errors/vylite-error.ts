export class VyliteError extends Error {
	readonly code: string;
	readonly context?: Record<string, unknown>;

	constructor(
		message: string,
		code: string,
		options: { cause?: unknown; context?: Record<string, unknown> } = {}
	) {
		super(message, options.cause != null ? { cause: options.cause } : undefined);

		this.name = 'VyliteError';

		this.code = code;
		this.context = options.context;
	}
}
