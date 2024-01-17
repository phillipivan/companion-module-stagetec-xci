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
					id: 'ip',
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
				},
				{
					id: 'trap',
					type: 'number',
					label: 'Logic Cell',
					default: 1,
					min: 1,
					max: 256,
					range: true,
					step: 1,
					tooltip: 'Refer to Nexus Service for the Logic Cell number'
				},
			],
			callback: (feedback) => {
				console.log('Hello world!', feedback.options.num)
				if (feedback.options.num > 5) {
					return true
				} else {
					return false
				}
			},
		},
	})
}
