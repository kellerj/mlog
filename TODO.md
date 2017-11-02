# TODOs

## Roadmap

### Initial Release (1.0.0)

- [ ] Accept input piped into command and save in appropriate location
- [ ] command line setting for configuration options
    - [x] Storage location
        - [ ] Check if path exists
        - [ ] create directory if not
        - [ ] Create default config file if not exists
    - [ ] options (`mlog option --set <name> <value>`)
        - [ ] show (js-object-pretty-print?, yamprint?)
        - [ ] add (to list option)
        - [ ] set
        - [ ] save to JSON file in target location
- [ ] exit out unless storage location set



### Planned Features

- [ ] Add entry
- [ ] list entries
- [ ] move entry
- [ ] display entry
- [ ] edit entry
- [ ] set Editor command
- [ ] set view command
- [ ] start server
- [ ] generate index files
- [ ] json config file in storage location
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
