# TODOs

## Roadmap

### Initial Release (1.0.0)

- [x] Accept input piped into command and save in appropriate location
- [ ] command line setting for configuration options
    - [x] Storage location
        - [x] Check if path exists
        - [x] create directory if not
        - [x] Create default config file if not exists
    - [ ] options (`mlog option --set <name> <value>`)
        - [ ] show (js-object-pretty-print?, yamprint?)
        - [ ] add (to list option)
        - [ ] set
        - [ ] save to JSON file in target location
- [x] exit out unless storage location set
- [ ] mlog-open command to open the mlogDirectory
- [ ] generate index files
    - [x] Per category indexes
    - [ ] list of categories
- [x] json config file in storage location

### Planned Features

- [ ] Add entry (via editor)
- [ ] list entries in category with date range
- [ ] move entry
- [ ] display entry - with option to render to HTML and open in browser
- [ ] edit entry
- [ ] set Editor command
- [ ] set view command
- [ ] local HTTP server with rendered contents
- [ ] if more than one on a day - merge?  option to not merge? (--no-append)

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
