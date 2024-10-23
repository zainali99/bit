/* 
EventEmitter based on: 
https://netbasal.com/javascript-the-magic-behind-event-emitter-cce3abcbcef9
*/
class EventEmitter{constructor(){this.events={}}emit(t,...e){let s=this.events[t];if(s){s.forEach(t=>{t.call(null,...e)});return}this.log("[BIT-0000]: The Event you called:"+t+" doesn't exist anymore, register it with: bit.on()")}on(t,e){this.events[t]||(this.events[t]=[]),this.events[t].push(e)}}

/* Bit created by Zain Ali */
class Bit extends EventEmitter {
    constructor(element, options={}) {
        super();
        this.id = `bit-${this.get_random_key()}`;
        this.version = "0.1";
        this.slogan = "";
        this.files = [];
        this.upload_url = options.upload_url || '';
        this.headers = options.headers || {};
        this.element = element;
        this.max_args_num = 5; // will deprecated
        this.mode = 'dev';
        this.max_scan = 1;
        this.initI18N();
        this.language = this.validateLanguage(options.language)
        this.fallBackLanguage = options.fallBackLanguage
        this.maxFiles = options.maxFiles || Infinity; // Set a default of infinity

        // plugins system
        this.plugins = [];
        this.DOM_IDS = {
            'HIDDEN_INPUT': '#bit__hidden__input',
        };

        this.icons = {
            DELETE_ICON:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>`,
            ARROW_LEFT:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left-circle-fill" viewBox="0 0 16 16">
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"/>
        </svg>`,
            ARROW_RIGHT: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-circle-fill" viewBox="0 0 16 16">
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
          </svg>`

        }

        this.i18n = this.get_i18n_dict()
        for (const key in this.icons) {
            this.i18n[key] = this.icons[key]
        }

        this.element.bit = this;
        this.init();

    }
    initI18N(){
        this.i18n_dict = {
            'en': {
                DRAG_AND_DROP_TEXT: 'Drag/Drop your files for uploading...',
                DELETE_FILE: 'delete',

            },
            'it': {
                DRAG_AND_DROP_TEXT: 'Trascina i files o clicca per caricare...',
                DELETE_FILE: 'cancella',
            }
        }
    }
    validateLanguage(language) {
        if (!this.i18n_dict[language]) {
            console.warn(`[BIT-0001]: Language '${language}' is not supported. Falling back to 'en'.`);
            return this.fallBackLanguage || 'en';
        }
        return language;
    }
    get_random_key() {
        return Math.random().toString(16).substring(2) + new Date().valueOf();
    }
    log() {
        if (this.mode !== 'dev') return;
        for (let i=0;i < arguments.length && arguments.length <= this.max_args_num; i++) {
            console.log('[BIT.JS]:',arguments[i])
        }
    }
    rebuildIndexes() {
        let elems = this.element.querySelectorAll('.bit-core-item')
        elems.forEach((i, index) => {
            i.file.index = index;
            this.updateWithToken(i.file.token, {'sort_order': index})
        });
    }
    createBitItem(file){
        let e = document.createElement('div');
        const file_type = file.type.replace('image/','')
        file.token = `bitimage-${this.get_random_key()}.${file_type}`;
        e.file = file;
        // preload using new Image maybe...
        e.className = "bit-core-item";
        e.innerHTML = `<div class="bit-preview-wrapper" style="background-image:url('${file.src}')">
        <div class="bit-sort-order-elements">
            <div class="bit-sort-order-left">${this.i18n.ARROW_LEFT}</div>
            <div class="bit-sort-order-right">${this.i18n.ARROW_RIGHT}</div>
        </div>
        <button type="button" class="bit-delete-item-btn" data-token="${file.token}">${this.i18n.DELETE_ICON}</button>
        </div>`
        let t=this;
        e.onclick = function(ev) {
            ev.stopPropagation()
            t.emit('bit_item_click', {
                'element': e
            })
        };

        
        e.querySelector('.bit-sort-order-elements .bit-sort-order-left').addEventListener('click', (ev) => {
            ev.stopPropagation();
            let item = ev.currentTarget.closest('.bit-core-item');
            this.emit('sort_left', item)
            let position = item.file.index;
            if (position > 0) {
                t.element.insertBefore(item.previousElementSibling,undefined);
            }
            this.rebuildIndexes();
        });
        e.querySelector('.bit-sort-order-elements .bit-sort-order-right').addEventListener('click', (ev) => {
            ev.stopPropagation();
            let item = ev.currentTarget.closest('.bit-core-item');
            this.emit('sort_right', item)
            if (!item.nextElementSibling) return;
            t.element.insertBefore(item.nextElementSibling,item);
            this.rebuildIndexes();
        });


        e.querySelector('.bit-delete-item-btn').onclick = (ev) => {
            ev.stopPropagation();
            const response = (t.mode != "dev") ? confirm(t.i18n.DELETE_FILE) : true;
            t.emit('delete', e.file, response)
        
            if (response) {
                const index = this.files.findIndex(i => i.token == e.file.token)
                if (index > -1) {
                    this.files.splice(index, 1)
                }
                e.remove()
            } 
            
        }
        this.element.appendChild(e);
        this.rebuildIndexes();

    }
    show_images(file) {
        if (file) {
            // single mode
            this.createBitItem(file);
            file.index = 1; //not important will rebuild it later.
            file.already_parsed= true;
        } else {
            // standard
            this.files.forEach((i, index) => {
                if (i.already_parsed) return;
                this.createBitItem(i)
                i.index = index;
                i.already_parsed = true;
                
            });
        }



    }
    applyBasicCSS() {
        this.element.insertAdjacentHTML('afterend', `
        <style>
        #${this.id} {border:2px dashed;padding:10px;margin:10px}
        #${this.id} .bit-core-item .bit-preview-wrapper {width: 100%;
            height: 60px;cursor:pointer; position:relative;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center center;
        }

        #${this.id} .bit-core-item {min-width: 120px;
            display: inline-block;
            margin: 10px;
            border: 1px solid;

        }
        #${this.id} .bit-sort-order-elements {
            position: absolute;
            top: 20px;
            z-index: 400;
            width: 120px;
            display: flex;
            color: #fff;
        }
        #${this.id} .bit-sort-order-elements div {
            background: rgb(0 0 0 / 70%);
            padding: 5px;
        }
        #${this.id} .bit-sort-order-elements div:active {
            opacity:0.5;
        }
        #${this.id} .bit-sort-order-elements div:nth-child(2) {
            margin-left:auto
        }
        #${this.id} .bit-delete-item-btn {
            bottom: 5px;
            position: absolute;
            left: 46px;
            border-radius: 100%;
            padding: 6px;
            border: 0;
            background: #ff5656;
            z-index:999;
        }
        #${this.id} .bit-delete-item-btn svg {
            fill:#fff;
        }
        </style>
        `);
    }
    get_i18n_dict() {
        // TODO add check key maybe in init.
        return this.i18n_dict[this.language];
    }
    init() {
        
        this.on('onChange', data => {
            this.log(`some change on instance: ${this.id}`,data)
            this.log(...this.getFiles(1))
        });
        this.applyBasicCSS();
        this.element.setAttribute('id', this.id);
        this.element.insertAdjacentHTML('beforeend', `<div>${this.i18n.DRAG_AND_DROP_TEXT}</div>`);
        this.setupHiddenInput();
        this.element.addEventListener('drop', this.onDrop, false)
        this.element.addEventListener('dragover', this.onDragOver, false)


    }
    async onFileSelect(e){
        if (this.files.length + e.target.files.length > this.maxFiles) {
            console.error('Maximum file limit reached.');
            return;
        }
    
        this.files = this.files.concat(...e.target.files)
        this.files.concat(e.target.files);
        // FIXME: memory problems ?!?
        setTimeout(this.buildPreviews,0)

    }

    buildPreviews = () => {
        let promises = [];


        const generateThumbs = async () => {
            let files = this.files.filter(i => !i.src)
            for (var i=0; i<files.length;i++) {
                let file = files[i];
                promises.push(
                    new Promise((resolve) => {
                        let fr = new FileReader();
                        fr.onload = async function() {
                            var res = await fetch(fr.result)
                            res = await res.blob()
                            file.uploaded = false;
                            
                            file.src = URL.createObjectURL(res)
                            resolve(file)
                            
                        };
                        fr.readAsDataURL(file);
                    })
                )
            }
        };
        // TODO: improve this part ?!
        let timer =  setTimeout(async() => {
            generateThumbs();


            
            promises.filter(async (prom) => {
                await prom.then((file) => {
                    this.show_images(file);
                    clearTimeout(timer);
                    // FIXME: call it when all reading finish
                    this.emit('reading_finish')
                })
            })

            // await Promise.all(promises).then(() =>{
            //     this.show_images()
            //     clearTimeout(timer);
            //     this.emit('reading_finish')

            // });
        },0);
    }
    onDragOver(ev) {
        ev.preventDefault();
    }
    onDrop(ev){
        

        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
        
        if (ev.dataTransfer.items) {
          // Use DataTransferItemList interface to access the file(s)
          [...ev.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === 'file') {
              const file = item.getAsFile();
              this.bit.files.push(file)
              
            }
          });
        } else {
          // Use DataTransfer interface to access the file(s)
          [...ev.dataTransfer.files].forEach((file, i) => {
            this.bit.files.push(file);
            
          });
        }
        this.bit.buildPreviews()
    }
    async getThumbnail(file) {
        // const vm = this;
        return new Promise((resolve) =>{
          var fileReader = new FileReader();
          fileReader.onload = function() {
            file.dataURL = fileReader.result;
            resolve({
              'dataUrl':fileReader.result
            })
          }
          fileReader.readAsDataURL(file);
        });
    }
    setupHiddenInput(){

        const elem = document.querySelector(this.DOM_IDS.HIDDEN_INPUT)
        if (elem) {
          elem.remove()
        }
        let i = document.createElement('input');
        i.setAttribute("type", "file");
        i.setAttribute("multiple", "multiple");
        i.setAttribute('accept', 'image/*')
        i.setAttribute('style', 'visibility: hidden; position: absolute; top: 0px; left: 0px; height: 0px; width: 0px;')
        i.setAttribute('id', this.DOM_IDS.HIDDEN_INPUT);
        i.onchange = (e) => {
          this.onFileSelect(e);
        }
        document.body.appendChild(i);

        this.element.addEventListener('click', () => {
            i.click()
        })
        
    }
    updateWithToken(token="",obj={}){
        let update_count = 0;
        this.files.map((f, i) => {
            if (token && f.token == token) {
                if (!f.additional_data) f.additional_data = {};
                f.additional_data = Object.assign(f.additional_data, obj)
                update_count +=1
                return f;
            }
        });
        return update_count;
    }
    update(token="", index=null,obj={}) {
        // not recommended to update with index.
        // TODO: improve performance
        let update_count = 0;
        this.files = this.files.map((f, i) => {
            
            if ((token && f.token == token) || typeof index == "number" && i==index) {
                if (!f.additional_data) f.additional_data = {};
                f.additional_data = Object.assign(f.additional_data, obj)
                update_count +=1
                return f;
            }
        });
        return update_count;
    }
    getFiles(form_data=false, raise_error=false,uploaded=false){
        if (!form_data) {
            return this.files;
        }
        if (!this.files.length && raise_error) {
            throw new Error('no files')
        }
        var fd = new FormData();
        // format key-value
        // each key contain a file information
        let image_data = []
        let files = this.files.filter(i => i.uploaded == uploaded)
        for (var i=0; i<files.length;i++) {
            if (!(files[i] instanceof File)) {
                this.log('no file detected, skipping'); continue;
            }
            image_data.push({
                key: files[i].token,
                ...files[i].additional_data 
            })
            fd.append(files[i].token,files[i])
        }
        fd.append('image_data', JSON.stringify(image_data))
        return fd
    }
    upload() {
        if (!this.upload_url) {
            throw new Error('No upload url setted, create the instance with upload_url setted')
        }
        this.rebuildIndexes();
        let files = this.getFiles(true,true,false);

        let xhr = new XMLHttpRequest();
        xhr.open('POST', this.upload_url);
        for (const key in this.headers) {
            xhr.setRequestHeader(key, this.headers[key])
        }
        xhr.onreadystatechange = () => {
            // In local files, status is 0 upon success in Mozilla Firefox
            if (xhr.readyState === XMLHttpRequest.DONE) {
              const status = xhr.status;
              if (status === 0 || (status >= 200 && status < 400)) {
                // The request has been completed successfully
                
                // change the status of files to already uploaded...
                files = this.getFiles(false,false,false)
                for (var i=0; i < files.length;i++) {
                    files[i].uploaded = true;
                }
              } else {
                // Oh no! There has been an error with the request!
              }
            }
          };

        xhr.send(files);

    }
      

    async addFiles(data) {
        let t = this;
        
        for (var i=0; i < data.length; i++) {
            await fetch(data[i].src)
            .then(function (response) {
                return response.blob()
            })
            .then(function (blob) {
                // here the image is a blob
                blob.name = 'name'+t.get_random_key()
                const f = new File([blob], blob.name);
                delete data[i]['src'];
                f.additional_data = {...data[i]}
                
                t.files.push(f);
            });
        }
        this.buildPreviews()

    }

}
if (typeof module == "object") {
    module.exports = Bit;

}