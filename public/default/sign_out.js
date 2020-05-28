
	function signout() {
		console.log("attempting to sign out...")

		localStorage.clear()
		sessionStorage.clear()

		$.get("/kill_app_session", function(data) {
			$.ajax({
				type: "DELETE",
				dataType: 'json',
				url: "{{okta_tenant}}/api/v1/sessions/me",
				xhrFields: {
					withCredentials: true
				},
				success: function (data) {

					location.reload()
				},
				error: function (textStatus, errorThrown) {
					console.log('error deleting session: ' + JSON.stringify(textStatus))
					console.log(errorThrown)

					setTimeout(function() {
						location.reload()
					}, (5 * 1000))
				},
				async: true
			})
		})
	}
