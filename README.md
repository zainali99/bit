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
- (Updated docs: [docs](docs.html)
## Bit Class Documentation

## Overview
The `Bit` class is an event-driven JavaScript class that provides functionality for file uploads, 
drag-and-drop file management, and UI rendering for file previews. It uses the `EventEmitter` 
pattern to handle events and has built-in support for internationalization (i18n).

## Dependencies
This class extends the `EventEmitter` class, which handles event registration and triggering.

## Constructor

### `Bit(element, options = {})`

#### Parameters:
- **`element`** (*HTMLElement*): The HTML element where the Bit instance will be initialized.
- **`options`** (*Object*): An optional configuration object containing:
  - `upload_url` (*string*): The URL where files will be uploaded.
  - `headers` (*Object*): Custom headers to be sent with the upload request.
  - `maxFiles` (*number*): The maximum number of files that can be uploaded (default is `Infinity`).
  - `friendlyName` (*string*): A friendly name for the instance.
  - `language` (*string*): The language for internationalization.
  - `fallBackLanguage` (*string*): Fallback language if the specified language is not supported.
  - `fallBackAddedFileBlobType` (*string*): Fallback blob type for manually created files.

### Example:
```javascript
const bitInstance = new Bit(document.getElementById('upload-area'), {
    upload_url: 'https://example.com/upload',
    headers: { 'Authorization': 'Bearer token' },
    maxFiles: 10,
    friendlyName: 'My Upload Widget',
    language: 'en'
});
```

## Properties
- `id`: A unique identifier for the Bit instance.
- `version`: The version of the Bit class.
- `files`: An array to store the files that have been added.
- `upload_url`: The URL to which files will be uploaded.
- `headers`: Custom headers for the upload request.
- `element`: The HTML element associated with this Bit instance.
- `max_args_num`: The maximum number of arguments that can be logged (for internal use).
- `mode`: The mode of the Bit instance, can be 'dev' or 'prod'.
- `maxFiles`: Maximum files allowed for upload.
- `friendlyName`: A user-friendly name for the instance.
- `language`: The current language setting.
- `fallBackLanguage`: Fallback language if the specified language is not supported.
- `DOM_IDS`: Object containing DOM element identifiers used within the instance.
- `icons`: Object containing SVG icons used in the UI.
- `i18n_dict`: Object for storing internationalization strings.

## Methods

### `init()`
Initializes the Bit instance by setting up event listeners, applying CSS, and creating a hidden input for file selection.

### `applyBasicCSS()`
Injects basic CSS styles into the document for the UI components of the Bit instance.

### `onFileSelect(e)`
Handles the selection of files through the hidden input.

### `buildPreviews()`
Generates previews for the selected files asynchronously.

### `onDragOver(ev)`
Handles the drag-over event to allow file drops.

### `onDrop(ev)`
Handles the drop event to capture files and add them to the instance.

### `createBitItem(file)`
Creates a UI component for a file and appends it to the Bit element.

### `show_images(file)`
Displays images in the UI. If a file is provided, only that file is displayed; otherwise, all files are shown.

### `getFiles(form_data = false, raise_error = false, uploaded = false)`
Returns a `FormData` object containing the files added to the Bit instance.

#### Parameters:
- `form_data` (*boolean*): If true, returns a `FormData` object; otherwise, returns the files array.
- `raise_error` (*boolean*): If true, throws an error if no files exist.
- `uploaded` (*boolean*): Filters files based on their upload status.

### `upload()`
Uploads the files to the specified `upload_url` using an XMLHttpRequest.

### `addFiles(data)`
Adds files to the Bit instance from an array of data objects.

#### Parameters:
- `data` (*Array*): An array of objects representing files to be added.

### `update(token = "", index = null, obj = {})`
Updates the properties of a file identified by its token or index.

#### Parameters:
- `token` (*string*): The token of the file to update.
- `index` (*number*): The index of the file to update (optional).
- `obj` (*Object*): An object containing updated properties for the file.

## Example Usage of Methods

### Using the upload method
```javascript
bitInstance.upload();
```

### Getting files as FormData
```javascript
const formData = bitInstance.getFiles(true);
```

### Updating a file
```javascript
bitInstance.update('file-token', null, { name: 'New File Name' });

