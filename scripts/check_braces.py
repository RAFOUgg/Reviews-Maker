p = r'c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\app.js'
with open(p, 'r', encoding='utf8') as f:
    s = f.read()
open_count = s.count('{')
close_count = s.count('}')
print('braces:', open_count, 'open,', close_count, 'close')
lines = s.splitlines()
ln = 7636
start = max(0, ln-15)
end = min(len(lines)-1, ln+15)
print('--- context lines', start+1, '-', end+1, '---')
for i in range(start, end+1):
    print(f'{i+1:5}: {lines[i]}')
# Find first unmatched close bracket
bal = 0
for idx, ch in enumerate(s):
    if ch == '{': bal += 1
    elif ch == '}': bal -= 1
    if bal < 0:
        upto = s[:idx+1]
        lnum = upto.count('\n') + 1
        print('First unmatched } at line', lnum)
        break
if bal > 0:
    print('Unclosed { remaining:', bal)
elif bal == 0:
    print('Braces balanced')
else:
    print('Extra } detected')
