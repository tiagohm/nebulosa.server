const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('ja-JP', {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric',
	hour12: false,
})

export function formatDate(date?: Date | number, noDate: string = '') {
	return date ? DATE_TIME_FORMATTER.format(date) : noDate
}
