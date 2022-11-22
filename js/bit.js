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
        this.author = "Zain Ali";
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
            'HIDDEN_INPUT': '#@bit__hidden__input',
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


        

        this.init();

    }
    log() {
        if (this.mode !== 'dev') return;
        for (let i=0;i < arguments.length && arguments.length <= this.max_args_num; i++) {
            console.log('[BIT.JS]:',arguments[i])
        }
    }
    show_images(instance_elem, data) {
        var fr = new FileReader();
        fr.onload = function(){
            let html = '';
            for (var i=0; i<data.length;i++) {
                let file = data[i];
                html += '<div class="bit-filename">'+file.name+'</div>'
            }
            instance_elem.innerHTML += html;
        }
        fr.readAsDataURL(data[0]);
    }
    applyBasicCSS() {
        this.element.insertAdjacentHTML('beforeend', `
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
                

        // TODO: create a hidden input 
        this.element.addEventListener('change', () => {
            let data = {}
            data.files = this.element.files;
            data.instance_id = this.id;
            this.emit('onChange',data)
        });

    }
    onFileSelect(){

    }
    setupHiddenInput(){

        const elem = this.$refs.muWrapper.querySelector(this.DOM_IDS.HIDDEN_INPUT)
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
        
      }



}