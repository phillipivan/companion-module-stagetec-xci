const { InstanceBase, runEntrypoint, Regex, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const snmp = require('net-snmp')
const xciLogicOid = '1.3.6.1.4.1.40085.1.1.1.3.2.3.1.2.'
const xciLogicTrue = 2

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
		//this.log('info', JSON.stringify(varbinds, null, 2))
		this.updateStatus(InstanceStatus.Ok, 'Trap Recieved')
		for (let i = 0; i < varbinds.length; i++) {
			if (varbinds[i].value !== undefined) {
				this.log('info', `OID: ${varbinds[i].oid} value: ${varbinds[i].value}`)
				let oid = varbinds[i].oid
				if (oid.startsWith(xciLogicOid)) {
					oid = oid.split('.')
					if (oid.length == 16) {
						let logicCell = parseInt(oid[15])
						let value = varbinds[i].value == xciLogicTrue ? true : false
						if (logicCell >= 1 && logicCell <= 256) {
							this.logicCell[logicCell] = value
							this.log('info', `Logic Cell ${logicCell} set to ${value}`)
							this.checkFeedbacks('xciSnmpTrap')
						} else {
							this.log('warn', `oid out of range: ${oid[15]}`)
						}
					}
				}
				continue
			}
			this.log('info', `OID: ${varbinds[i].oid} has no value field`)
		}
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
		this.logicCell = []
		for (let i = 1; i <= 256; i++) {
			this.logicCell[i] = false
		}
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
