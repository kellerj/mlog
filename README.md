# Markdown Log

[![Build Status](https://travis-ci.org/kellerj/mlog.svg?branch=master)](https://travis-ci.org/kellerj/mlog) [![Coverage Status](https://coveralls.io/repos/github/kellerj/mlog/badge.svg?branch=master)](https://coveralls.io/github/kellerj/mlog?branch=master)

Attempting to replace Day One as my logging storage system.  The goal here is to be able to pipe in a markdown log for the day and have it stored by note category and date on the file system.

Then generate index files in the parent directories which allow linking between the files in a markdown viewer which handled links.

Future development would include running a local HTTP server which performs on-the-fly conversion of the MD files into HTML files for viewing in a browser.  Also the possibility of creating and editing the files for a given date using your Markdown editor of choice.

## Installing

In the project directory, run:

    npm install
    npm link

to install the tool on your path.

## Requirements

* Node 8+

## Usage

### Initialize a New Logbook Location

    mlog init <directory>
    
### Configure Options

**TBD**

### Add a Log entry

Pass the file contents wanted in via stdin either via a pipe or redirection.

    cat <file> | mlog

**TBD - more options and parameters**