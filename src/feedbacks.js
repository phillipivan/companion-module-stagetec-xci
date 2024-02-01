const { combineRgb, Regex } = require('@companion-module/base')

module.exports = async function (self) {
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
					id: 'xci',
					type: 'textinput',
					label: 'XCI IP',
					default: self.config.host,
					regex: Regex.IP,
				},
				{
					id: 'community',
					type: 'textinput',
					label: 'Community String',
					default: self.config.community,
					regex: Regex.SOMETHING,
					tooltip: 'Only used during initialisation',
				},
				{
					id: 'cell',
					type: 'number',
					label: 'Logic Cell',
					default: 1,
					min: 1,
					max: 256,
					range: true,
					step: 1,
					tooltip: 'Refer to Nexus Service for the Logic Cell number',
				},
			],
			callback: async (feedback) => {
				return await self.getLogicCell(feedback.options.xci, feedback.options.cell)
			},
			subscribe: (feedback) => {
				//self.getLogicCell(feedback.options.xci, feedback.options.cell)
			},
		},
	})
}
