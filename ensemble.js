// Ensemble.js
// by Greg Frazier - MIT License
// -----
// Some code by John Resig from http://ejohn.org/blog/simple-javascript-inheritance/ was used, MIT License
// -----
// simple example: en('#thing').nodes({type: 'input'}, en({type: 'div'}).nodes({type:'span'}))
(function(wnd){
        var initializing = false;
        this.en = function(sel) {
            if(!initializing){
                var selector = function (s, element) {
                    return element[['getElementById', 'getElementsByClassName', 'getElementsByName', 'getElementsByTagName']['#.@='.indexOf(s[0])] || 'querySelectorAll'](s.slice(1));
                };
                if(!sel)
                    return null;
                if(!!sel.isEnObject)
                    return sel;
                if(!!sel.entype)
                    return en.fn.initSingle(sel);
                if(sel instanceof Element)
                    return arguments.callee.extend(sel);
                var element = document; // want to add the ability to specify an element
                return arguments.callee.extend(selector(sel, element));
            }
        };

        en.extend = function(obj) {
            // Ripped off ideas from John Resig: http://ejohn.org/blog/simple-javascript-inheritance/
            initializing = true;
            var prototype = new this();
            initializing = false;
            function enObject() {
                if(!initializing)
                    this.init.apply(this, arguments);
            }
            enObject.prototype = prototype;
            enObject.prototype.constructor = enObject;
            enObject.extend = arguments.callee;
            return new enObject(obj);
        };

        en.fn = en.prototype = {
            length: 0,
            init: function(obj) {
                this.ele = obj;
                this.isEnObject = true;
                // Add them to the main object to simulate an array
                if(obj instanceof HTMLCollection)
                    for(var i = 0; i < obj.length; i++)
                        this[i] = obj[i], ++this.length;
                else
                    this[0] = obj, ++this.length;
                return this;
            },
            initSingle: function(objDesc) {
                return en(document.createElement(objDesc.entype)).applyAttrib(objDesc.attr).applyStyle(objDesc.style).emblazon(objDesc.emblaze);
            },
            applyAttrib: function(attr) {
                if(attr !== undefined)
                    for (var property in attr) // Overwrites and assumes no collection
                        this.ele[property] = attr[property];
                return this;
            },
            applyStyle: function(style) {
                if(style !== undefined)
                    for (var property in style) // Overwrites and assumes no collection
                        this.ele.style[property] = style[property];
                return this;
            },
            attr: function(attrib, value) {
                for(var i = 0; i < this.length; i++)
                    this[i].setAttribute(attrib, value);
            },
            addClass: function(cn) {
                if(this.length > 0) {
                    for(var i = 0; i < this.length; i++)
                        if(!this.hasClass(cn, this[i])) {
                            var c = this[i].className.match(/\S+/g);
                            c.push(cn);
                            this[i].className = c.join(' ');
                        }
                } else {                    
                    if(!this.hasClass(cn)) {
                        var c = this.ele.className.match(/\S+/g);
                        c.push(cn);
                        this.ele.className = c.join(' ');
                    }
                }
                return this;
            },
            removeClass: function(cn) {
                if(this.length > 0) {
                    for(var i = 0; i < this.length; i++)
                        if(this.hasClass(cn, this[i])) {
                            var c = this[i].className.match(/\S+/g);
                            c.splice(c.indexOf(cn), 1);
                            this[i].className = c.join(' ');
                        }
                } else {
                    if(this.hasClass(cn)) {
                        var c = this.ele.className.match(/\S+/g);
                        c.splice(c.indexOf(cn), 1);
                        this.ele.className = c.join(' ');
                    }
                }
                return this;
            },
            hasClass: function(cn, obj) {
                if(obj === undefined)
                    obj = this.ele;
                var c = obj.className.match(/\S+/g);
                if(c.indexOf(cn) < 0)
                    return false;
                return true;
            },
            decompose: function() {
                return this.ele;
            },
            node: function() {
                var processSingle = function(obj, that) {
                    if(obj instanceof Element)
                        that.appendElements(en(obj));
                    else if(!!obj.isEnObject)
                        that.appendElements(obj);
                    else if(obj.entype !== undefined) {
                        var elems = that.appendElements(en(document.createElement(obj.entype)).applyAttrib(obj.attr).applyStyle(obj.style));
                        if(obj.nodes)
                            for(var x = 0; x < Math.min(obj.nodes.length, 100); ++x)
                                for(var y = 0; y < elems.length; ++y)
                                    en(elems[y]).node(obj.nodes[x]);
                    }
                };
                if(arguments.length <= 0)
                    return this;
                try {
                    for (var i = 0; i < arguments.length; i++) {
                        var obj = arguments[i];
                        if(obj instanceof Array)
                            for(var x = 0; x < obj.length; processSingle(obj[x++], this));
                        else
                            processSingle(obj, this);
                    }
                    return this;
                } catch(ex) {
                    throw ex;
                }
            },
            appendElements: function(el) {
                // if(el instanceof Array)
                //     for(var i = 0; i < el.length; i++)
                //         this.appendNode(el[i]);
                if(el instanceof Element)
                    return this.appendNode(el);
                if(el.ele !== undefined)
                    return this.appendNode(el.ele, false, el.validateEvent, el.requiredEvent);
                return [];
            },
            appendNode: function(el, rem, v, r) {
                var elements = [];
                if(this.length > 0) // this is stupid.
                    for(var i = 0; i < this.length; i++) {
                        this[i].appendChild(elements[elements.push(
                            (function(el) {                         
                                var t = el; //.cloneNode(true); // cloneNode doesn't work with non-standard attributes or events.
                                var evt = {};
                                if(v !== undefined) {
                                    // This "in-depth" closure doesn't seem to be needed, 
                                    // but was part of older code and I didn't remove it yet.
                                    for (var property in v)
                                        evt[property] = v[property];
                                    t.addEventListener(evt.event, evt.trigger);
                                }
                                return t;
                            })(el)
                            )-1]);
                    }
                else
                    this.ele.appendChild(elements[elements.push(
                        (function(el) {                         
                            var t = el;
                            var evt = {};
                            if(v !== undefined){
                                for (var property in v)
                                    evt[property] = v[property];
                                t.addEventListener(evt.event, evt.trigger);
                            }
                            return t;
                        })(el)
                        )-1]);
                if(rem)
                    delete el;
                return elements;
            }
        };
        // expose ensemble
        wnd.en = en;
        return en;
    }
)(typeof window !== 'undefined' ? window : this);
