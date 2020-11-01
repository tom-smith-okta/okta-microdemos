
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

	var url = "https://cvsciam20.workflows.oktapreview.com/api/flo/2ea225b63570346ed4406b0f0169fecb/invoke"

	$.post(url, obj)
	.done(function( data ) {
		$("#ui_panel").html("Thank you for signing up for the Health Tracking App!<br>")
	});

	return
}
