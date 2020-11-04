
function update_ui_panel(auth_state) {

	if (auth_state != "authenticated") {
		return
	}

	var id_token = localStorage.getItem('okta-token-storage')

	id_token = JSON.parse(id_token)

	var claims = id_token.id_token.claims

	console.dir(id_token.id_token.claims)

	var preferences = {
		"promotions": "It's OK to send me occasional offers",
		"webinars": "I'd like to receive information about learning opportunities",
		"product_updates": "Please let me know when you have new products that might be of interest to me"
	}

	localStorage.setItem('preferences', JSON.stringify(preferences))

	var prefs_html = "<b>Preferences</b><br>"

	prefs_html += '<table class="table table-sm">'

	for (pref in preferences) {

		prefs_html += '<tr>'
		prefs_html += '<td><input type="checkbox" id="' + pref + '" name="' + pref + '" value="' + pref + '"'

		if (claims[pref]) {
			prefs_html += "checked"
		}

		prefs_html += '>'

		prefs_html += '<td><label for="' + pref + '"> ' + preferences[pref] + '</label></td>'

		prefs_html += '</tr>'
	}

	prefs_html += "<tr><td><button onclick = 'evaluate_prefs()'>submit</button></td><td></td></tr>"

	prefs_html += "</table>"

	$("#ui_panel").html(prefs_html)
	$("#ui_panel").show()
}

function evaluate_prefs() {

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

			var kvp = {}

			kvp[pref] = 
			user_obj.prefs[pref] = true
		}
		else {
			user_obj.prefs[pref] = false
		}
	}

	alert(JSON.stringify(user_obj))

	var url = "https://microdemos.workflows.oktapreview.com/api/flo/0240931833c197904f2c1a112b5f90e1/invoke"

	$.post( url, user_obj)
	.done(function( data ) {
		$("#ui_panel").html("Thank you for updating your preferences!<br>")
	});

	// https://microdemos.workflows.oktapreview.com/api/flo/0240931833c197904f2c1a112b5f90e1/invoke
}
