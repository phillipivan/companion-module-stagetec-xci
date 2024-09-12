import { InstanceBase, runEntrypoint, Regex, InstanceStatus } from '@companion-module/base'
import UpgradeScripts from './upgrades.js'
import UpdateActions from './actions.js'
import UpdateFeedbacks from './feedbacks.js'
import UpdateVariableDefinitions from './variables.js'
import snmp from 'net-snmp'
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
		this.log('error', JSON.stringify(error))
		this.updateStatus(InstanceStatus.UnknownError, JSON.stringify(error))
	} else {
		const trap = notification
		let varbinds = []
		varbinds = trap.pdu.varbinds
		if (trap.rinfo.address !== this.config.host) {
			this.updateStatus(InstanceStatus.UnknownWarning, 'Trap recieved from unexpected IP')
			this.log('error', `Unexpected trap recieved from ${trap.rinfo.address}`)
			return
		}
		if (trap.pdu.community !== this.config.community) {
			this.updateStatus(InstanceStatus.BadConfig, 'Incorrect Community')
			this.log('error', `Expected community: ${this.config.community} Recieved community: ${trap.pdu.community}`)
			return
		}
		if (varbinds === undefined || varbinds === null) {
			this.updateStatus(InstanceStatus.UnknownWarning, 'Trap has no Varbinds')
			this.log('error', `Received trap contains no varbinds`)
			return
		}
		this.updateStatus(InstanceStatus.Ok, 'Trap Recieved')
		for (let i = 0; i < varbinds.length; i++) {
			if (varbinds[i].value !== undefined) {
				let oid = varbinds[i].oid
				if (oid.startsWith(xciLogicOid)) {
					oid = oid.split('.')
					if (oid.length == 16) {
						const logicCell = parseInt(oid[15])
						const value = varbinds[i].value == xciLogicTrue ? true : false
						if (logicCell >= 1 && logicCell <= 256) {
							this.logicCell[logicCell].value = value
							this.log('info', `Logic Cell ${logicCell} set to ${value}`)
							let feedbacksToCheck = ['xciSnmpTrap']
							if (value) {
								let varList = []
								this.mostRecent = logicCell
								this.logicCell[logicCell].latch = value
								this.logicCell[logicCell].count += 1
								varList['mostRecent'] = this.mostRecent
								varList[`cellLatch_${logicCell}`] = value
								varList[`cellCount_${logicCell}`] = this.logicCell[logicCell].count
								this.setVariableValues(varList)
								feedbacksToCheck.push('xciSnmpTrapLatch')
							}
							this.checkFeedbacks(...feedbacksToCheck)
						} else {
							this.log('debug', `OID out of range: ${varbinds[i].oid}, raw value: ${varbinds[i].value}`)
						}
					}
				}
				continue
			}
			this.log('warn', `OID: ${varbinds[i].oid} has no value field`)
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
		if (this.config.host === undefined || this.config.host === '') {
			this.updateStatus(InstanceStatus.BadConfig)
			this.log('error', 'Invalid config - missing IP')
		} else {
			this.updateStatus(InstanceStatus.Ok, 'Listening')
		}
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.resetVariables()
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
		this.snmpReciever.receiver.close()
		delete this.snmpReciever
	}

	async resetVariables() {
		let varList = []
		this.logicCell = []
		for (let i = 1; i <= 256; i++) {
			this.logicCell[i] = {
				value: false,
				latch: false,
				count: 0,
			}
			varList[`cellLatch_${i}`] = this.logicCell[i].latch
			varList[`cellCount_${i}`] = this.logicCell[i].count
		}
		this.mostRecent = 0
		varList['mostRecent'] = this.mostRecent
		this.setVariableValues(varList)
		this.checkFeedbacks('xciSnmpTrap')
	}

	async configUpdated(config) {
		this.config = config
		this.log('debug', `Config Updated. IP: ${this.config.host} Community String: ${this.config.community}`)
		if (this.config.host === undefined || this.config.host === '') {
			this.updateStatus(InstanceStatus.BadConfig)
			this.log('error', 'Invalid config - missing IP')
		} else {
			this.updateStatus(InstanceStatus.Ok, 'Listening')
		}
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.resetVariables()
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'XCI IP',
				width: 8,
				regex: Regex.IP,
				tooltip: 'The IP of the Nexus XCI',
			},
			{
				type: 'textinput',
				id: 'community',
				label: 'Community String',
				width: 4,
				regex: Regex.SOMETHING,
				default: 'public',
				tooltip: 'The configured community string',
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
