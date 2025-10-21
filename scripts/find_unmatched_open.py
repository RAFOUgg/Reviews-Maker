p = r'c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\app.js'
with open(p,'r',encoding='utf8') as f:
    lines=f.readlines()
balance=0
stack=[]
for i,l in enumerate(lines):
    for ch in l:
        if ch=='{':
            balance+=1
            stack.append((i+1,l.strip()))
        elif ch=='}':
            balance-=1
            if stack: stack.pop()
print('final balance',balance)
if balance>0 and stack:
    print('Last unmatched { at line', stack[-1][0])
    print('Line content:', stack[-1][1])
    # show context
    start=max(0,stack[-1][0]-6)
    end=min(len(lines), stack[-1][0]+6)
    print('--- context ---')
    for j in range(start,end):
        print(f'{j+1:5}: {lines[j].rstrip()}')
else:
    print('No unmatched opens found')
