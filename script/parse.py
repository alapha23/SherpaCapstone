
def func():
    f = open('in.txt', 'r')
    s = f.read()

    s=s.replace('\x02', '')
    s=s.replace('  ', '')
    s=s.replace('\n', '')
    s=s.replace('\'', '')
    s=s.replace('\"', '')

    o = open('out.txt', 'w')
    o.write(s)

func()
