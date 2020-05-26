
function update_ui_panel(auth_state) {

	if (auth_state == "authenticated") {

		const okta_session = sessionStorage.getItem("okta_session")

		const obj = JSON.parse(okta_session)

		const user_id = obj.userId

		console.log("the user id is: " + user_id)

		$.ajax({
			type: "GET",
			dataType: 'json',
			url: "{{okta_tenant}}/api/v1/users/" + user_id + "/appLinks",

			xhrFields: {
				withCredentials: true
			},

			success: function (data) {
				console.log("the user's apps are:")
				console.dir(data)

				var html = ""

				for (app of data) {
					if (app.id == "{{app_id}}") {
						html += "<p><a href = '" + app.linkUrl + "' target = '_blank'>"
						html += app.label + "</a></p>"
					}
				}

				if (html == "") {
					html = "<p>This user does not have access to app id {{app_id}}.</p>"
				}

				$("#ui_panel").html(html)
				$("#ui_panel").show()
			},
			error: function (textStatus, errorThrown) {
				console.log('error retrieving session: ' + JSON.stringify(textStatus))
				console.log(errorThrown)
			},
			async: true
		})
	}
}
