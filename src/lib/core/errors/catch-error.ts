export async function catchError<T>(
	fn: () => T | Promise<T>
): Promise<[undefined, T] | [unknown, undefined]> {
	return Promise.resolve()
		.then(fn)
		.then((data) => [undefined, data] as [undefined, T])
		.catch((error: unknown) => [error, undefined]);
}
