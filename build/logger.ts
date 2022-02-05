import color from 'picocolors'

export function log (text: string, context?: string): void {
	let message = `${color.bold(color.cyan('Notion'))} ${color.green(text)}`
	if (context) {
		message += ` ${color.gray(context)}`
	}
	console.log(message)
}
