
// thanks to Smarto Chandra for initial help with this

////////////////////////////////////////////////////

module.exports = function(app){

	app.post('/saml_inline_hook', function (req, res) {

		console.log(JSON.stringify(req.body))

		let commandArray = [
			{
				"op": "add",
				"path": "/claims/https:~1~1aws.amazon.com~1SAML~1Attributes~1Role",
				"value": {
					"attributes": {
						"NameFormat": "urn:oasis:names:tc:SAML:2.0:attrname-format:basic"
					},
					"attributeValues": [
						{
							"attributes": {
								"xsi:type": "xs:string"
							},
							"value": "arn:aws:iam::414400474626:saml-provider/okta-raw-saml-hook,arn:aws:iam::414400474626:role/okta-hooks-user"
						}
					]
				}
			}
		]

		const commands = [
			{
				"type": "com.okta.assertion.patch",
				"value": commandArray
			}
		]

		const responseBody = {
			"commands": commands
		}

		res.status(200).send(responseBody)
	})
}
