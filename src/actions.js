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
						self.logicCell[i].latch = false
						varList[`cellLatch_${i}`] = self.logicCell[i].latch
					}
					self.log('debug', 'Resetting all latches')
					self.setVariableValues(varList)
					self.checkFeedbacks('xciSnmpTrapLatch')
					return true
				}
				const cell = action.options.useVar
					? parseInt(await self.parseVariablesInString(action.options.cellVar))
					: parseInt(action.options.cell)
				if (isNaN(cell) || cell < 1 || cell > 256) {
					self.log('warn', `Invalid Cell! ${cell} from ${action.options.cellVar}`)
					return undefined
				}
				self.logicCell[cell].latch = false
				self.log('debug', `Resetting latch ${cell}`)
				varList[`cellLatch_${cell}`] = self.logicCell[cell].latch
				self.checkFeedbacks('xciSnmpTrapLatch')
				self.setVariableValues(varList)
			},
		},
		resetCount: {
			name: 'Reset Count',
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
						self.logicCell[i].count = 0
						varList[`cellCount_${i}`] = self.logicCell[i].count
					}
					self.log('debug', 'Resetting all counts')
					self.setVariableValues(varList)
					return true
				}
				const cell = action.options.useVar
					? parseInt(await self.parseVariablesInString(action.options.cellVar))
					: parseInt(action.options.cell)
				if (isNaN(cell) || cell < 1 || cell > 256) {
					self.log('warn', `Invalid Cell! ${cell} from ${action.options.cellVar}`)
					return undefined
				}
				self.logicCell[cell].count = 0
				self.log('debug', `Resetting count ${cell}`)
				varList[`cellLatch_${cell}`] = self.logicCell[cell].latch
				self.setVariableValues(varList)
			},
		},
	})
}
