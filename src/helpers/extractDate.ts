export function extractDate(msg: string): Date | null {
	const match = msg.match(
		/\b(\d{1,2})\s*(May|June|July)|\b(May|June|July)\s*(\d{1,2})\b/i
	);
	if (match) {
		const day = match[1] || match[4];
		const month = match[2] || match[3];
		const year = new Date().getFullYear();
		const monthIndex = {
			May: 4,
			June: 5,
			July: 6,
		}[month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()];
		const date = new Date(
			Date.UTC(year, monthIndex, parseInt(day), 12, 0, 0, 0)
		);
		return date;
	}
	return null;
}
