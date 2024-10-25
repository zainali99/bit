![image](https://github.com/zainali99/bit/assets/9899154/acffe6be-ee2d-40f7-88d3-138f1a06956c)

# What is bit ?
The Bit class is an event-driven JavaScript class that provides functionality for file uploads, drag-and-drop file management, and UI rendering for file previews. It uses the EventEmitter pattern to handle events and has built-in support for internationalization (i18n).
### TODO before first release 1.0

- [ ] Use web-worker for reading files.
- [ ] basic validation hook
- [ ] improve i18n system
- [ ] read large file faster without crashing browser



# current features:
- [x] drag/drop files
- [x] add additional data (object) to each file to send later with ajax requests. 
- [x] implemented basic i18n support
- [x] basic XHR upload func
- [x] Emit basic hooks: getFiles, etc


# TODO before the next major release:
- [ ] Basic system of plugins

# Documentation
See [docs.html](docs.html)

# Commands available
### run test with:

```
yarn test
```

### launch static server with serve
```
yarn serve
```

### test uploading file with express server
```
yarn start

```








used in euroingro.com
