# Local server proxy

**In Progress - This is currently being built**

This package can be used to start local servers and proxy the URLs to a local TLD (eg. `.wip`)

## To Install
* Clone repo and install packages
* Run `npm link` and `yarn link` to make command available globally

## To Use
### Setup Site Config
This command must be run from your project folder
`localhost set "{script/start command}"`
eg. `localhost set "npm start"`

#### Options
- `--site={site_name}`: name of the site, currently defaults to `mysite`
- `--port={port}`: define a default port to use (otherwise randomly generates one and sets it as the `$PORT` env variable)

### Start Server
`localhost run {site_name}`
eg. `localhost run mysite`


## Progress
This is in the process of being built, it's being built over a series of Twitch streams <https://www.twitch.tv/amyskapers>

### To Do
* [x] Setup script to take parameters and save config for a project
* [x] Setup script to start a local server
* [x] Setup script to start a local server from saved config
* [x] Setup script to auto-generate a port number if not preset
* [ ] When starting local server, proxy `localhost:{port}` url to `{site_name}.test`
* [ ] Add config to allow changing of local TLD, eg. `.test`, `.local`, `.wip` etc
* [ ] Integrate with [tunnelto.dev](https://tunnelto.dev) to allow automatically starting a live URL with the local server
* [ ] Add config for tunnelto, to specify a custom subdomain to use with a site
* [ ] Integrate with ngrok as well as tunnelto
* [ ] Add self-signed SSL certificates
* [ ] Ensure this works cross platform (currently being built and working in WSL2 on Windows)