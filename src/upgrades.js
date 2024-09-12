export default [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	function v100tov110(context, props) {
		const result = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}
		for (const feedback of props.feedbacks) {
			switch (feedback.feedbackId) {
				case 'xciSnmpTrap':
					if (feedback.options.useVar === undefined) {
						feedback.options.useVar = false
						feedback.options.cellVar = ''
						result.updatedFeedbacks.push(feedback)
					}
					break
			}
		}
		return result
	},
]
