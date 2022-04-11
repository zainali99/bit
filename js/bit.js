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
    constructor(element) {
        super();
        this.id = `bit-${Math.random().toString(16).substring(2)}`;
        this.log(element)
        this.version = "0.1";
        this.author = "Zain Ali";
        this.slogan = "Hobby project :D";
        this.files = [];
        this.element = element;
        this.max_args_num = 5;
        this.mode = 'dev';
        this.max_scan = 1;
        this.init();
        // plugins system
        this.plugins = [];

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
    init() {
        // hello !
        this.on('hello', data => {
            console.log('Hello World !')
        });
        this.emit('hello');

        this.on('onChange', data => {
            this.log(`some change on instance: ${this.id}`,data)
        });
        
        // TODO: create a hidden input 
        // TODO: a
        this.element.addEventListener('change', () => {
            let data = {}
            data.files = this.element.files;
            data.instance_id = this.id;
            
            
            this.emit('onChange',data)
        });

    }



}