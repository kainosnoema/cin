[![build status](https://secure.travis-ci.org/kainosnoema/cin.png)](http://travis-ci.org/kainosnoema/cin)
# Cin

Lightweight, flexible continuous integration server for Git projects, built on [node](http://nodejs.org).

NOTE: In early-stage development, most features unimplemented.

## Installation

    $ npm install -g cin

## Quick Start

Install server

    $ npm install -g cin
    $ cin install ./cin
    $ cd cin

Add a Github project

    $ cin add kainosnoema/transkode

Configure build env and command

    $ cin config transkode.env.NODE_ENV "test"
    $ cin config transkode.command "npm build && make test"

Start the server in the background (not implemented yet)

    $ cin server -p 8080 &

Build project

    $ cin build transkode

See the build status

    $ cin status

## Features

So far:

  - Easy CLI

(in development)

## Todo

Almost everything:

  - Server
  - Repo polling
  - Repo hooks
  - Build hooks
  - JSON API
  - Web UI
  - Tests (yes, I know)

## License

(The MIT License)

Copyright (c) 2012 Evan Owen &lt;kainosnoema@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.