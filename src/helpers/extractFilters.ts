export function extractFilters(userMessage: string): any {
	const filters: any = {};
	const lowerMatch = userMessage.match(/under\s*₹?(\d+)/i);
	const greaterMatch = userMessage.match(/over\s*₹?(\d+)/i);

	if (lowerMatch) {
		filters.price = { ...filters.price, $lte: parseInt(lowerMatch[1]) };
	}
	if (greaterMatch) {
		filters.price = { ...filters.price, $gte: parseInt(greaterMatch[1]) };
	}

	return filters;
}
