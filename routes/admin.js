
const request = require('request')

const utils = require(process.env.DEMO_FS_HOME + '/utils/utils.js')

////////////////////////////////////////////////////

module.exports = function(app){

	app.get('/get_admin_content', function (req, res, next) {

		utils.check_access_token(req, res)
		.then(scopes => get_content('admin', scopes))
		.then(content => {
			res.send(content)
		})
		.catch(error => {

			console.log(error.message)

			if (error.message == "no access token in the app session") {

				utils.generate_state_val()
				.then(state_val => {

					req.session.state = state_val

					res.send({
						state: state_val,
						message: error.message
					})
				})
			}
			else {
				res.send(error.message)
			}
		})
	})
}

async function get_content(page, scopes) {

	if (page == 'admin') {

		if (!(scopes.includes("okta_se"))) {
			return "sorry, you don't have sufficient privileges for that."
		}

		const demo_names = await utils.get_valid_demo_names()

		console.dir(demo_names)

		rows = ""

		for (let index = 0; index < demo_names.length; index++) {
			const demo_name = demo_names[index]

			var demo = await utils.init_demo(demo_name)

			var settings = await utils.get_settings(demo)

			row = await get_demo_row(settings)

			rows += row

			if (index == demo_names.length - 1) {
				return rows
			}
		}
	}
}

function get_demo_row(settings) {

	const demo_name = settings.demo_name

	const widget_config = JSON.parse(settings.widget_config)

	const no_sample_users = ["self_reg_widget", "admin"]

	var username = ""

	var password = ""

	if (!(no_sample_users.includes(demo_name))) {
		if (widget_config.hasOwnProperty("username")) {
			username = widget_config.username
		}
		else {
			username = process.env.default_username
		}

		var short_username = username

		if (username.includes("@")) {
			const a = username.split("@")
			short_username = a[0]
		}

		if (process.env.hasOwnProperty(short_username)) {
			password = process.env[short_username]
		}
	}

	var category = ""

	if (settings.hasOwnProperty("category")) {
		category = settings.category
	}

	var okta_tenant_link = settings.okta_tenant

	if (settings.hasOwnProperty("oktaprise_ids")) {

		if (settings.oktaprise_ids.hasOwnProperty("okta_tenant")) {

			var url = settings.okta_tenant + "/sso/idps/" + settings.oktaprise_ids.okta_tenant

			okta_tenant_link = "<a href ='" + url + "' target='_blank'>" + settings.okta_tenant + "</a>"
		}
	}

	if (settings.hasOwnProperty("external_idp")) {

		url = settings.external_idp + "/sso/idps/" + settings.external_idp_oktaprise_id

		okta_tenant_link += "<br><a href ='" + url + "' target='_blank'>" + settings.external_idp + "</a>"
	}

	return new Promise(function(resolve, reject) {

		var row = ""
		row += "<tr>"
		row += "<td>" + category + "</td>"
		row += "<td><a href='/" + settings.demo_name + "'>" + settings.demo_name + "</a></td>"
		row += "<td>" + okta_tenant_link + "</td>"
		row += "<td>" + username + "</td>"
		row += "<td>" + password + "</td>"
		row += "</tr>"

		resolve(row)
	})
}
