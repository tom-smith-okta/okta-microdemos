
const request = require('request')

const utils = require(process.env.DEMO_FS_HOME + '/utils/utils.js')

////////////////////////////////////////////////////

module.exports = function(app){
	app.post('/code', function (req, res) {

		console.log("received a post.")

		console.log("the body is:")

		console.dir(req.body)

		console.log("the code is:")

		console.dir(req.body.code)

		console.log("the state is:")

		console.log(req.body.state)

		if (req.body.state != req.session.state) {
			res.send("something strange happened. the state value does not match.")
		}
		else {

			console.log(req.session.state)

			var demo_name = req.body.demo_name

			utils.demo_name_is_valid(demo_name)
			.then(demo_name => utils.init_demo(demo_name), demo_name => invalid_url(res, demo_name))
			.then(demo => utils.get_settings(demo))
			.then(settings => {

				const client_key_name = "client_" + settings.okta_client_id

				const client_secret = process.env[client_key_name]

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
						'client_secret': client_secret
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
		}
	})
}
