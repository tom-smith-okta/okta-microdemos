////////////////////////////////////////////////////

const fs = require('fs')

const utils = require(process.env.DEMO_FS_HOME + '/utils/utils.js')

///////////////////////////////////////////////////

module.exports = function(app){

	app.get('/demos', function (req, res) {

		utils.get_valid_demo_names()
		.then(demo_names => {

			var descriptions = ""

			var menu = ""

			for (demo_name of demo_names) {

				var link_to_demo = "<a href = '/" + demo_name + "'>" + demo_name + "</a>"

				get_metadata(demo_name, function(err, metadata) {

					var category = ""

					if (metadata.hasOwnProperty("category")) {
						category = metadata.category
					}

					var short_desc = ""

					if (metadata.hasOwnProperty("short_desc")) {
						short_desc = metadata.short_desc
					}

					menu += "<tr>"

					menu += "<td>" + category + "</td>"

					menu += "<td>" + link_to_demo + "</td>"

					menu += "<td>" + short_desc + "</td>"

					menu += "<td><a href = '#" + demo_name + "'>overview</a></td>"

					menu += "</tr>\n"

					descriptions += "<a name='" + demo_name + "'></a>\n"
					descriptions += "<p><b>demo: " + link_to_demo + "</b></p>"
					descriptions += "<p><b>category</b>: " + category + "</p>"
					descriptions += "<p><b>short desc</b>: " + short_desc + "</p>"

					get_desc(demo_name, function(err, desc) {
						descriptions += desc + "\n"
						descriptions += "<a href = '#top'>back to top</a>\n"
						descriptions += "<hr>\n"
					})
				})
			}

			fs.readFile("html/demos.html", "utf8", (err, page) => {
				if (err) {
					console.log(err)
					res.send("sorry, could not load the file html/demos.html")
					return
				}

				try {
					if (fs.existsSync(process.env.DEMO_FS_HOME + "/public/default/basics.json")) {
						var main_config = require(process.env.DEMO_FS_HOME + "/public/default/basics.json")

						for (setting in main_config) {

							page = page.replace("{{" + setting + "}}", main_config[setting])

						}
					}
				} catch(err) {
					console.error(err)
				}

				page = page.replace("{{menu}}", menu)

				page = page.replace("{{descriptions}}", descriptions)

				res.send(page)
			})
		})
	})
}

function get_desc(dir, callback) {

	var full_path = 'public/' + dir + '/description.html'

	var desc = ""

	try {
		if (fs.existsSync(full_path)) {

			desc = fs.readFileSync(full_path, "utf8")

			return callback(null, desc)
		}
		else {
			return callback(null, "")
		}
	} catch(err) {
		console.error(err)
		return callback(err)
	}
}

function get_metadata(dir, callback) {

	var full_path = 'public/' + dir + '/metadata.json'

	try {
		if (fs.existsSync(full_path)) {

			metadata = fs.readFileSync(full_path, "utf8")

			var json_data = JSON.parse(metadata)

			return callback(null, json_data)
		}
		else {
			return callback(null, "")
		}
	} catch(err) {
		console.error(err)
		return callback(err)
	}
}
