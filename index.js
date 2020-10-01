#!/usr/bin/env node

const fs = require('file-system'),
path = require('path'),
{ spawn } = require('child_process'),
getPort = require('get-port');

require('yargs').scriptName("localhost");

require('yargs').command('set [script]', 'Set up site config', (yargs) => {
	yargs.positional('script', {
		describe: 'script to run',
		default: 'npm start'
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

	fs.writeFileSync(path.join(require('os').homedir(), '.localhost/sites', `${config.siteName}.json`), JSON.stringify(config))
	
	console.log(config)
}).argv

require('yargs').command('run [site]', 'Run development site', (yargs) => {
	yargs.positional('site', {
		describe: 'Name of site to start'
	})
}, async (argv) => {
	if(!argv.site) {
		console.log(`Whoops, looks like you forgot the site name. We need to know what site you're running`)
		return
	}

	if(!(fs.existsSync(path.join(require('os').homedir(), '.localhost/sites', `${argv.site}.json`)))) {
		console.log(`Looks like that site doesn't have a config file. Try running localhost set to add the config details`)
		return
	}

	const config = JSON.parse(fs.readFileSync(path.join(require('os').homedir(), '.localhost/sites', `${argv.site}.json`))),
	script = config.script.split(' '),
	[scriptName, ...args] = script,
	env = process.env

	env.PORT = await getPort({port: config.port})
	
	const subprocess = spawn(scriptName, args, {
		cwd: config.path,
		env
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

}).argv

require('yargs').command('tunnel [site]', 'Start Dev site tunnel', (yargs) => {
	yargs.positional('site', {
		describe: 'Name of site to start'
	})
}, async (argv) => {
	if(!argv.site) {
		console.log(`Whoops, looks like you forgot the site name. We need to know what site you're running`)
		return
	}

	if(!(fs.existsSync(path.join(require('os').homedir(), '.localhost/sites', `${argv.site}.json`)))) {
		console.log(`Looks like that site doesn't have a config file. Try running localhost set to add the config details`)
		return
	}

	const config = JSON.parse(fs.readFileSync(path.join(require('os').homedir(), '.localhost/sites', `${argv.site}.json`))),
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

}).argv