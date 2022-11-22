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
        throw new ReferenceError('[BIT-0000]: The Event you called:' + eventName + ' doesn\'t exist anymore, register it with: bit.on()');
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
        this.id = `bit-${Math.random().toString(16).substring(2)}`;
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
            },
            'it': {
                DRAG_AND_DROP_TEXT: '',
            }
        }

        this.i18n = this.get_i18n_dict()  
        this.element.bit = this;
        this.init();

    }
    log() {
        if (this.mode !== 'dev') return;
        for (let i=0;i < arguments.length && arguments.length <= this.max_args_num; i++) {
            console.log('[BIT.JS]:',arguments[i])
        }
    }
    show_images() {
        console.log(this.files)
        let h = "";
        this.files.forEach(i => {
            h +=`<img width="100" src="${i.src}" />`;
        });
        this.element.innerHTML = h;
    }
    applyBasicCSS() {
        this.element.insertAdjacentHTML('afterend', `
        <style>
        #${this.id} {border:2px dashed;padding:10px;margin:10px}
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
        let promises = [];
        for (var i=0; i<this.files.length;i++) {
            let file = this.files[i];
            promises.push(
                new Promise((resolve) => {
                    let fr = new FileReader();
                    fr.onload = function() {
                        file.src = fr.result;
                        resolve();
                    };
                    fr.readAsDataURL(file);
                })
            )
        }
        await Promise.all(promises).then(() => {
            this.show_images()

        });
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
        this.bit.show_images(this, this.bit.files)
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



}