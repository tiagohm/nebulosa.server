export function saveItem(key: string, value: unknown) {
	if (value === undefined || value === null) deleteItem(key)
	else localStorage.setItem(key, JSON.stringify(value))
}

export function getItem<T>(key: string) {
	const value = localStorage.getItem(key)
	if (value === null || value === '' || value === 'undefined') return undefined
	return JSON.parse(value) as T
}

export function getItemOrDefault<T>(key: string, defaultValue: T | (() => T)) {
	return getItem<T>(key) ?? (defaultValue instanceof Function ? defaultValue() : defaultValue)
}

export function deleteItem(key: string) {
	localStorage.removeItem(key)
}

export function hasItem(key: string) {
	return localStorage.getItem(key) !== null
}
