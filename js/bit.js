/* 
EventEmitter based on: 
https://netbasal.com/javascript-the-magic-behind-event-emitter-cce3abcbcef9
*/
class EventEmitter {
    constructor() {
        this.events = {};
    }

    emit(eventName, data) {
        const event = this.events[eventName];
        if (event) {
            event.forEach(fn => {
                fn.call(null, data);
            });
        }
    }

    subscribe(eventName, fn) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(fn);
        return () => {
            this.events[eventName] = this.events[eventName].filter(eventFn => fn !== eventFn);
        }
    }
}
/* Bit created by Zain Ali */
class Bit extends EventEmitter {
    constructor() {
        super();
        this.version = "0.1";
        this.author = "Zain Ali";
        this.slogan = "Hobby project :D";
    }
    check() {
        let c = document.querySelectorAll('.bit');
        let i, l;
        //dom list
        var d = [];
        this.emit('hello', c);
        this.emit('hello_private', c);
        if (c.length == 0) {
            throw new Error("Can't find the containers for Bit");
        }
        for (i = 0; i < c.length; i++) {
            c[i].innerHTML = 'Bit running on...' + document.domain;
            c[i].Bit = this.version;
            d.push(c[i]);
        }
        console.log(d);
    }
}