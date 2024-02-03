const { InstanceBase, runEntrypoint, Regex, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const snmp = require('net-snmp')

let options = {
	port: 162,
	disableAuthorization: true,
	includeAuthentication: true,
	accessControlModelType: snmp.AccessControlModelType.None,
	engineID: '8000B983800123456789ABCDEF01234567', // where the X's are random hex digits
	address: null,
	transport: 'udp4',
}

let trapCallback = function (error, notification) {
	if (error) {
		this.log('error', error)
		this.updateStatus(InstanceStatus.UnknownError, error)
	} else {
		let trap = notification
		let varbinds = []
		varbinds = trap.pdu.varbinds
		if (trap.rinfo.address !== this.config.host) {
			this.updateStatus(InstanceStatus.UnknownWarning, 'Trap recieved from unexpected IP')
			this.log('error', `Unexpected trap recieved from ${trap.rinfo.address}`)
			return
		}
		if (trap.pdu.community !== this.config.community) {
			this.updateStatus(InstanceStatus.BadConfig, 'Incorrect Community')
			this.log('error', `Expected community ${this.config.community} recieved community ${trap.pdu.community}`)
			return
		}
		if (varbinds === undefined || varbinds === null) {
			this.updateStatus(InstanceStatus.UnknownWarning, 'Trap has no Varbinds')
			this.log('error', `Received trap contains no varbinds`)
			return
		}
		this.log('info', `Varbinds length: ${varbinds.length}`)
		this.log('info', JSON.stringify(varbinds, null, 2))
		this.updateStatus(InstanceStatus.Ok, 'Trap Recieved')
	}
}

class StagetecXCI extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config
		this.snmpReciever = snmp.createReceiver(options, trapCallback.bind(this))
		this.updateStatus(InstanceStatus.Ok, 'Listening')
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
		this.snmpReciever.receiver.close()
		delete this.snmpReciever
	}

	async configUpdated(config) {
		this.config = config
		this.log('debug', `Config Updated. IP: ${this.config.host} Community String: ${this.config.community}`)
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Default IP',
				width: 8,
				regex: Regex.IP,
				tooltip: 'This IP will be used as the default when creating new feedbacks',
			},
			{
				type: 'textinput',
				id: 'community',
				label: 'Community String',
				width: 4,
				regex: Regex.SOMETHING,
				default: 'public',
				tooltip: 'This community string will be used as the default when creating new feedbacks',
			},
		]
	}

	getLogicCell(ip, cell) {
		let logicCell = parseInt(cell)
		let xci = ip.toString()
		if (isNaN(logicCell) || logicCell > 256 || logicCell < 1) {
			this.log('warn', `getLogicCell has been passed an out of range value ${logicCell} ${cell}`)
			return undefined
		}
		if (this.xci[`${xci}`].cell[logicCell] === undefined) {
			this.xci[`${xci}`].cell[logicCell] = false
		}
		return this.xci[`${xci}`].cell[logicCell]
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(StagetecXCI, UpgradeScripts)
