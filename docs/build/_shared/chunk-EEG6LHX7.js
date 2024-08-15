import{a as se,c as N,d as H,f as Q}from"https://sglyon.github.io/ucf-cap-6318-book/build/_shared/chunk-GUCIBHGO.js";import{c as k,e as ae}from"https://sglyon.github.io/ucf-cap-6318-book/build/_shared/chunk-2NH4LW52.js";var we=k((It,xe)=>{xe.exports={trueFunc:function(){return!0},falseFunc:function(){return!1}}});var X=k(v=>{"use strict";Object.defineProperty(v,"__esModule",{value:!0});function St(e){return e>="a"&&e<="z"||e>="A"&&e<="Z"||e==="-"||e==="_"}v.isIdentStart=St;function kt(e){return e>="a"&&e<="z"||e>="A"&&e<="Z"||e>="0"&&e<="9"||e==="-"||e==="_"}v.isIdent=kt;function Tt(e){return e>="a"&&e<="f"||e>="A"&&e<="F"||e>="0"&&e<="9"}v.isHex=Tt;function Ot(e){for(var t=e.length,r="",i=0;i<t;){var n=e.charAt(i);if(v.identSpecialChars[n])r+="\\"+n;else if(n==="_"||n==="-"||n>="A"&&n<="Z"||n>="a"&&n<="z"||i!==0&&n>="0"&&n<="9")r+=n;else{var a=n.charCodeAt(0);if((a&63488)===55296){var s=e.charCodeAt(i++);if((a&64512)!==55296||(s&64512)!==56320)throw Error("UCS-2(decode): illegal sequence");a=((a&1023)<<10)+(s&1023)+65536}r+="\\"+a.toString(16)+" "}i++}return r}v.escapeIdentifier=Ot;function Nt(e){for(var t=e.length,r="",i=0,n;i<t;){var a=e.charAt(i);a==='"'?a='\\"':a==="\\"?a="\\\\":(n=v.strReplacementsRev[a])!==void 0&&(a=n),r+=a,i++}return'"'+r+'"'}v.escapeStr=Nt;v.identSpecialChars={"!":!0,'"':!0,"#":!0,$:!0,"%":!0,"&":!0,"'":!0,"(":!0,")":!0,"*":!0,"+":!0,",":!0,".":!0,"/":!0,";":!0,"<":!0,"=":!0,">":!0,"?":!0,"@":!0,"[":!0,"\\":!0,"]":!0,"^":!0,"`":!0,"{":!0,"|":!0,"}":!0,"~":!0};v.strReplacementsRev={"\n":"\\n","\r":"\\r","	":"\\t","\f":"\\f","\v":"\\v"};v.singleQuoteEscapeChars={n:`
`,r:"\r",t:"	",f:"\f","\\":"\\","'":"'"};v.doubleQuotesEscapeChars={n:`
`,r:"\r",t:"	",f:"\f","\\":"\\",'"':'"'}});var Se=k(G=>{"use strict";Object.defineProperty(G,"__esModule",{value:!0});var y=X();function Pt(e,t,r,i,n,a){var s=e.length,o="";function f(l,d){var h="";for(t++,o=e.charAt(t);t<s;){if(o===l)return t++,h;if(o==="\\"){t++,o=e.charAt(t);var m=void 0;if(o===l)h+=l;else if((m=d[o])!==void 0)h+=m;else if(y.isHex(o)){var _=o;for(t++,o=e.charAt(t);y.isHex(o);)_+=o,t++,o=e.charAt(t);o===" "&&(t++,o=e.charAt(t)),h+=String.fromCharCode(parseInt(_,16));continue}else h+=o}else h+=o;t++,o=e.charAt(t)}return h}function u(){var l="";for(o=e.charAt(t);t<s;){if(y.isIdent(o))l+=o;else if(o==="\\"){if(t++,t>=s)throw Error("Expected symbol but end of file reached.");if(o=e.charAt(t),y.identSpecialChars[o])l+=o;else if(y.isHex(o)){var d=o;for(t++,o=e.charAt(t);y.isHex(o);)d+=o,t++,o=e.charAt(t);o===" "&&(t++,o=e.charAt(t)),l+=String.fromCharCode(parseInt(d,16));continue}else l+=o}else return l;t++,o=e.charAt(t)}return l}function c(){o=e.charAt(t);for(var l=!1;o===" "||o==="	"||o===`
`||o==="\r"||o==="\f";)l=!0,t++,o=e.charAt(t);return l}function p(){var l=b();if(t<s)throw Error('Rule expected but "'+e.charAt(t)+'" found.');return l}function b(){var l=oe();if(!l)return null;var d=l;for(o=e.charAt(t);o===",";){if(t++,c(),d.type!=="selectors"&&(d={type:"selectors",selectors:[l]}),l=oe(),!l)throw Error('Rule expected after ",".');d.selectors.push(l)}return d}function oe(){c();var l={type:"ruleSet"},d=U();if(!d)return null;for(var h=l;d&&(d.type="rule",h.rule=d,h=d,c(),o=e.charAt(t),!(t>=s||o===","||o===")"));)if(n[o]){var m=o;if(t++,c(),d=U(),!d)throw Error('Rule expected after "'+m+'".');d.nestingOperator=m}else d=U(),d&&(d.nestingOperator=null);return l}function U(){for(var l=null;t<s;)if(o=e.charAt(t),o==="*")t++,(l=l||{}).tagName="*";else if(y.isIdentStart(o)||o==="\\")(l=l||{}).tagName=u();else if(o===".")t++,l=l||{},(l.classNames=l.classNames||[]).push(u());else if(o==="#")t++,(l=l||{}).id=u();else if(o==="["){t++,c();var d={name:u()};if(c(),o==="]")t++;else{var h="";if(i[o]&&(h=o,t++,o=e.charAt(t)),t>=s)throw Error('Expected "=" but end of file reached.');if(o!=="=")throw Error('Expected "=" but "'+o+'" found.');d.operator=h+"=",t++,c();var m="";if(d.valueType="string",o==='"')m=f('"',y.doubleQuotesEscapeChars);else if(o==="'")m=f("'",y.singleQuoteEscapeChars);else if(a&&o==="$")t++,m=u(),d.valueType="substitute";else{for(;t<s&&o!=="]";)m+=o,t++,o=e.charAt(t);m=m.trim()}if(c(),t>=s)throw Error('Expected "]" but end of file reached.');if(o!=="]")throw Error('Expected "]" but "'+o+'" found.');t++,d.value=m}l=l||{},(l.attrs=l.attrs||[]).push(d)}else if(o===":"){t++;var _=u(),S={name:_};if(o==="("){t++;var w="";if(c(),r[_]==="selector")S.valueType="selector",w=b();else{if(S.valueType=r[_]||"string",o==='"')w=f('"',y.doubleQuotesEscapeChars);else if(o==="'")w=f("'",y.singleQuoteEscapeChars);else if(a&&o==="$")t++,w=u(),S.valueType="substitute";else{for(;t<s&&o!==")";)w+=o,t++,o=e.charAt(t);w=w.trim()}c()}if(t>=s)throw Error('Expected ")" but end of file reached.');if(o!==")")throw Error('Expected ")" but "'+o+'" found.');t++,S.value=w}l=l||{},(l.pseudos=l.pseudos||[]).push(S)}else break;return l}return p()}G.parseCssSelector=Pt});var ke=k(q=>{"use strict";Object.defineProperty(q,"__esModule",{value:!0});var g=X();function $(e){var t="";switch(e.type){case"ruleSet":for(var r=e.rule,i=[];r;)r.nestingOperator&&i.push(r.nestingOperator),i.push($(r)),r=r.rule;t=i.join(" ");break;case"selectors":t=e.selectors.map($).join(", ");break;case"rule":e.tagName&&(e.tagName==="*"?t="*":t=g.escapeIdentifier(e.tagName)),e.id&&(t+="#"+g.escapeIdentifier(e.id)),e.classNames&&(t+=e.classNames.map(function(n){return"."+g.escapeIdentifier(n)}).join("")),e.attrs&&(t+=e.attrs.map(function(n){return"operator"in n?n.valueType==="substitute"?"["+g.escapeIdentifier(n.name)+n.operator+"$"+n.value+"]":"["+g.escapeIdentifier(n.name)+n.operator+g.escapeStr(n.value)+"]":"["+g.escapeIdentifier(n.name)+"]"}).join("")),e.pseudos&&(t+=e.pseudos.map(function(n){return n.valueType?n.valueType==="selector"?":"+g.escapeIdentifier(n.name)+"("+$(n.value)+")":n.valueType==="substitute"?":"+g.escapeIdentifier(n.name)+"($"+n.value+")":n.valueType==="numeric"?":"+g.escapeIdentifier(n.name)+"("+n.value+")":":"+g.escapeIdentifier(n.name)+"("+g.escapeIdentifier(n.value)+")":":"+g.escapeIdentifier(n.name)}).join(""));break;default:throw Error('Unknown entity type: "'+e.type+'".')}return t}q.renderEntity=$});var Te=k(K=>{"use strict";Object.defineProperty(K,"__esModule",{value:!0});var Lt=Se(),Ft=ke(),jt=function(){function e(){this.pseudos={},this.attrEqualityMods={},this.ruleNestingOperators={},this.substitutesEnabled=!1}return e.prototype.registerSelectorPseudos=function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];for(var i=0,n=t;i<n.length;i++){var a=n[i];this.pseudos[a]="selector"}return this},e.prototype.unregisterSelectorPseudos=function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];for(var i=0,n=t;i<n.length;i++){var a=n[i];delete this.pseudos[a]}return this},e.prototype.registerNumericPseudos=function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];for(var i=0,n=t;i<n.length;i++){var a=n[i];this.pseudos[a]="numeric"}return this},e.prototype.unregisterNumericPseudos=function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];for(var i=0,n=t;i<n.length;i++){var a=n[i];delete this.pseudos[a]}return this},e.prototype.registerNestingOperators=function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];for(var i=0,n=t;i<n.length;i++){var a=n[i];this.ruleNestingOperators[a]=!0}return this},e.prototype.unregisterNestingOperators=function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];for(var i=0,n=t;i<n.length;i++){var a=n[i];delete this.ruleNestingOperators[a]}return this},e.prototype.registerAttrEqualityMods=function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];for(var i=0,n=t;i<n.length;i++){var a=n[i];this.attrEqualityMods[a]=!0}return this},e.prototype.unregisterAttrEqualityMods=function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];for(var i=0,n=t;i<n.length;i++){var a=n[i];delete this.attrEqualityMods[a]}return this},e.prototype.enableSubstitutes=function(){return this.substitutesEnabled=!0,this},e.prototype.disableSubstitutes=function(){return this.substitutesEnabled=!1,this},e.prototype.parse=function(t){return Lt.parseCssSelector(t,0,this.pseudos,this.attrEqualityMods,this.ruleNestingOperators,this.substitutesEnabled)},e.prototype.render=function(t){return Ft.renderEntity(t).trim()},e}();K.CssSelectorParser=jt});var $e=e=>crypto.getRandomValues(new Uint8Array(e)),ze=(e,t,r)=>{let i=(2<<Math.log(e.length-1)/Math.LN2)-1,n=-~(1.6*i*t/e.length);return(a=t)=>{let s="";for(;;){let o=r(n),f=n;for(;f--;)if(s+=e[o[f]&i]||"",s.length===a)return s}}},Z=(e,t=21)=>ze(e,t,$e),Zt=(e=21)=>crypto.getRandomValues(new Uint8Array(e)).reduce((t,r)=>(r&=63,r<36?t+=r.toString(36):r<62?t+=(r-26).toString(36).toUpperCase():r>62?t+="-":t+="_",t),"");function ue(e,t){return t?.note&&(e.note=t.note),t?.url&&(e.url=t.url),t?.ruleId&&(e.ruleId=t.ruleId),t?.fatal&&(e.fatal=!0),e}function De(e,t,r){return ue(e.message(t,r?.node,r?.source),{...r,fatal:!0})}function Be(e,t,r){return ue(e.message(t,r?.node,r?.source),r)}var le="abcdefghijklmnopqrstuvwxyz",ce=le+le.toUpperCase(),Ue="0123456789",He=Z(ce,1),Qe=Z(ce+Ue,9);function Ze(){return He()+Qe()}function Ve(e){if(!e)return;let t=e.replace(/[\t\n\r ]+/g," ").replace(/['‘’"“”]+/g,"").trim().toLowerCase(),r=fe(t);return{identifier:t,label:e,html_id:r}}function fe(e){if(e)return e.toLowerCase().replace(/[^a-z0-9-]/g,"-").replace(/^([0-9-])/,"id-$1").replace(/-[-]+/g,"-").replace(/(?:^[-]+)|(?:[-]+$)/g,"")}function de(e,t){if(!e.children)return[e];let r=e.children.map(i=>de(i,t)).flat();return e.type===t?(e&&e.children==null&&delete e.children,r):(e.children=r,[e])}function We(e,t){e.children&&(e.children=e.children.map(r=>de(r,t)).flat())}function Je(e,t){e.children=[{type:"text",value:t}]}function T(e){return e?Array.isArray(e)?e.map(t=>!t||typeof t=="string"?t||"":"value"in t?t.value:"children"in t&&t.children?T(t.children):"").join(""):T([e]):""}function P(e){return structuredClone(e)}function Ye(e){return{attention:"Attention",caution:"Caution",danger:"Danger",error:"Error",important:"Important",hint:"Hint",note:"Note",seealso:"See Also",tip:"Tip",warning:"Warning"}[e]||`Unknown Admonition "${e}"`}function Xe(e,t,r){if(!t||t?.length===0)return"";let i=(r-e.length-4)/2,n="".padEnd(Math.ceil(i),"%"),a="".padEnd(Math.floor(i),"%");return`${`${n}  ${e}  ${a}
`}${t.join(`
`)}
`}function Ge(e){var t;if(!e.data)return[];let r=(t=e.data.tags)!==null&&t!==void 0?t:[];return Object.entries(e.data).forEach(([i,n])=>{(n===!0||typeof n=="string"&&n.toLowerCase()==="true")&&r.push(i)}),r.map(i=>i.toLowerCase())}var pe={}.hasOwnProperty;function L(e,t){let r=t||{};function i(n,...a){let s=i.invalid,o=i.handlers;if(n&&pe.call(n,e)){let f=String(n[e]);s=pe.call(o,f)?o[f]:i.unknown}if(s)return s.call(this,n,...a)}return i.handlers=r.handlers||{},i.invalid=r.invalid,i.unknown=r.unknown,i}var qe=L("operator",{unknown:rt,invalid:me,handlers:{"=":Ke,"^=":Re,"$=":et,"*=":tt,"~=":Ie}});function he(e,t){let r=-1;for(;++r<e.attrs.length;)if(!qe(e.attrs[r],t))return!1;return!0}function me(e,t){return t[e.name]!==null&&t[e.name]!==void 0}function Ke(e,t){return me(e,t)&&String(t[e.name])===e.value}function Ie(e,t){let r=t[e.name];return r==null?!1:Array.isArray(r)&&r.includes(e.value)?!0:String(r)===e.value}function Re(e,t){let r=t[e.name];return Boolean(e.value&&typeof r=="string"&&r.slice(0,e.value.length)===e.value)}function et(e,t){let r=t[e.name];return Boolean(e.value&&typeof r=="string"&&r.slice(-e.value.length)===e.value)}function tt(e,t){let r=t[e.name];return Boolean(e.value&&typeof r=="string"&&r.includes(e.value))}function rt(e){throw new Error("Unknown operator `"+e.operator+"`")}function ve(e,t){return e.tagName==="*"||e.tagName===t.type}var nt=new Set([9,10,12,13,32]),ge="0".charCodeAt(0),it="9".charCodeAt(0);function ye(e){if(e=e.trim().toLowerCase(),e==="even")return[2,0];if(e==="odd")return[2,1];let t=0,r=0,i=a(),n=s();if(t<e.length&&e.charAt(t)==="n"&&(t++,r=i*(n??1),o(),t<e.length?(i=a(),o(),n=s()):i=n=0),n===null||t<e.length)throw new Error(`n-th rule couldn't be parsed ('${e}')`);return[r,i*n];function a(){return e.charAt(t)==="-"?(t++,-1):(e.charAt(t)==="+"&&t++,1)}function s(){let f=t,u=0;for(;t<e.length&&e.charCodeAt(t)>=ge&&e.charCodeAt(t)<=it;)u=u*10+(e.charCodeAt(t)-ge),t++;return t===f?null:u}function o(){for(;t<e.length&&nt.has(e.charCodeAt(t));)t++}}var V=ae(we(),1);function be(e){let t=e[0],r=e[1]-1;if(r<0&&t<=0)return V.default.falseFunc;if(t===-1)return a=>a<=r;if(t===0)return a=>a===r;if(t===1)return r<0?V.default.trueFunc:a=>a>=r;let i=Math.abs(t),n=(r%i+i)%i;return t>1?a=>a>=r&&a%i===n:a=>a<=r&&a%i===n}function F(e){return be(ye(e))}function C(e){return Array.isArray(e.children)}var ot=F.default||F,at=L("name",{unknown:Ct,invalid:bt,handlers:{any:W,blank:Ce,empty:Ce,"first-child":st,"first-of-type":lt,has:ut,"last-child":ct,"last-of-type":ft,matches:W,not:dt,"nth-child":pt,"nth-last-child":ht,"nth-of-type":vt,"nth-last-of-type":mt,"only-child":gt,"only-of-type":yt,root:xt,scope:wt}});J.needsIndex=["any","first-child","first-of-type","last-child","last-of-type","matches","not","nth-child","nth-last-child","nth-of-type","nth-last-of-type","only-child","only-of-type"];function J(e,t,r,i,n){let a=e.pseudos,s=-1;for(;++s<a.length;)if(!at(a[s],t,r,i,n))return!1;return!0}function Ce(e,t){return C(t)?t.children.length===0:!("value"in t)}function st(e,t,r,i,n){return x(n,e),n.nodeIndex===0}function lt(e,t,r,i,n){return x(n,e),n.typeIndex===0}function ut(e,t,r,i,n){let a={type:"root",children:C(t)?t.children:[]},s={...n,found:!1,shallow:!1,one:!0,scopeNodes:[t],results:[],rootQuery:O(e.value)};return E(s,a),s.results.length>0}function ct(e,t,r,i,n){return x(n,e),typeof n.nodeCount=="number"&&n.nodeIndex===n.nodeCount-1}function ft(e,t,r,i,n){return x(n,e),typeof n.typeCount=="number"&&n.typeIndex===n.typeCount-1}function W(e,t,r,i,n){let a={...n,found:!1,shallow:!1,one:!0,scopeNodes:[t],results:[],rootQuery:O(e.value)};return E(a,t),a.results[0]===t}function dt(e,t,r,i,n){return!W(e,t,r,i,n)}function pt(e,t,r,i,n){let a=j(e);return x(n,e),typeof n.nodeIndex=="number"&&a(n.nodeIndex)}function ht(e,t,r,i,n){let a=j(e);return x(n,e),typeof n.nodeCount=="number"&&typeof n.nodeIndex=="number"&&a(n.nodeCount-n.nodeIndex-1)}function mt(e,t,r,i,n){let a=j(e);return x(n,e),typeof n.typeIndex=="number"&&typeof n.typeCount=="number"&&a(n.typeCount-1-n.typeIndex)}function vt(e,t,r,i,n){let a=j(e);return x(n,e),typeof n.typeIndex=="number"&&a(n.typeIndex)}function gt(e,t,r,i,n){return x(n,e),n.nodeCount===1}function yt(e,t,r,i,n){return x(n,e),n.typeCount===1}function xt(e,t,r,i){return t&&!i}function wt(e,t,r,i,n){return t&&n.scopeNodes.includes(t)}function bt(){throw new Error("Invalid pseudo-selector")}function Ct(e){throw e.name?new Error("Unknown pseudo-selector `"+e.name+"`"):new Error("Unexpected pseudo-element or empty pseudo-class")}function x(e,t){if(e.shallow)throw new Error("Cannot use `:"+t.name+"` without parent")}function j(e){let t=e._cachedFn;return t||(t=ot(e.value),e._cachedFn=t),t}function Ee(e,t,r,i,n){if(e.id)throw new Error("Invalid selector: id");if(e.classNames)throw new Error("Invalid selector: class");return Boolean(t&&(!e.tagName||ve(e,t))&&(!e.attrs||he(e,t))&&(!e.pseudos||J(e,t,r,i,n)))}var Et=[];function O(e){return e===null?{type:"selectors",selectors:[]}:e.type==="ruleSet"?{type:"selectors",selectors:[e]}:e}function E(e,t){t&&Ae(e,[],t,void 0,void 0)}function Ae(e,t,r,i,n){let a={directChild:void 0,descendant:void 0,adjacentSibling:void 0,generalSibling:void 0};return a=At(e,M(t,e.rootQuery.selectors),r,i,n),C(r)&&!e.shallow&&!(e.one&&e.found)&&_t(e,a,r),a}function _t(e,t,r){let i=M(t.descendant,t.directChild),n,a=-1,s={count:0,types:new Map},o={count:0,types:new Map};for(;++a<r.children.length;)_e(s,r.children[a]);for(a=-1;++a<r.children.length;){let u=r.children[a].type.toUpperCase();e.nodeIndex=o.count,e.typeIndex=o.types.get(u)||0,e.nodeCount=s.count,e.typeCount=s.types.get(u);let c=M(i,n),p=Ae(e,c,r.children[a],a,r);if(n=M(p.generalSibling,p.adjacentSibling),e.one&&e.found)break;_e(o,r.children[a])}}function At(e,t,r,i,n){let a={directChild:void 0,descendant:void 0,adjacentSibling:void 0,generalSibling:void 0},s=-1;for(;++s<t.length;){let o=t[s];if(e.one&&e.found)break;if(e.shallow&&o.rule.rule)throw new Error("Expected selector without nesting");if(Ee(o.rule,r,i,n,e)){let f=o.rule.rule;if(f){let u={type:"ruleSet",rule:f},c=f.nestingOperator==="+"?"adjacentSibling":f.nestingOperator==="~"?"generalSibling":f.nestingOperator===">"?"directChild":"descendant";Y(a,c,u)}else e.found=!0,e.results.includes(r)||e.results.push(r)}o.rule.nestingOperator===null?Y(a,"descendant",o):o.rule.nestingOperator==="~"&&Y(a,"generalSibling",o)}return a}function M(e,t){return e&&t&&e.length>0&&t.length>0?[...e,...t]:e&&e.length>0?e:t&&t.length>0?t:Et}function Y(e,t,r){let i=e[t];i?i.push(r):e[t]=[r]}function _e(e,t){let r=t.type.toUpperCase(),i=(e.types.get(r)||0)+1;e.count++,e.types.set(r,i)}var Oe=ae(Te(),1),z=new Oe.CssSelectorParser;z.registerAttrEqualityMods("~","^","$","*");z.registerSelectorPseudos("any","matches","not","has");z.registerNestingOperators(">","+","~");function Ne(e){if(typeof e!="string")throw new TypeError("Expected `string` as selector, not `"+e+"`");return z.parse(e)}function Ar(e,t){let r=I(e,t);return r.one=!0,r.shallow=!0,E(r,t||void 0),r.results.length>0}function Sr(e,t){let r=I(e,t);return r.one=!0,E(r,t||void 0),r.results[0]||null}function A(e,t){let r=I(e,t);return E(r,t||void 0),r.results}function I(e,t){return{rootQuery:O(Ne(e)),results:[],scopeNodes:t?C(t)&&(t.type==="RootNode"||t.type==="root")?t.children:[t]:[],one:!1,shallow:!1,found:!1,typeIndex:void 0,nodeIndex:void 0,typeCount:void 0,nodeCount:void 0}}var Mt=[],D=function(e,t,r){let i=se(r||t),n=!t||t.cascade===void 0||t.cascade===null?!0:t.cascade;return a(e);function a(s,o,f){let u=s.children||Mt,c=-1,p=0;if(i(s,o,f))return null;if(u.length>0){for(;++c<u.length;)a(u[c],c,s)&&(u[p++]=u[c]);if(n&&!p)return null;u.length=p}return s}};var Lr=["title","subtitle","short_title","description","thumbnail","thumbnailOptimized","banner","bannerOptimized","authors","reviewers","editors","contributors","venue","github","keywords","affiliations","funding","copyright","options"],Pe={author:"authors",reviewer:"reviewers",editor:"editors",contributor:"contributors",affiliation:"affiliations",export:"exports",download:"downloads",jupyter:"thebe",part:"parts",ack:"acknowledgments",acknowledgements:"acknowledgments",acknowledgment:"acknowledgments",acknowledgement:"acknowledgments",availability:"data_availability",dataAvailability:"data_availability","data-availability":"data_availability",quote:"epigraph",plain_language_summary:"summary","plain-language-summary":"summary",plainLanguageSummary:"summary",lay_summary:"summary","lay-summary":"summary",keyPoints:"keypoints",key_points:"keypoints","key-points":"keypoints",image:"thumbnail"};function B(e){if(!e)return[];if(typeof e=="string")return B([e]);let t=[];return e.map(r=>r.toLowerCase()).forEach(r=>{t.push(r),Object.entries(Pe).forEach(([i,n])=>{(r===i||r===n)&&(t.includes(n)||t.unshift(n),t.includes(i)||t.push(i))})}),t}function Le(e,t){let r=B(t);return r.length===0?[]:A("block",e).filter(n=>{var a,s,o;let f=(!((a=n.data)===null||a===void 0)&&a.tags&&Array.isArray(n.data.tags)?n.data.tags:[]).map(c=>c?.toLowerCase()),u=(o=(s=n.data)===null||s===void 0?void 0:s.part)===null||o===void 0?void 0:o.toLowerCase();return r.map(c=>u===c||f.includes(c)).reduce((c,p)=>c||p,!1)})}function $t(e,t,r){var i;let n={type:"block",children:e};return r?.removePartData||((i=n.data)!==null&&i!==void 0||(n.data={}),n.data.part=t),n}function Fe(e,t){let r=D(e,t);return r||(r=D(e,{cascade:!1},t)),r}function je(e,t,r){var i;let n=B(t);if(n.length===0)return;let a=!1,s=[],o=[];if((i=e.children)===null||i===void 0||i.forEach((u,c)=>{var p;if(a&&u.type==="paragraph"&&(o.push(P(u)),u.type="__part_delete__"),(u.type!=="__part_delete__"||c===e.children.length-1)&&(a=!1,o.length>0&&(s.push($t(o,n[0],r)),o=[],A("__part_heading__",e).forEach(b=>{b.type="__part_delete__"}))),u.type==="block"){if(!((p=u.data)===null||p===void 0)&&p.part||e.type!=="root")return;let b=je(u,n);b&&s.push(...b.children)}else u.type==="heading"&&n.includes(T(u).toLowerCase())&&(a=!0,u.type="__part_heading__")}),A("__part_heading__",e).forEach(u=>{u.type="heading"}),s.length===0)return;let f={type:"root",children:s};return Fe(e,"__part_delete__"),f}function zt(e,t,r){let i=B(t);if(i.length===0)return;let n=Le(e,t);if(n.length===0)return r?.requireExplicitPart?void 0:je(e,i);let s={type:"root",children:P(n).map(o=>{var f;return(f=o.data)!==null&&f!==void 0||(o.data={}),o.data.part=i[0],o.data.tags&&Array.isArray(o.data.tags)&&o.data.tags.reduce((u,c)=>u||i.includes(c.toLowerCase()),!1)&&(o.data.tags=o.data.tags.filter(u=>!i.includes(u.toLowerCase())),o.data.tags.length===0&&delete o.data.tags),r?.removePartData&&delete o.data.part,r?.keepVisibility||delete o.visibility,o})};return n.forEach(o=>{o.type="__delete__"}),Fe(e,"__delete__"),s}var R;(function(e){e.validConfigStructure="valid-config-structure",e.siteConfigExists="site-config-exists",e.projectConfigExists="project-config-exists",e.validSiteConfig="valid-site-config",e.validProjectConfig="valid-project-config",e.configHasNoDeprecatedFields="config-has-no-deprecated-fields",e.frontmatterIsYaml="frontmatter-is-yaml",e.validPageFrontmatter="valid-page-frontmatter",e.validFrontmatterExportList="valid-frontmatter-export-list",e.docxRenders="docx-renders",e.jatsRenders="jats-renders",e.mdRenders="md-renders",e.mecaIncludesJats="meca-includes-jats",e.mecaExportsBuilt="meca-exports-built",e.mecaFilesCopied="meca-files-copied",e.pdfBuildCommandsAvailable="pdf-build-commands-available",e.pdfBuildsWithoutErrors="pdf-builds-without-errors",e.pdfBuilds="pdf-builds",e.texRenders="tex-renders",e.exportExtensionCorrect="export-extension-correct",e.exportArticleExists="export-article-exists",e.texParses="tex-parses",e.jatsParses="jats-parses",e.mystFileLoads="myst-file-loads",e.selectedFileIsProcessed="selected-file-is-processed",e.directiveRegistered="directive-registered",e.directiveKnown="directive-known",e.directiveArgumentCorrect="directive-argument-correct",e.directiveOptionsCorrect="directive-options-correct",e.directiveBodyCorrect="directive-body-correct",e.roleRegistered="role-registered",e.roleKnown="role-known",e.roleBodyCorrect="role-body-correct",e.tocContentsExist="toc-contents-exist",e.validTOCStructure="valid-toc-structure",e.validTOC="valid-toc",e.tocWritten="toc-written",e.imageDownloads="image-downloads",e.imageExists="image-exists",e.imageFormatConverts="image-format-converts",e.imageCopied="image-copied",e.imageFormatOptimizes="image-format-optimizes",e.mathLabelLifted="math-label-lifted",e.mathEquationEnvRemoved="math-equation-env-removed",e.mathEqnarrayReplaced="math-eqnarray-replaced",e.mathAlignmentAdjusted="math-alignment-adjusted",e.mathRenders="math-renders",e.referenceTemplateFills="reference-template-fills",e.identifierIsUnique="identifier-is-unique",e.referenceTargetResolves="reference-target-resolves",e.referenceSyntaxValid="reference-syntax-valid",e.referenceTargetExplicit="reference-target-explicit",e.footnoteReferencesDefinition="footnote-references-definition",e.intersphinxReferencesResolve="intersphinx-references-resolve",e.mystLinkValid="myst-link-valid",e.sphinxLinkValid="sphinx-link-valid",e.rridLinkValid="rrid-link-valid",e.rorLinkValid="ror-link-valid",e.wikipediaLinkValid="wikipedia-link-valid",e.doiLinkValid="doi-link-valid",e.linkResolves="link-resolves",e.linkTextExists="link-text-exists",e.notebookAttachmentsResolve="notebook-attachments-resolve",e.notebookOutputCopied="notebook-output-copied",e.mdastSnippetImports="mdast-snippet-imports",e.includeContentFilters="include-content-filters",e.includeContentLoads="include-content-loads",e.gatedNodesJoin="gated-nodes-join",e.glossaryUsesDefinitionList="glossary-uses-definition-list",e.blockMetadataLoads="block-metadata-loads",e.citationIsUnique="citation-is-unique",e.bibFileExists="bib-file-exists",e.citationRenders="citation-renders",e.codeMetadataLifted="code-metadata-lifted",e.codeMetatagsValid="code-metatags-valid",e.codeLangDefined="code-lang-defined",e.codeMetadataLoads="code-metadata-loads",e.inlineCodeMalformed="inline-code-malformed",e.inlineExpressionRenders="inline-expression-renders",e.staticFileCopied="static-file-copied",e.exportFileCopied="export-file-copied",e.sourceFileCopied="source-file-copied",e.templateFileCopied="template-file-copied",e.staticActionFileCopied="static-action-file-copied",e.pluginLoads="plugin-loads",e.containerChildrenValid="contianer-children-valid"})(R||(R={}));function Dt(e,t){var r;let i=(r=typeof t=="number"?t:Array.isArray(t)?t?.length:Object.keys(t??{}).length)!==null&&r!==void 0?r:0;return e.replace("%s",String(i)).replace(/\((?:([a-z0-9A-Z-]*)\|)?([a-z0-9A-Z-]*)\)/g,i===1?"$1":"$2")}function Me(e){return!["crossReference","cite","footnoteDefinition","footnoteReference"].includes(e.type)}var Bt=new Set(["comment","mystComment"]);function Ut(e,t,r){let i=!1,n,a=[];return Q(e,s=>{if(i&&s.type==="heading"||r&&a.length>=r)return N;if(s.identifier===t&&s.type==="heading"&&(i=!0,n=s.html_id||s.identifier),i)return Bt.has(s.type)||a.push(s),H}),{htmlId:n,nodes:a}}function Ht(e,t,r){var i,n;let a=!1,s=[];return Q(e,o=>{if(a&&o.type==="definitionTerm"){if(s.length>1)return N}else if(a&&o.type!=="definitionDescription")return N;if(o.identifier===t&&o.type==="definitionTerm"&&(s.push(o),a=!0),a)return o.type==="definitionDescription"&&s.push(o),H}),{htmlId:((i=s?.[0])===null||i===void 0?void 0:i.html_id)||((n=s?.[0])===null||n===void 0?void 0:n.identifier),nodes:[{type:"definitionList",key:"dl",children:s.slice(0,r)}]}}function Qt(e,t,r){if(r===0)return{nodes:[]};let i=A(`[identifier=${t}],[key=${t}]`,e).find(n=>Me(n));if(!i)return{nodes:[]};switch(i.type){case"heading":return Ut(e,t,r);case"definitionTerm":return Ht(e,t,r);default:return{htmlId:i.html_id||i.identifier,nodes:[i]}}}var ee;(function(e){e.content="notebook-content",e.code="notebook-code"})(ee||(ee={}));var te;(function(e){e.removeStderr="remove-stderr",e.removeStdout="remove-stdout",e.hideCell="hide-cell",e.hideInput="hide-input",e.hideOutput="hide-output",e.removeCell="remove-cell",e.removeInput="remove-input",e.removeOutput="remove-output"})(te||(te={}));var re;(function(e){e.string="string",e.number="number",e.boolean="boolean",e.parsed="parsed"})(re||(re={}));var ne;(function(e){e.heading="heading",e.equation="equation",e.subequation="subequation",e.figure="figure",e.table="table",e.code="code"})(ne||(ne={}));var ie;(function(e){e.admonition="admonition",e.attention="attention",e.caution="caution",e.danger="danger",e.error="error",e.important="important",e.hint="hint",e.note="note",e.seealso="seealso",e.tip="tip",e.warning="warning"})(ie||(ie={}));export{Zt as a,De as b,Be as c,Ze as d,Ve as e,fe as f,We as g,Je as h,T as i,P as j,Ye as k,Xe as l,Ge as m,Dt as n,D as o,L as p,Ar as q,Sr as r,A as s,Lr as t,Pe as u,Le as v,zt as w,R as x,Me as y,Qt as z,ee as A,re as B,ne as C,ie as D};
