# Okta microdemos

This repo contains a number of working examples of Okta identity flows.

The flows can be considered a "known good configuration", if not a reference implementation.

This project is *not* supported by Okta.

# Launching this project

## public web site

If you just want to see the flows in action, or grab some reference HTML, the public version of this site is here:

https://okta-microdemos.herokuapp.com

## github/glitch

To run this project against your own Okta tenant, sign up for a [free-forever Okta tenant](https://developer.okta.com) if you don't have one already.

*   Clone this repo:

    `git clone https://github.com/tom-smith-okta/okta-microdemos`

*   Install the dependencies:

    `npm install`

*   Add your application domain (e.g. http://localhost:3000) as a trusted origin to your Okta tenant:

    https://developer.okta.com/docs/guides/enable-cors/granting-cors/

*   In the file `/public/default/okta_settings.json`, update the value of `okta_tenant`.

*   Copy the file `.env_example` to `.env`

    *   If you are going to use application sessions, update the session secret.

    *   Update the value for REDIRECT_URI_BASE

*   Launch the project:

    `node app.js`

*   In a web browser, open http://localhost:3000

    Click on Login/register.

    Authenticate as yourself or as any other user you've created.

## Extending and customizing

The demos in this project can be customized for your own use-cases and branding, and you can also add new demos.

### The Basics

To add a new demo:

*   Create a folder called `my_demo` in the `public` directory.

*   Restart the node app.

*   In a web browser, open http://localhost:3000/my_demo

    You will see a copy of the "default" demo page. Assuming that you have updated the `/public/okta_settings.json` file with your Okta tenant (as described above), you will be able to authenticate.

All of the required files for a demo are described in `/config/config_files.json`.

If the application does not find a required file in a demo directory, it loads the file from `/public/default`.

So, in the `my_demo` example, the app just loaded all of the required files from `/public/default`.

### Changing the UI elements

You can swap out the basic UI elements of the page using the file `ui_settings.json`. The /fintech demo is an example of using the `ui_settings.json` file to swap out the basic UI elements.

You can add and override css defaults using the file `misc.css`.

You can also completely change/update the UI by changing the (or adding a new) `home.html` file.

The default stylesheet URL is defined in `/public/defaults/basics.json`.

### Inheriting values from other demos

As noted, by default, if a required file is not found in a directory, then the app will use the corresponding file from `/public/default`.

To inherit or extend files from other directories, two keywords are supported: "use" and "extends".

#### keyword "use"
To use a .js file from another directory, create a .js file in your new directory with the name of the file you want to inherit from. The new .js file should consist of a simple json key/value pair: `{"use": "parent"}`.

For an example, look at the `render_widget.js` file in `/public/idp_disco_with_tokens`. This file consists of the json object:

`
{ "use": "implicit_flow" }
`

This directive tells the app to use the render_widget.js file from the "implicit_flow" directory when rendering the "idp_disco_with_tokens" demo.

#### keyword "extends"

To add or override a value from a json object in another directory, create a .json file in your new directory with the name of the file you want to extend. The new .json file should consist of a simple json key/value pair: `{"extends": "parent"}`.

For an example, look at the `widget_config.json` file in `/public/self_reg_widget`. This file consists of the json object:

```
{
	"extends": "default",
	"features": {
		"registration": true
	}
}
```

This directive tells the app to use the widget_config.json file from the "default" directory as a baseline, but add the "features" key and value.

> Note: the "use" and "extends" keywords do not work recursively. You cannot use "use" or "extends" to point at another file that also uses "use" or "extends".

### Tip: use index.html

To get something basic working, or for just hacking around and testing, you can create an index.html file and put it in your demo directory. If the app sees an index.html file in the directory, it will render that file rather than building a page dynamically.

So, for experimentation, you can let the app build a page dynamically, save the source html as index.html, and copy the file to the demo directory. (You can also of course copy the source html from the public demo site.)

### Tip: storing secrets

To store secrets, use a `.env` file.

To store client secrets, I use the convention:

client_0oar121ah8mqWv9Re0h7={client_secret}

in the `.env` file. See the `.env_example` file for an example.

### Tip: OIDC flows and redirect_URIs

By default, the app will use the demo directory as the redirect_uri. For OIDC flows, make sure you add the redirect_uri to your client in Okta. For example, if you create the demo directory /my_demo, then the redirect_uri will automatically be http://localhost:3000/my_demo.

### Application sessions

This project uses `express-session` to manage application sessions.

If you happen to be using dynamodb and want to use that to store sessions:

*   in the `.env` file, change the session_store value to "dynamodb" and add your AWS_SECRET_ACCESS_KEY and AWS_ACCESS_KEY_ID.
