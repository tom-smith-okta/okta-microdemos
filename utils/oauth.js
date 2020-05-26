
const request = require('request')

const utils = require(process.env.DEMO_FS_HOME + '/utils/utils.js')

////////////////////////////////////////////////////

module.exports = function(app){

	app.get('/get_admin_content', function (req, res) {

		check_access_token(req, res)
		.then(scopes => get_content('admin', scopes))
		.then(content => {
			res.send(content)
		})
	})

	app.post('/code', function (req, res) {

		console.log("received a post.")

		console.log("the body is:")

		console.dir(req.body)

		console.log("the code is:")

		console.dir(req.body.code)

		var demo_name = req.body.demo_name

		utils.demo_name_is_valid(demo_name)
		.then(demo_name => utils.init_demo(demo_name), demo_name => invalid_url(res, demo_name))
		.then(demo => utils.get_settings(demo))
		.then(settings => {

			var options = {
				'method': 'POST',
				'url': settings.okta_issuer + '/v1/token',
				'headers': {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				form: {
					'grant_type': 'authorization_code',
					'redirect_uri': settings.REDIRECT_URI,
					'code': req.body.code,
					'client_id': settings.okta_client_id,
					'client_secret': process.env[settings.okta_client_id]
				}
			}

			console.dir(options)

			request(options, function (error, response) { 
				if (error) throw new Error(error)
				console.log(response.body)

				var obj = JSON.parse(response.body)

				console.log("the access token is: ")

				console.log(obj.access_token)

				req.session.access_token = obj.access_token

				console.log("the access token in the session is:")

				console.log(req.session.access_token)

				res.send("received access token")
			})
		})
	})
}

async function check_access_token(req, res) {

	if (!(req.session.hasOwnProperty("access_token"))) {
		res.send("no access token")
		return false
	}

	const access_token = req.session.access_token

	if (!(req.query.hasOwnProperty("demo_name"))) {
		res.send("you must provide the demo name in the request.")
		return false
	}

	const demo_name = req.query.demo_name

	if (!(utils.demo_name_is_valid(demo_name))) {
		res.send("sorry, you must provide a valid demo name in the request.")
		return false
	}

	console.log("about to execute the await statement...")

	try {
		const scopes = await access_token_is_valid(access_token, demo_name)
		return scopes
	} catch (err) {
		delete req.session.access_token
		res.send("the access token is not active. Just click on the link again.")
		return false
	}
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

			console.log(row)

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

		if (process.env.hasOwnProperty(username)) {
			password = process.env[username]
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

	return new Promise(function(resolve, reject) {

		var row = ""
		row += "<tr>"
		row += "<td>" + category + "</td>"
		row += "<td>" + settings.demo_name + "</td>"
		row += "<td>" + okta_tenant_link + "</td>"
		row += "<td>" + username + "</td>"
		row += "<td>" + password + "</td>"
		row += "</tr>"

		resolve(row)
	})
}

async function access_token_is_valid(access_token, demo_name) {

	const demo = await utils.init_demo(demo_name)

	const settings = await utils.get_settings(demo)

	return new Promise(function(resolve, reject) {

		var options = {
			'method': 'POST',
			'url': settings.okta_issuer + '/v1/introspect',
			'headers': {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			form: {
				'token': access_token,
				'token_type_hint': 'access_token',
				'client_id': settings.okta_client_id,
				'client_secret': process.env[settings.okta_client_id]
			}
		}

		request(options, function (error, response) { 

			console.log("the result of the call to /introspect is:")

			if (error) {
				console.log("there was an error making the call to /introspect")
				console.dir(error)
				reject(false)
			}

			console.log(response.body)

			var obj = JSON.parse(response.body)

			if (obj.active) {
				console.log("the token is active.")
				resolve(obj.scope)
				// resolve(true)
			}
			else {
				console.log("the token is inactive.")
				reject(false)
			}
		})
	})
}
