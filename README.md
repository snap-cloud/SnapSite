# Snap Social Platform

The social website for the Snap! programming language/environment

# Build System

This site is built by a home-brewed page descriptor system designed to be super simple and save you from copy-pasting any HTML around. Here's how it works:

* The `build.sh` script reads all `.snp` page descriptor files from the `/pages` directory and builds each HTML page accordingly, giving it the same name as the descriptor file.
* Page descriptors define a page by enumerating what templates (chunks of HTML) should compose the page.
* Multiple templates can be concatenated together by placing them in the same line, separated by semicolons.
* Template names in the descriptor file are matched against files under the `/templates` directory.
* Templates are plain HTML files with a `.tmp` extension that may or may not define a `@content` placeholder.
* If said placeholder exists, the templates found in the next line of the descriptor file are going to be rendered into it.
* The generated pages are stored in the `www` folder.
* Only `.html` files with the same name as the descriptor files are going to be overwritten. You can place any other files into `www`, such as Javascript files, images or stylesheets.

## Usage

    ./build [--watch] [--serve]

`--watch` will keep an eye at all files in your project tree and rebuild it if it detects any changes. This makes for a live-reload experience.

`--serve` will attempt to start a webserver on your `www` folder, making your built project accessible at `http://localhost:8080`. For this feature to work you'll need a working installation of either Ruby, Python (2+), PHP or the NodeJS `http-server` module.

## Example

Given the following files:

**pages/test.snp**

    base
    welcome+examples
    example1+example2+example3

**templates/base.tmp**

    <html>
        <head><title>An example page</title></head>
        <body>
            @content
        </body>
    </html>

**templates/welcome.tmp**

    <h1>Welcome to this test site!</h1>
    <p>This is just an example site to show you how the page descriptor system works.</p>

**templates/examples.tmp**

    <div>
        <h2>Here's a couple of embedded templates:</h2>
        @content
    </div>

**templates/example1.tmp**

    <span>First One</span>

**templates/example2.tmp**

    <span>Second One</span>

**templates/example3.tmp**

    <span>Third One</span>

Running `./build.sh` will generate the file:

**www/test.html**

    <html>
        <head><title>An example page</title></head>
        <body>
            <h1>Welcome to this test site!</h1>
            <p>This is just an example site to show you how the page descriptor system works.</p>
            <div>
                <h2>Here's a couple of embedded templates:</h2>
                <span>First One</span>
                <span>Second One</span>
                <span>Third One</span>
            </div>
        </body>
    </html>

# Third Party Packages

* **SnapCloudAPI.js** by [MioSoft](https://www.miosoft.com/)
* **[Font Awesome](fontawesome.io)** by [Dave Gandy](https://github.com/davegandy)
* **[reset.css](http://meyerweb.com/eric/tools/css/reset/)** by [Eric Meyer](http://meyerweb.com/)
* **[pure.css](http://purecss.io)** by [Yahoo!](http://yahoo.com)
* **[custom-alert](https://github.com/PhilippeAssis/custom-alert)** by [Philippe Assis](https://github.com/PhilippeAssis)
* **[FileSaver.js](https://github.com/eligrey/FileSaver.js)** by [Eli Grey](https://github.com/eligrey)
