const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, '..', 'app.js');
const s = fs.readFileSync(p, 'utf8');
let open = 0, close = 0;
for (let i=0;i<s.length;i++){
  if (s[i]==='{') open++;
  if (s[i]==='}') close++;
}
console.log('braces:', open, 'open,', close, 'close');
// show around line
const lines = s.split(/\r?\n/);
const ln = 7636-1; // zero-based
const start = Math.max(0, ln-10);
const end = Math.min(lines.length-1, ln+10);
console.log('--- context lines', start+1, '-', end+1, '---');
for (let i=start;i<=end;i++){
  console.log(('    '+(i+1)).slice(-6)+': '+lines[i]);
}
// find first unmatched close bracket position
let balance=0;
for (let i=0;i<s.length;i++){
  if (s[i]==='{') balance++;
  else if (s[i]==='}') balance--;
  if (balance<0){
    const upto = s.slice(0,i+1);
    const lines2 = upto.split(/\r?\n/);
    console.log('First unmatched } at line', lines2.length);
    break;
  }
}
if (balance>0) console.log('Unclosed { remaining:', balance);
else if (balance===0) console.log('Braces balanced');
else console.log('Extra } detected');
