// Render the Okta widget
function renderWidget() {
	oktaSignIn.renderEl(
		{ el: '#oktaWidget'},
		function (res) {

			console.log("the result object is: ")

			console.dir(res)

			if (res.status == "SUCCESS") {

				console.log("authentication successful.")
				console.log("user now has an Okta session.")

				console.log("the user is:")
				console.dir(res.user)

				localStorage.setItem("user_display_name", res.user.profile.firstName)

				res.session.setCookieAndRedirect('{{REDIRECT_URI}}')

			}
			else {
				console.log("the user was not authenticated.")
				console.log("the error is: " + res.status)
			}
		}
	)
}
