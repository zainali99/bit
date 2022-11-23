/* 
EventEmitter based on: 
https://netbasal.com/javascript-the-magic-behind-event-emitter-cce3abcbcef9
*/
class EventEmitter {
    constructor() {
        this.events = {};
    }
    //trigger the event and delete from the array
    emit(eventName, data) {
        let event = this.events[eventName];
        if (event) {
            event.forEach(fn => {
                fn.call(null, data);
            });
            return;
        }
       
        this.log('[BIT-0000]: The Event you called:' + eventName + ' doesn\'t exist anymore, register it with: bit.on()');
    }
    //register the events
    on(eventName, fn) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(fn);
    }
}


/* Bit created by Zain Ali */
class Bit extends EventEmitter {
    constructor(element, options={}) {
        super();
        this.id = `bit-${this.get_random_key()}`;
        this.log(element)
        this.version = "0.1";
        this.slogan = "";
        this.files = [];
        this.element = element;
        this.max_args_num = 5; // will deprecated
        this.mode = 'dev';
        this.max_scan = 1;
        this.language = options.language || 'en';
        // plugins system
        this.plugins = [];
        this.DOM_IDS = {
            'HIDDEN_INPUT': '#bit__hidden__input',
        };
        this.i18n_dict = {
            'en': {
                DRAG_AND_DROP_TEXT: 'Drag/Drop your files for uploading...',
                DELETE_FILE: 'delete'
            },
            'it': {
                DRAG_AND_DROP_TEXT: '',
                DELETE_FILE: 'cancella',

            }
        }

        this.i18n = this.get_i18n_dict()  
        this.element.bit = this;
        this.init();

    }
    get_random_key() {
        return Math.random().toString(16).substring(2)
    }
    log() {
        if (this.mode !== 'dev') return;
        for (let i=0;i < arguments.length && arguments.length <= this.max_args_num; i++) {
            console.log('[BIT.JS]:',arguments[i])
        }
    }
    createBitItem(file){
        let e = document.createElement('div');
        // check collission
        file.token = `${this.get_random_key()}-${this.get_random_key()}`;
        e.file = file;
        // preload using new Image maybe...
        e.className = "bit-core-item";
        e.innerHTML = `<div class="bit-preview-wrapper" style="background-image:url('${file.src}')">
        <button type="button" class="bit-delete-item-btn" data-token="${file.token}">${this.i18n.DELETE_FILE}</button>
        </div>`
        let t=this;
        e.onclick = function(ev) {
            ev.stopPropagation()
            t.emit('bit_item_click', {
                'element': e
            })
        };
        e.querySelector('.bit-delete-item-btn').onclick = function(ev) {
            ev.stopPropagation();
            console.log(ev.target.parentNode)
            ev.target.parentNode.remove()
        }
        this.element.appendChild(e)

    }
    show_images() {
        console.log(this.files)
        this.files.forEach(i => {
            if (i.already_parsed) return;
            this.createBitItem(i)
            i.already_parsed = true;
        });
    }
    applyBasicCSS() {
        this.element.insertAdjacentHTML('afterend', `
        <style>
        #${this.id} {border:2px dashed;padding:10px;margin:10px}
        #${this.id} .bit-core-item .bit-preview-wrapper {width: 100%;
            height: 60px;cursor:pointer;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center center;
        }

        #${this.id} .bit-core-item {min-width: 120px;
            display: inline-block;
            margin: 10px;
            border: 1px solid;

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
        this.log(this.i18n)
        this.element.insertAdjacentHTML('beforeend', `<div>${this.i18n.DRAG_AND_DROP_TEXT}</div>`);
        this.setupHiddenInput();
        this.element.addEventListener('drop', this.onDrop, false)
        this.element.addEventListener('dragover', this.onDragOver, false)


    }
    async onFileSelect(e){
        console.log(e.target.files)
        this.files = this.files.concat(...e.target.files)
        this.files.concat(e.target.files);
        this.buildPreviews()

    }

    buildPreviews = () => {
        console.log('called ')
        let promises = [];

        const generateThumbs = async () => {
            console.log(this.files)
            for (var i=0; i<this.files.length;i++) {
                let file = this.files[i];
                console.log(file, typeof file)
                promises.push(
                    new Promise((resolve) => {
                        let fr = new FileReader();
                        fr.onload = async function() {
                            var res = await fetch(fr.result)
                            res = await res.blob()
                            console.log(res)
                            file.src = URL.createObjectURL(res)
                            resolve()
                            
                        };
                        fr.readAsDataURL(file);
                    })
                )
            }
        };
        // TODO: improve this part ?!
        let timer =  setTimeout(async() => {
            generateThumbs();
            await Promise.all(promises).then(() =>{
                this.show_images()
                clearTimeout(timer);
                this.emit('onChange')
            });
        },50);
    }
    onDragOver(ev) {
        ev.preventDefault();
    }
    onDrop(ev){
        console.log('File(s) dropped');

        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
        console.log('test',this.bit.version)
        if (ev.dataTransfer.items) {
          // Use DataTransferItemList interface to access the file(s)
          [...ev.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === 'file') {
              const file = item.getAsFile();
              this.bit.files.push(file)
              console.log(`… file[${i}].name = ${file.name}`);
            }
          });
        } else {
          // Use DataTransfer interface to access the file(s)
          [...ev.dataTransfer.files].forEach((file, i) => {
            this.bit.files.push(file);
            console.log(`… file[${i}].name = ${file.name}`);
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
    update(token="", index=null,obj={}) {
        // not recommended to update with index.
        // TODO: improve performance
        let update_count = 0;
        this.files = this.files.map((f, i) => {
            console.log(f, i)
            if ((token && f.token == token) || typeof index == "number" && i==index) {
                if (!f.additional_data) f.additional_data = {};
                f.additional_data = Object.assign(f.additional_data, obj)
                update_count +=1
                return f;
            }
        });
        return update_count;
    }
    getFiles(form_data=false){
        if (!form_data) {
            return this.files;
        }
        var fd = new FormData();
        // format key-value
        // each key contain a file information
        let image_data = []
        // let ins = this;
        console.log(this.files)
        for (var i=0; i<this.files.length;i++) {
            if (!(this.files[i] instanceof File)) this.log('no file skipping'); continue;
            image_data.push({
                key: this.files[i].token,
                ...this.files[i].additional_data 
            })
            fd.append(this.files[i].token,this.files[i])
        }
        fd.append('image_data', JSON.stringify(image_data))
        return fd
    }
      



}