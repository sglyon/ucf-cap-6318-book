import{b as y}from"https://sglyon.github.io/ucf-cap-6318-book/docs/build/_shared/chunk-2NH4LW52.js";function f(e){for(var n={},r=0;r<e.length;++r)n[e[r]]=!0;return n}function p(e,n){t=null;var r=e.next();if(r=="#")return e.skipToEnd(),"comment";if(r=="0"&&e.eat("x"))return e.eatWhile(/[\da-f]/i),"number";if(r=="."&&e.eat(/\d/))return e.match(/\d*(?:e[+\-]?\d+)?/),"number";if(/\d/.test(r))return e.match(/\d*(?:\.\d+)?(?:e[+\-]\d+)?L?/),"number";if(r=="'"||r=='"')return n.tokenize=I(r),"string";if(r=="`")return e.match(/[^`]+`/),"string.special";if(r=="."&&e.match(/.(?:[.]|\d+)/))return"keyword";if(/[a-zA-Z\.]/.test(r)){e.eatWhile(/[\w\.]/);var i=e.current();return m.propertyIsEnumerable(i)?"atom":A.propertyIsEnumerable(i)?(E.propertyIsEnumerable(i)&&!e.match(/\s*if(\s+|$)/,!1)&&(t="block"),"keyword"):N.propertyIsEnumerable(i)?"builtin":"variable"}else return r=="%"?(e.skipTo("%")&&e.next(),"variableName.special"):r=="<"&&e.eat("-")||r=="<"&&e.match("<-")||r=="-"&&e.match(/>>?/)||r=="="&&n.ctx.argList?"operator":k.test(r)?(r=="$"||e.eatWhile(k),"operator"):/[\(\){}\[\];]/.test(r)?(t=r,r==";"?"punctuation":null):null}function I(e){return function(n,r){if(n.eat("\\")){var i=n.next();return i=="x"?n.match(/^[a-f0-9]{2}/i):(i=="u"||i=="U")&&n.eat("{")&&n.skipTo("}")?n.next():i=="u"?n.match(/^[a-f0-9]{4}/i):i=="U"?n.match(/^[a-f0-9]{8}/i):/[0-7]/.test(i)&&n.match(/^[0-7]{1,2}/),"string.special"}else{for(var l;(l=n.next())!=null;){if(l==e){r.tokenize=p;break}if(l=="\\"){n.backUp(1);break}}return"string"}}}function o(e,n,r){e.ctx={type:n,indent:e.indent,flags:0,column:r.column(),prev:e.ctx}}function x(e,n){var r=e.ctx;e.ctx={type:r.type,indent:r.indent,flags:r.flags|n,column:r.column,prev:r.prev}}function a(e){e.indent=e.ctx.indent,e.ctx=e.ctx.prev}var b,g,s,h,m,N,A,E,k,t,v,u,c,w,_=y(()=>{b=["NULL","NA","Inf","NaN","NA_integer_","NA_real_","NA_complex_","NA_character_","TRUE","FALSE"],g=["list","quote","bquote","eval","return","call","parse","deparse"],s=["if","else","repeat","while","function","for","in","next","break"],h=["if","else","repeat","while","function","for"],m=f(b),N=f(g),A=f(s),E=f(h),k=/[+\-*\/^<>=!&|~$:]/;v=1,u=2,c=4;w={name:"r",startState:function(e){return{tokenize:p,ctx:{type:"top",indent:-e,flags:u},indent:0,afterIdent:!1}},token:function(e,n){if(e.sol()&&(n.ctx.flags&3||(n.ctx.flags|=u),n.ctx.flags&c&&a(n),n.indent=e.indentation()),e.eatSpace())return null;var r=n.tokenize(e,n);return r!="comment"&&!(n.ctx.flags&u)&&x(n,v),(t==";"||t=="{"||t=="}")&&n.ctx.type=="block"&&a(n),t=="{"?o(n,"}",e):t=="("?(o(n,")",e),n.afterIdent&&(n.ctx.argList=!0)):t=="["?o(n,"]",e):t=="block"?o(n,"block",e):t==n.ctx.type?a(n):n.ctx.type=="block"&&r!="comment"&&x(n,c),n.afterIdent=r=="variable"||r=="keyword",r},indent:function(e,n,r){if(e.tokenize!=p)return 0;var i=n&&n.charAt(0),l=e.ctx,d=i==l.type;return l.flags&c&&(l=l.prev),l.type=="block"?l.indent+(i=="{"?0:r.unit):l.flags&v?l.column+(d?0:1):l.indent+(d?0:r.unit)},languageData:{wordChars:".",commentTokens:{line:"#"},autocomplete:b.concat(g,s)}}});_();export{w as r};
