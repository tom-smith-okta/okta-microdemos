// Render the Okta widget
function renderWidget() {
	oktaSignIn.renderEl(
		{ el: '#oktaWidget'},
		function (res) {

			console.log("the result object is: ")

			console.dir(res)

			if (res.status == "SUCCESS") {

				oktaSignIn.hide()

				console.log("authentication successful.")
				console.log("user now has an Okta session:")

				for (token_obj of res) {
					if (token_obj.hasOwnProperty("idToken")) {
						oktaSignIn.authClient.tokenManager.add('id_token', token_obj)
						localStorage.setItem("user_display_name", token_obj.claims.name)
					}
					else if (token_obj.hasOwnProperty("accessToken")) {
						oktaSignIn.authClient.tokenManager.add('access_token', token_obj)
					}
				}

				oktaSignIn.authClient.session.get()
				.then(function(session) {
					console.dir(session)
					sessionStorage.setItem('okta_session', JSON.stringify(session))
					update_ui("authenticated")
				})
				.catch(function(err) {
					console.dir(err)
				})
			}
			else {
				console.log("the user was not authenticated.")
				console.log("the error is: " + res.status)
			}
		}
	)
}
