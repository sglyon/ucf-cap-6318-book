import{a as i}from"https://ucf-cap-6318.spencerlyon.com/build/_shared/chunk-42FUU6FG.js";import{c as t}from"https://ucf-cap-6318.spencerlyon.com/build/_shared/chunk-2NH4LW52.js";var r=t((o,a)=>{var s=i();a.exports=n;n.displayName="bison";n.aliases=[];function n(e){e.register(s),e.languages.bison=e.languages.extend("c",{}),e.languages.insertBefore("bison","comment",{bison:{pattern:/^(?:[^%]|%(?!%))*%%[\s\S]*?%%/,inside:{c:{pattern:/%\{[\s\S]*?%\}|\{(?:\{[^}]*\}|[^{}])*\}/,inside:{delimiter:{pattern:/^%?\{|%?\}$/,alias:"punctuation"},"bison-variable":{pattern:/[$@](?:<[^\s>]+>)?[\w$]+/,alias:"variable",inside:{punctuation:/<|>/}},rest:e.languages.c}},comment:e.languages.c.comment,string:e.languages.c.string,property:/\S+(?=:)/,keyword:/%\w+/,number:{pattern:/(^|[^@])\b(?:0x[\da-f]+|\d+)/i,lookbehind:!0},punctuation:/%[%?]|[|:;\[\]<>]/}}})}});export{r as a};
