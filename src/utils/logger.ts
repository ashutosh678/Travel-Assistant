export const logger = {
	info: (message: string, ...optionalParams: any[]) => {
		console.log(`INFO: ${message}`, ...optionalParams);
	},
	error: (message: string, ...optionalParams: any[]) => {
		console.error(`ERROR: ${message}`, ...optionalParams);
	},
};
