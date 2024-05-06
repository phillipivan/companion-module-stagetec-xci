module.exports = function (self) {
	self.setActionDefinitions({
		resetLatch: {
			name: 'Reset Latch',
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
						return !(options.useVar || options.all)
					},
				},
				{
					id: 'cellVar',
					type: 'textinput',
					label: 'Logic Cell',
					useVariables: true,
					tooltip: 'Variable must return an integer between 1 and 256',
					isVisible: (options) => {
						return options.useVar && !options.all
					},
				},
				{
					id: 'useVar',
					type: 'checkbox',
					label: 'Use Variable',
					default: false,
					isVisible: (options) => {
						return !options.all
					},
				},
				{
					id: 'all',
					type: 'checkbox',
					label: 'Reset All',
					default: false,
					isVisible: (options) => {
						return !options.useVar
					},
				},
			],
			callback: async (action) => {
				if (action.options.all && !action.options.useVar) {
					let varList = []
					for (let i = 1; i <= 256; i++) {
						self.latch[i] = false
						varList[`cellLatch_${cell}`] = self.latch[i]
					}
					self.setVariableValues(varList)
					return true
				}
				let cell = action.options.useVar
					? parseInt(await self.parseVarliablesInString(action.options.cellVar))
					: parseInt(action.options.cell)
				if (isNaN(cell) || cell < 1 || cell > 256) {
					self.log('warn', `Invalid Cell! ${cell} from ${action.options.cellVar}`)
					return undefined
				}
				let varList = []
				self.latch[cell] = false
				varList[`cellLatch_${cell}`] = self.latch[cell]
				self.setVariableValues(varList)
			},
		},
	})
}
