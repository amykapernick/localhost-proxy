// Configure Chai
const chai = require('chai');
//chai.use(require('chai-fs'));

// Configure other modules
const expect = chai.expect,
	{ execSync, spawn } = require("child_process"),
	path = require('path'),
	fs = require("fs"),
	tmp = require('tmp');

function project_fixtures_directory() {
	return path.join(__dirname, 'fixtures', 'project');
}

function run(command) {
	return (stdout = execSync(command, { timeout: 1000 }).toString());
}

function run_in_project(command) {
	return (stdout = execSync(command, { cwd: project_fixtures_directory(), timeout: 2000 }).toString());
}

function read_site_file(path) {
	content = fs.readFileSync(path);
	return JSON.parse(content);
}

describe("localhost", function () {
	it("responds to --help", function () {
		expect(run("localhost --help")).to.contain("localhost <command>\n");
	});

	context("Given a clean project", function () {
		beforeEach(function () {
			tmpDir = tmp.dirSync({ unsafeCleanup: true });
			testSiteDir = tmpDir.name;
		});

		afterEach(function () {
			tmpDir.removeCallback();
		});

		describe("set", function () {
			it("outputs the default site file to STDOUT", function () {
				result = run_in_project(`localhost set \"--sitedir=${testSiteDir}\"`);

				expect(result).to.contain("script: 'npm start'");
				expect(result).to.contain("siteName: 'mysite'");
			});

			it("writes the default site file", function () {
				result = run_in_project(`localhost set \"--sitedir=${testSiteDir}\"`);
				siteFile = read_site_file(path.join(testSiteDir, "mysite.json"));

				expect(siteFile.siteName).to.eq('mysite');
				expect(siteFile.script).to.eq('npm start');
				expect(siteFile.path).to.eq(project_fixtures_directory());
			});

			it("is idempotent", function () {
				result1 = run_in_project(`localhost set \"--sitedir=${testSiteDir}\"`);
				result2 = run_in_project(`localhost set \"--sitedir=${testSiteDir}\"`);
				result3 = run_in_project(`localhost set \"--sitedir=${testSiteDir}\"`);

				expect(result1).to.eq(result2);
				expect(result2).to.eq(result3);
			});

			describe("with a specific script and site", function() {
				it("writes the specified site file", function () {
					result = run_in_project(`localhost set "script001" --site=kronk \"--sitedir=${testSiteDir}\"`);
					siteFile = read_site_file(path.join(testSiteDir, "kronk.json"));

					expect(siteFile.siteName).to.eq('kronk');
					expect(siteFile.script).to.eq('script001');
					expect(siteFile.path).to.eq(project_fixtures_directory());
				});
			});
		})

		describe("run", function () {
			it("runs the specified script", function () {
				run_in_project(`localhost set "npm run index" --site=amy \"--sitedir=${testSiteDir}\"`);
				result = run_in_project(`localhost run --site=amy \"--sitedir=${testSiteDir}\"`);

				expect(result).contain('DEBUG TEST MESSAGE');
				expect(result).contain('INFO TEST MESSAGE');
				expect(result).contain('LOG TEST MESSAGE');
				// WARN and ERROR messages are sent to STDERR and aren't trapped
			});

		})
	})
});
