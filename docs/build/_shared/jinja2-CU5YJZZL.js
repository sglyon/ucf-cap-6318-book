import{b as c}from"https://sglyon.github.io/ucf-cap-6318-book/build/_shared/chunk-2NH4LW52.js";function a(n,e){var i=n.peek();if(e.incomment)return n.skipTo("#}")?(n.eatWhile(/\#|}/),e.incomment=!1):n.skipToEnd(),"comment";if(e.intag){if(e.operator){if(e.operator=!1,n.match(o))return"atom";if(n.match(r))return"number"}if(e.sign){if(e.sign=!1,n.match(o))return"atom";if(n.match(r))return"number"}if(e.instring)return i==e.instring&&(e.instring=!1),n.next(),"string";if(i=="'"||i=='"')return e.instring=i,n.next(),"string";if(e.inbraces>0&&i==")")n.next(),e.inbraces--;else if(i=="(")n.next(),e.inbraces++;else if(e.inbrackets>0&&i=="]")n.next(),e.inbrackets--;else if(i=="[")n.next(),e.inbrackets++;else{if(!e.lineTag&&(n.match(e.intag+"}")||n.eat("-")&&n.match(e.intag+"}")))return e.intag=!1,"tag";if(n.match(f))return e.operator=!0,"operator";if(n.match(u))e.sign=!0;else{if(n.column()==1&&e.lineTag&&n.match(l))return"keyword";if(n.eat(" ")||n.sol()){if(n.match(l))return"keyword";if(n.match(o))return"atom";if(n.match(r))return"number";n.sol()&&n.next()}else n.next()}}return"variable"}else if(n.eat("{")){if(n.eat("#"))return e.incomment=!0,n.skipTo("#}")?(n.eatWhile(/\#|}/),e.incomment=!1):n.skipToEnd(),"comment";if(i=n.eat(/\{|%/))return e.intag=i,e.inbraces=0,e.inbrackets=0,i=="{"&&(e.intag="}"),n.eat("-"),"tag"}else if(n.eat("#")){if(n.peek()=="#")return n.skipToEnd(),"comment";if(!n.eol())return e.intag=!0,e.lineTag=!0,e.inbraces=0,e.inbrackets=0,"tag"}n.next()}var l,f,u,o,r,b,g=c(()=>{l=["and","as","block","endblock","by","cycle","debug","else","elif","extends","filter","endfilter","firstof","do","for","endfor","if","endif","ifchanged","endifchanged","ifequal","endifequal","ifnotequal","set","raw","endraw","endifnotequal","in","include","load","not","now","or","parsed","regroup","reversed","spaceless","call","endcall","macro","endmacro","endspaceless","ssi","templatetag","openblock","closeblock","openvariable","closevariable","without","context","openbrace","closebrace","opencomment","closecomment","widthratio","url","with","endwith","get_current_language","trans","endtrans","noop","blocktrans","endblocktrans","get_available_languages","get_current_language_bidi","pluralize","autoescape","endautoescape"],f=/^[+\-*&%=<>!?|~^]/,u=/^[:\[\(\{]/,o=["true","false"],r=/^(\d[+\-\*\/])?\d+(\.\d+)?/;l=new RegExp("(("+l.join(")|(")+"))\\b");o=new RegExp("(("+o.join(")|(")+"))\\b");b={name:"jinja2",startState:function(){return{tokenize:a,inbrackets:0,inbraces:0}},token:function(n,e){var i=e.tokenize(n,e);return n.eol()&&e.lineTag&&!e.instring&&e.inbraces==0&&e.inbrackets==0&&(e.intag=!1,e.lineTag=!1),i},languageData:{commentTokens:{block:{open:"{#",close:"#}",line:"##"}}}}});g();export{b as jinja2};
