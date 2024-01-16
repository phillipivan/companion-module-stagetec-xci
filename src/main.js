const { InstanceBase, runEntrypoint, Regex, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const snmp = require ("net-snmp")

let options = {
    port: 162,
    disableAuthorization: true,
    includeAuthentication: true,
    accessControlModelType: snmp.AccessControlModelType.None,
    engineID: "8000B983800123456789ABCDEF01234567", // where the X's are random hex digits
    address: null,
    transport: "udp4"
};
/* 
var callback = function (error, notification) {
    if ( error ) {
        console.error (error);
    } else {
        console.log (JSON.stringify(notification, null, 2));
    }
}; */

class StagetecXCI extends InstanceBase {
	constructor(internal) {
		super(internal)
	}


	callback (error, notification) {
		if ( error ) {
			console.error (error);
		} else {
			console.log ( JSON.stringify(notification, null, 2));
		}
	}
	
	async init(config) {
		this.config = config
		this.snmpReciever = snmp.createReceiver (options, this.callback);
		this.updateStatus(InstanceStatus.Ok)
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
		this.snmpReciever.receiver.close ()
	}

	async configUpdated(config) {
		this.config = config
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
/* 			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				regex: Regex.PORT,
			}, */
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
