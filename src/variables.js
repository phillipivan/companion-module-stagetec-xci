export default async function (self) {
	let varDef = []
	for (let i = 1; i <= 256; i++) {
		varDef.push({ variableId: `cellLatch_${i}`, name: `Logic Cell Latch ${i}` })
		varDef.push({ variableId: `cellCount_${i}`, name: `Logic Cell Count ${i}` })
	}
	varDef.push({ variableId: `mostRecent`, name: `Most Recent Trigger` })
	self.setVariableDefinitions(varDef)
}
