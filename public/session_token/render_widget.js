// Render the Okta widget
function renderWidget() {
	oktaSignIn.renderEl(
		{ el: '#oktaWidget'},
		function (res) {

			console.log("the result object is: ")

			console.dir(res)

			if (res.status == "SUCCESS") {

				$("#oktaWidget").hide()

				console.log("authentication successful.")
				console.log("user now has an Okta session token.")
			}
			else {
				console.log("the user was not authenticated.")
				console.log("the error is: " + res.status)
			}
		}
	)
}
