#!/usr/bin/env node

const fs = require('file-system'),
path = require('path'),
{ spawn } = require('child_process'),
getPort = require('get-port');

function defaultSiteDir() {
	return path.join(require('os').homedir(), '.localhost/sites');
}

const isWindows = process.platform === "win32";

require('yargs')
	.scriptName("localhost")
	.command('set [script] [site]', 'Set up site config', (yargs) => {
		yargs
			.positional('script', {
				describe: 'script to run',
				default: 'npm start'
			})
			.positional("site", {
				describe: "Name of the site to configure",
				default: "mysite",
				type: "string",
			})
			.option('sitedir', {
				describe: 'Directory where site configuration information is stored',
				default: defaultSiteDir(),
				type: 'string'
			})
	}, (argv) => {
		let config = {
			path: process.cwd(),
			script: false,
			siteName: 'mysite'
		}

		if(argv.script) {
			config.script = argv.script
		}

		if(argv.site) {
			config.siteName = argv.site
		}

		if(argv.port) {
			config.port = argv.port
		}
		fs.writeFileSync(path.join(argv.sitedir, `${config.siteName}.json`), JSON.stringify(config))

		console.log(config)
	})
	.command('run [site]', 'Run development site', (yargs) => {
		// TODO: If site is required, then shouldn't it be a required yarg parameter? i.e. <site>
		yargs
			.positional('site', {
				describe: 'Name of site to start'
			})
			.option('sitedir', {
				describe: 'Directory where site configuration information is stored',
				default: defaultSiteDir(),
				type: 'string'
			})
	}, async (argv) => {
		if(!argv.site) {
			console.log(`Whoops, looks like you forgot the site name. We need to know what site you're running`)
			return
		}

		const siteFile = path.join(argv.sitedir, `${argv.site}.json`);
		if(!(fs.existsSync(siteFile))) {
			console.log(`Looks like that site doesn't have a config file. Try running localhost set to add the config details`)
			return
		}

		const config = JSON.parse(fs.readFileSync(siteFile)),
		script = config.script.split(' '),
		[scriptName, ...args] = script,
		env = process.env

		env.PORT = await getPort({port: config.port})

		const subprocess = spawn(scriptName, args, {
			cwd: config.path,
			env,
			// Use a shell on Windows as npm and node may be batch files
			shell: isWindows
		})

		subprocess.on('error', (err) => {
			console.error(err)
		})

		subprocess.stdout.on('data', (data) => {
			console.log(data.toString());
		});

		subprocess.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
		});
	})
	.command('tunnel [site]', 'Start Dev site tunnel', (yargs) => {
		// TODO: If site is required, then shouldn't it be a required yarg parameter? i.e. <site>
		yargs
			.positional('site', {
				describe: 'Name of site to start'
			})
			.option('sitedir', {
				describe: 'Directory where site configuration information is stored',
				default: defaultSiteDir(),
				type: 'string'
			})
	}, async (argv) => {
		if(!argv.site) {
			console.log(`Whoops, looks like you forgot the site name. We need to know what site you're running`)
			return
		}

		const siteFile = path.join(argv.sitedir, `${argv.site}.json`);
		if(!(fs.existsSync(siteFile))) {
			console.log(`Looks like that site doesn't have a config file. Try running localhost set to add the config details`)
			return
		}

		const config = JSON.parse(fs.readFileSync(siteFile)),
		port = config.port

		const subprocess = spawn("tunnelto", ['--port', port, '--subdomain', argv.site], {
			cwd: config.path
		})

		subprocess.on('error', (err) => {
			console.error(err)
		})

		subprocess.stdout.on('data', (data) => {
			console.log(data.toString());
		});

		subprocess.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
		});
	})
	.demandCommand(1, "You need at least one command")
	.help()
	.argv;
