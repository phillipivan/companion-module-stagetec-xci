## Stagetec Nexus XCI

This module is a reciver for SNMP traps from the Stagetec Nexus XCI card. It does not control the Nexus, it allows boolean feedbacks to be created and used to trigger other events in Companion based on Logic that can be configured in Nexus service.

Each XCI card is capable of 255 logic configurable SNMP traps.

With each feedback created, specify the IP address of the XCI card and the Logic cell number.

### XCI Configuration
Configuring the XCI to trigger SNMP traps requires use of Nexus service.

In the ethernet configuration window select your XCI card and navigate to the SNMP tab.

![Network Configuration](images/xci-network-snmp.PNG)

Ensure SNMP is enabled. Set the community string and the trap number to at least one. One of the destination IPs should be the host IP of the companion computer.

SNMP traps will only be triggered from logic cells according to the settings in "First Cell Number", "Logic Cell Number" and "Logic Trap Number".

Logic configuration to trigger the traps is then done in the Logic section of Nexus Service. 

![Logic Configuration](images/nexus-logic.PNG)

Both the network settings and logic configuration must be uploaded to the nexus system once the respective changes are made.