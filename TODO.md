# TODOs

## Roadmap

### Initial Release (1.0.0)

- [x] Accept input piped into command and save in appropriate location
- [x] command line setting for configuration options
    - [x] Storage location
        - [x] Check if path exists
        - [x] create directory if not
        - [x] Create default config file if not exists
    - [x] options (`mlog option --set <name> <value>`)
        - [x] show (js-object-pretty-print?, yamprint?)
        - [x] add (to list option)
        - [x] set
        - [x] save to JSON file in target location
- [x] exit out unless storage location set
- [x] mlog-open command to open the mlogDirectory
- [x] generate index files
    - [x] Per category indexes
    - [x] list of categories
- [x] json config file in storage location

### Planned Features

- [ ] Prevent duplicate category addition
- [ ] Add entry (via editor)
- [ ] list entries in category with date range
- [ ] move entry
- [ ] display entry - with option to render to HTML and open in browser
- [ ] edit entry
- [ ] set Editor command
- [ ] set view command
- [ ] local HTTP server with rendered contents
- [ ] if more than one on a day - merge?  option to not merge? (--no-append)
- [ ] entry encryption (for when entry file stored on cloud service like dropbox)
    - [ ] option on per-entry basis or globally
    - [ ] storage of key in home dir config file
    - [ ] use of JSON storage of object when encrypted?
        - [ ] metadata like title and date in wrapper
        - [ ] base-64-encoded content?
- [ ] Move the umask to the logbook config file and set when pulling the config
    - [ ] Also set the umask on the config file when changing the value
    - [ ] Verify that there is no mask on the user bits

## Notes

#### Config File

```json
{
    "categories": [
        "Work Log",
        "Weekly Summary"
    ],
    "defaultCategory" : "Work Log",
    "fileNameFormat" : "YYYY-MM-DD",
    "title" : "Logbook"
}
```
