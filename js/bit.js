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
    constructor() {
        super();
        this.version = "0.1";
        this.author = "Zain Ali";
        this.slogan = "Hobby project :D";
        this.max_scan = 1;
        this.init();

    }

    show_images(instance_elem, data) {
        var fr = new FileReader();
        fr.onload = function(){
            // TODO: SUPPORT multiple files
            console.log(fr)
            instance_elem.innerHTML +='<div><img class="bit-images" src="' + fr.result + '" />';
            instance_elem.innerHTML +='<p>' +data[0].name +'</p>';
            instance_elem.innerHTML +='<p>' +data[0].type +'</p>';
            instance_elem.innerHTML +='<p>' +data[0].lastModified +'</p></div>';
            console.log(data)
        }
        fr.readAsDataURL(data[0]);
    }
    init() {
        let c = document.querySelectorAll('.bit');
        let i, l;
        //dom list
        var d = [];
        this.on('hello', data => {
            console.log(c)
        });


        this.emit('hello', c);
        this.emit('hello', c);
        this.emit('hello', c);
        var bit = this;
        if (c.length == 0) {
            throw new Error("Can't find the containers for Bit");
        }
        for (i = 0; i < c.length; i++) {
            // limit the loop
            if (i == this.max_scan) {
                console.log("[bit] max scanning instances reached");
                return false;
            } 
            c[i].innerHTML += 'Bit running on...' + document.domain + "<br>running some data test:";
            c[i].innerHTML += this.slogan;
            var file_elem = c[i].querySelector('input[type=file]');
            file_elem.onchange = function(event){
                bit.show_images(this.parentElement,this.files)
            }
            c[i].Bit = this.init;
            d.push(c[i]);
            

        }
    }



}