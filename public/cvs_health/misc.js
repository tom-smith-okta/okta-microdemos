
function update_ui_panel(auth_state) {

	if (auth_state != "authenticated") {
		return
	}

	$("#ui_panel").show()
}

function evaluate_prefs() {

	var id_token = localStorage.getItem('okta-token-storage')

	id_token = JSON.parse(id_token)

	var claims = id_token.id_token.claims

	var age = $("#age").val()

	var gender = $("#gender").val()

	var weight = $("#weight").val()

	var hta_consent

	if ($("#hta_consent").is(":checked")) {
		hta_consent = true
	}
	else {
		hta_consent = false
	}

	var obj = {
		age: age,
		gender: gender,
		weight: weight,
		hta_consent: hta_consent,
		user_id: claims.sub,
		email: claims.email
	}

	// var url = "https://microdemos.workflows.oktapreview.com/api/flo/3fdc9eabd0ad5d38657ca68f8b6d0eb5/invoke"

	var url = "https://cvsciam20.workflows.oktapreview.com/api/flo/2ea225b63570346ed4406b0f0169fecb/invoke"

	$.post(url, obj)
	.done(function( data ) {
		$("#ui_panel").html("Thank you for signing up for the Health Tracking App!<br>")
	});

	return

	var id_token = localStorage.getItem('okta-token-storage')

	id_token = JSON.parse(id_token)

	var claims = id_token.id_token.claims

	var user_obj = {
		user_id: claims.sub
	}

	var user_prefs_obj = {}

	user_obj.prefs = {}

	var preferences = localStorage.getItem("preferences")

	preferences = JSON.parse(preferences)

	for (pref in preferences) {
		if ($('#' + pref).is(":checked")) {
			user_obj.prefs[pref] = true
		}
		else {
			user_obj.prefs[pref] = false
		}
	}

	alert(JSON.stringify(user_obj))

	var url = "https://microdemos.workflows.oktapreview.com/api/flo/0240931833c197904f2c1a112b5f90e1/invoke"

	var url = "https://cvsciam20.workflows.oktapreview.com/api/flo/2ea225b63570346ed4406b0f0169fecb/invoke"

https://cvsciam20.workflows.oktapreview.com/api/flo/2ea225b63570346ed4406b0f0169fecb/invoke

	$.post( url, user_obj)
	.done(function( data ) {
		$("#ui_panel").html("Thank you for updating your preferences!<br>")
	});
}
