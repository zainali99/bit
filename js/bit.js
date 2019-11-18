class Bit {
    constructor() {
        this.version = "0.1";
        this.author = "Zain Ali";
        this.slogan = "Hobby project :D";
    }
    check(){
        let c = document.querySelectorAll('.bit');
        let i, l;
        //dom list
        var d = [];
        if(c.length == 0) {
            throw new Error("Can't find the containers for Bit");
        } 
        for (i = 0; i < c.length; i++) {
            c[i].innerHTML = 'Bit running on...'+document.domain;
            c[i].Bit = this.version;
            d.push(c[i]);
        }
        console.log(d);
    }
}