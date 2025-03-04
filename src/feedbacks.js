import { combineRgb } from '@companion-module/base'

export default async function (self) {
	self.setFeedbackDefinitions({
		xciSnmpTrap: {
			name: 'XCI SNMP Trap',
			type: 'boolean',
			label: 'SNMP Trap from XCI',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'cell',
					type: 'number',
					label: 'Logic Cell',
					default: 1,
					min: 1,
					max: 256,
					range: true,
					step: 1,
					tooltip: 'Refer to Nexus Service for Logic Cell number',
					isVisible: (options) => {
						return !options.useVar
					},
				},
				{
					id: 'cellVar',
					type: 'textinput',
					label: 'Logic Cell',
					default: '',
					useVariables: { local: true },
					tooltip: 'Variable must return an integer between 1 and 256',
					isVisible: (options) => {
						return options.useVar
					},
				},
				{
					id: 'useVar',
					type: 'checkbox',
					label: 'Use Variable',
					default: false,
				},
			],
			callback: async (feedback, context) => {
				const cell = feedback.options.useVar
					? parseInt(await context.parseVariablesInString(feedback.options.cellVar))
					: parseInt(feedback.options.cell)
				if (isNaN(cell) || cell < 1 || cell > 256) {
					self.log('warn', `Invalid Cell! ${cell} from ${feedback.options.cellVar}`)
					return undefined
				}
				return self.logicCell[cell].value
			},
		},
		xciSnmpTrapLatch: {
			name: 'XCI SNMP Trap - Latched',
			type: 'boolean',
			label: 'SNMP Trap from XCI - Latched',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'cell',
					type: 'number',
					label: 'Logic Cell',
					default: 1,
					min: 1,
					max: 256,
					range: true,
					step: 1,
					tooltip: 'Refer to Nexus Service for Logic Cell number',
					isVisible: (options) => {
						return !options.useVar
					},
				},
				{
					id: 'cellVar',
					type: 'textinput',
					label: 'Logic Cell',
					default: '',
					useVariables: { local: true },
					tooltip: 'Variable must return an integer between 1 and 256',
					isVisible: (options) => {
						return options.useVar
					},
				},
				{
					id: 'useVar',
					type: 'checkbox',
					label: 'Use Variable',
					default: false,
				},
			],
			callback: async (feedback, context) => {
				const cell = feedback.options.useVar
					? parseInt(await context.parseVariablesInString(feedback.options.cellVar))
					: parseInt(feedback.options.cell)
				if (isNaN(cell) || cell < 1 || cell > 256) {
					self.log('warn', `Invalid Cell! ${cell} from ${feedback.options.cellVar}`)
					return undefined
				}
				return self.logicCell[cell].latch
			},
		},
	})
}
