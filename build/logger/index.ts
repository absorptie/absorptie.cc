import color from 'picocolors'

export let logger = {
	prefix: 'Notion',
	setPrefix (prefix: string): void {
		logger.prefix = prefix
	}
}

export function log (text: string, context?: string): void {
	let message = `${color.bold(color.cyan(logger.prefix))} ${color.green(text)}`
	if (context) {
		message += ` ${color.gray(context)}`
	}
	console.log(message)
}
