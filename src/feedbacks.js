const { combineRgb } = require('@companion-module/base')

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
			callback: (feedback) => {
				return self.logicCell[feedback.options.cell]
			},
		},
	})
}
