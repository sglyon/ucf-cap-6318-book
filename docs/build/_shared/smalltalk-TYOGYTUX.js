import{c as i}from"https://ucf-cap-6318.spencerlyon.com/build/_shared/chunk-2NH4LW52.js";var _=i((E,s)=>{function l(e){let n="[a-z][a-zA-Z0-9_]*",a={className:"string",begin:"\\$.{1}"},t={className:"symbol",begin:"#"+e.UNDERSCORE_IDENT_RE};return{name:"Smalltalk",aliases:["st"],keywords:"self super nil true false thisContext",contains:[e.COMMENT('"','"'),e.APOS_STRING_MODE,{className:"type",begin:"\\b[A-Z][A-Za-z0-9_]*",relevance:0},{begin:n+":",relevance:0},e.C_NUMBER_MODE,t,a,{begin:"\\|[ ]*"+n+"([ ]+"+n+")*[ ]*\\|",returnBegin:!0,end:/\|/,illegal:/\S/,contains:[{begin:"(\\|[ ]*)?"+n}]},{begin:"#\\(",end:"\\)",contains:[e.APOS_STRING_MODE,a,e.C_NUMBER_MODE,t]}]}}s.exports=l});export default _();
