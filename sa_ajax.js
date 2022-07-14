/*
 
 CREDITS
 
 SAA Ajax
 Autor: Sergio Abreu A.
 dosergio@gmail.com
 Version 4.3
 Created 2006
 Updated 07 Jul 2022
 
 License: LGPL
 
 */
function getXMLHttp() {
  if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    return new ActiveXObject("Microsoft.XMLHTTP");
  }
}
var ObjAjax = {
  objs: [],
  add: function(ourl, ocallback /*[, ("text"|"xml"), ("get"|"post"), formName ]*/) {
    var tmp_count = this.objs.length;
    this.objs.push(
            {
              xm: null,
              url: ourl,
              callback: ocallback,
              respText: null,
              respXML: null,
              file: null,
              fileId: (arguments.length >= 6 ? arguments[5] : null),
              headerProp: 'Content-Type',
              headerMime: 'application/x-www-form-urlencoded;charset=windows-1252',
              dados: null,
              name: "sajax" + tmp_count,
              type: (arguments.length >= 3 ? arguments[2] : 'text'),
              method: (arguments.length >= 4 ? arguments[3].toLowerCase() : 'get'),
              formName: (arguments.length >= 5 && 
                          typeof arguments[4] === 'string' ? arguments[4] : null),
              objSend: (arguments.length >= 5 && 
                          typeof arguments[4] === 'object' ? arguments[4] : null),
              init: function() {
                
                this.xm = null;
                this.xm = getXMLHttp();
                
                if ( this.formName)
                  this.dados = this.queryForm( this.formName);
                else if ( this.objSend){  
                  this.dados = this.queryObject( this.objSend);
                }
                
                this.xm.onreadystatechange = function() {
                  var oobj = ObjAjax.get(tmp_count);
                  if (oobj && oobj.xm && oobj.xm.readyState == 4) {
                    if (oobj.xm.status % 200 == 0) {
                      if (oobj.callback)
                        oobj.callback(
                          oobj.type == 'text' ?
                          oobj.xm.responseText :
                          oobj.xm.responseXML);
                      oobj.name = oobj.name.replace(/sajax/, "killme");
                    }
                    else { // error
                      if (oobj.callback)
                        oobj.callback(
                            {
                              errorCode: oobj.xm.status,
                              message: oobj.xm.responseText
                            }                                     
                           );
                      oobj.name = oobj.name.replace(/sajax/, "killme");
                    }
                  }
                };
                
                this.xm.open( this.method, this.url, true);
                //setRequestHeader must be after open
                   
                  if ( this.method == 'put' && this.formName ) {

                           this.file = this.getFile(this.formName, this.fileId);
                           this.dados = this.file;
                           this.xm.setRequestHeader('X-File-Name', this.file.name);
                           this.xm.setRequestHeader('X-File-Size', this.file.size);

                   }
                   else if (this.method == 'post'){ // Vale pro form e objeto

                          this.xm.setRequestHeader(this.headerProp, this.headerMime);                         
                          this.xm.overrideMimeType('text/plain;charset=windows-1252'); 

                    }
                   else { // Get

                       this.xm.overrideMimeType('text/html;charset=windows-1252');
                    }
                 // console.log('Dados: ' , this.dados);
                 
                this.xm.send(this.dados);
              },
              getFile: function (fo, id) {
                var file = null;
                if (typeof fo == 'string') fo = eval('document.' + fo);
                for (var i = 0; i < fo.elements.length; i++) {
                  el = fo.elements[i];
                  if (el.type == 'file') {
                    var fs = el.files;
                    for (a in fs) {
                      if ((isNaN(id) && fs[a].name == id) || (typeof id == 'number' && a == id)) {
                        file = fs[a];
                      }
                    }
                  } else {
                    this.xm.setRequestHeader('UPLOAD-' + el.name, escape(el.value));
                  }
                }
                if (file) {
                  return file;
                } else {
                  alert('AjaxUpload:Not any file element here.');
                  return null;
                }
              },
              queryObject: function( obj ){                
                var s = '';
                for( var a in obj){
                  if( typeof a === 'string'){
                    
                    s += (s ? "&" : "") + a + "=" + escape( obj[a]);
                  }
                }
                return s;
               },
              queryForm: function(fo) {
                var s = "";
                if (typeof fo == 'string')
                  fo = eval("document." + fo);
                with (fo) {
                  for (var i = 0; i < elements.length; i++) {
                    el = elements[i];
                    switch (el.type) {
                      case 'radio':
                      case 'checkbox':
                        if (el.checked)
                          s += (s ? "&" : "") + el.name + "=" + escape(el.value);
                        break;
                      default:
                        if (el.name && el.tagName != 'SELECT')
                          s += (s ? "&" : "") + el.name + "=" + escape(el.value);
                        else {
                          if (!el.multiple)
                            s += (s ? "&" : "") + el.name + "=" + escape(el.value);
                          else {
                            for (var j = 0; j < el.options.length; j++) {
                              if (el.options[j].selected)
                                s += (s ? "&" : "") + el.name + "=" + escape(el.options[j].value);
                            }
                          }

                        }
                    }
                  }
                }
                return s;
              }
            });
    this.objs[tmp_count].init();
    if (this.objs.length % 11 == 10) {
      this.garbagecolect();
    }
    return true;
  },
  get: function(n) {
    var s = "";
    for (var i = 0; i < this.objs.length; i++) {
      if (this.objs[i] && this.objs[i].name == "sajax" + n) {
        return this.objs[i];
      }
    }
  },
  garbagecolect: function() {
    var tot = this.objs.length, tobjs = [], oks = 0, kls = 0, nls = 0, shf = 0;
    while (this.objs[0] == null) {
      this.objs.shift();
      shf++;
    }
    for (var i = 0; i < this.objs.length; i++) {
      if (this.objs[i] && this.objs[i].name && this.objs[i].xm) {
        if (this.objs[i].name.match(/sajax/)) {
          tobjs.push(this.objs[i]);
          oks++;
        } else if (this.objs[i].name.match(/killme/)) {
          this.objs[i].xm = null;
          this.objs[i] = null;
          kls++;
        }
      } else
        nls++;
    }
    this.objs = [];
    this.objs = tobjs;
  }
};

function AjaxTest(url) {
   
  ObjAjax.add( url, function(s){ console.log(s.substr(0,100));});
   
}

function AjaxGet(url, func) {
  ObjAjax.add(url, func);
}

function AjaxTo(url, elementId) {
  ObjAjax.add(url, function(res) {
    var ob = document.getElementById(elementId);
    if (ob.tagName.match(/INPUT|TEXTAREA/))
      ob.value = res;
    else
      ob.innerHTML = res;
  });
}

function AjaxAppendTo(url, elementId) {
  ObjAjax.add(url, function(res) {
    var ob = document.getElementById(elementId);
    if (ob.tagName.match(/INPUT|TEXTAREA/))
      ob.value += res;
    else
      ob.innerHTML += res;
  });
}


function AjaxXML(url, func) {
  ObjAjax.add(url, func, 'xml');
}

function AjaxPostObj( url, obj /*[, func, ("text"|"xml")] */) {
  var callback = arguments.length < 3 ? null : arguments[2];
  var type = arguments.length <= 3 ? 'text' : arguments[3];
  ObjAjax.add(url, callback, type, 'post', obj);
}

function AjaxPost(url, form_name /*[, func, ("text"|"xml")] */) {
  var callback = arguments.length < 3 ? null : arguments[2];
  var type = arguments.length <= 3 ? 'text' : arguments[3];
  ObjAjax.add(url, callback, type, 'post', form_name);
}

function AjaxUpload(url, form_name /*[,func,fileId,("text"|"xml"), "put"]*/
) {
  var callback = arguments.length < 3 ? null : arguments[2];
  var fileId = arguments.length < 4 ? 0 : arguments[3];
  var type = arguments.length < 5 ? 'text' : arguments[4];
  ObjAjax.add(url, callback, type, 'put', form_name, fileId);
} /*EXTRAS*/


/* EXTRAS */

function getXMLDocument(xmltext) {
  if (window.DOMParser)
  {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(xmltext, "text/xml");
  }
  else // Internet Explorer
  {
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = "false";
    xmlDoc.loadXML(xmltext);
  }
  return xmlDoc;
}