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
				let varList = []
				if (action.options.all) {
					for (let i = 1; i <= 256; i++) {
						self.latch[i] = false
						varList[`cellLatch_${i}`] = self.latch[i]
					}
					self.log('debug', 'Resetting all latches')
					self.setVariableValues(varList)
					self.checkFeedbacks('xciSnmpTrapLatch')
					return true
				}
				let cell = action.options.useVar
					? parseInt(await self.parseVariablesInString(action.options.cellVar))
					: parseInt(action.options.cell)
				if (isNaN(cell) || cell < 1 || cell > 256) {
					self.log('warn', `Invalid Cell! ${cell} from ${action.options.cellVar}`)
					return undefined
				}
				self.latch[cell] = false
				self.log('debug', `Resetting latch ${cell}`)
				varList[`cellLatch_${cell}`] = self.latch[cell]
				self.checkFeedbacks('xciSnmpTrapLatch')
				self.setVariableValues(varList)
			},
		},
	})
}
