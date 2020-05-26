
const fs = require('fs')

const request = require('request')

////////////////////////////////////////////////////

const config_files = require(process.env.DEMO_FS_HOME + "/config/config_files.json")

////////////////////////////////////////////////////

module.exports = {

	access_token_is_valid: async function(access_token, demo_name) {

		const demo = await module.exports.init_demo(demo_name)

		const settings = await module.exports.get_settings(demo)

		const client_key_name = "client_" + settings.okta_client_id

		const client_secret = process.env[client_key_name]

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
					'client_secret': client_secret
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
				}
				else {
					console.log("the token is inactive.")
					reject("the access token is inactive.")
				}
			})
		})
	},

	// checks validity of access token
	// if access token exists & is valid, function returns scopes
	check_access_token: async function (req, res) {

		if (!(req.session.hasOwnProperty("access_token"))) {
			throw new Error("no access token in the app session")
		}

		const access_token = req.session.access_token

		if (!(req.query.hasOwnProperty("demo_name"))) {
			throw new Error("you must provide the demo name in the request.")
		}

		const demo_name = req.query.demo_name

		if (!(module.exports.demo_name_is_valid(demo_name))) {
			throw new Error("sorry, you must provide a valid demo name in the request.")
		}

		try {
			const scopes = await module.exports.access_token_is_valid(access_token, demo_name)
			return scopes
		} catch (err) {
			delete req.session.access_token
			throw new Error("the access token is not active. Just click on the link again.")
		}
	},

	demo_name_is_valid: function(demo_name) {

		return new Promise(function(resolve, reject) {

			module.exports.get_valid_demo_names()
			.then(demo_names => {
				if (demo_names.includes(demo_name)) {
					resolve(demo_name)
				}
				else {
					reject(false)
				}
			}, err => {
				reject(err)
			})
		})
	},

	generate_state_val: function() {

		const length_of_state_token = 8

		var state_token = ""

		return new Promise(function(resolve, reject) {
			const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

			const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

			const valid_chars = letters.concat(numbers)

			for (i = 0; i < length_of_state_token; i++) {

				var index = Math.floor(Math.random() * valid_chars.length)

				state_token += valid_chars[index]
			}

			resolve(state_token)
		})
	},

	get_path: function(setting_name, settings, demo_dir, demo_name, callback) {

		var local_dir_path = demo_dir + '/' + settings.file_name

		try {
			if (fs.existsSync(local_dir_path)) {

				if (settings.resource_type == "local_webserver_path") {
					return callback(null, '/' + demo_name + '/' + settings.file_name)
				}
				else {
					return callback(null, local_dir_path)
				}
			}
			else if (settings.required) {

				var dir

				if (settings.resource_type == "local_webserver_path") {
					dir = process.env.default_web_home
				}
				else {
					dir = process.env.default_fs_dir
				}

				return callback(null, dir + '/' + settings.file_name)
			}
			else {
				return callback(null, "")
			}
		} catch(err) {
			console.error(err)
			return callback(err)
		}
	},

	get_settings: function(demo) {

		return new Promise(function(resolve, reject) {

			module.exports.set_paths(demo)
			.then(demo => module.exports.set_values(demo))
			.then(demo => module.exports.set_settings(demo))
			.then(settings => {
				resolve(settings)
			})
		})
	},

	get_valid_demo_names: function () {

		return new Promise(function(resolve, reject) {

			var demo_names = []

			var list_of_items = fs.readdirSync('public')

			for (item of list_of_items) {

				var stats = fs.statSync('public/' + item)

				if (stats.isDirectory()) {

					demo_names.push(item)
				}
			}
			resolve(demo_names)
		})
	},

	get_value: function(path_name, path_val, callback) {

		if (config_files[path_name].resource_type != 'local_webserver_path') {

			var contents = fs.readFileSync(path_val, "utf8")

			var obj = tryParseJSON(contents)

			if (obj) {
				if (obj.hasOwnProperty("use")) {
					var target = fs.readFileSync(process.env.DEMO_FS_HOME + "/public/" + obj.use + "/" + config_files[path_name].file_name, "utf8")

						return callback(null, target)
				}

				if (obj.hasOwnProperty("extends")) {
					var parent = fs.readFileSync(process.env.DEMO_FS_HOME + "/public/" + obj.extends + "/" + config_files[path_name].file_name, "utf8")

					var parent_obj = JSON.parse(parent)

					for (setting in obj) {
						if (setting != "extends") {
							parent_obj[setting] = obj[setting]
						}
					}
					return callback(null, JSON.stringify(parent_obj))
				}
			}

			return callback(null, contents)
		}
		else {
			return callback(null, path_val)
		}
	},

	init_demo: function(demo_name) {

		return new Promise(function(resolve, reject) {
			resolve({demo_name: demo_name})
		})
	},

	invalid_url: function(res, demo_name) {

		var response = "sorry, could not find a demo with the name " + demo_name

		response += "<br><a href = '/'>home</a>"

		res.send(response)
	},

	set_paths: function(demo) {

		var paths = {}

		demo_name = demo.demo_name

		return new Promise(function(resolve, reject) {

			const this_demo_dir = process.env.DEMO_FS_HOME + '/public/' + demo_name

			for (file in config_files) {

				module.exports.get_path(file, config_files[file], this_demo_dir, demo_name, function(err, path) {
					if (path != "") {
						paths[file] = path
					}
				})
			}

			demo.this_demo_dir = this_demo_dir
			demo.paths = paths
			resolve(demo)
		})
	},

	set_settings: function(demo) {

		var settings = {}

		return new Promise(function(resolve, reject) {

			for (item in demo.values) {

				if (config_files[item].resource_type == "settings") {

					var obj = JSON.parse(demo.values[item])

					for (setting in obj) {
						settings[setting] = obj[setting]
					}
				}
				else {
					settings[item] = demo.values[item]
				}
			}

			settings.REDIRECT_URI = process.env.REDIRECT_URI_BASE + "/" + demo.demo_name

			settings.demo_name = demo_name

			resolve(settings)
		})
	},

	set_values: function(demo) {

		var values = {}

		var paths = demo.paths

		return new Promise(function(resolve, reject) {

			for (path in paths) {
				module.exports.get_value(path, paths[path], function(err, value) {
					values[path] = value
				})
			}

			demo.values = values
			resolve(demo)
		})
	}
}

function tryParseJSON (jsonString){

    try {
        var o = JSON.parse(jsonString);

        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) { }

    return false;
}