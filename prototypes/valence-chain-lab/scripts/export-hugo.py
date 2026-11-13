"""Export the current game for Hugo static hosting with fingerprinted JS/CSS."""
import argparse, hashlib, json, pathlib, re
parser=argparse.ArgumentParser()
parser.add_argument('destination',type=pathlib.Path)
parser.add_argument('--source-commit',required=True)
args=parser.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]/'dist'
out=args.destination
if out.exists() and any(out.iterdir()):
    raise SystemExit('Destination must be empty; export to a new directory.')
(out/'assets').mkdir(parents=True,exist_ok=True)
modules={};visiting=set();files={}
def emit(name,content):
    data=content.encode();(out/name).write_bytes(data)
    files[name]=hashlib.sha256(data).hexdigest()
def module(name):
    if name in modules:return modules[name]
    if name in visiting:raise ValueError('Cyclic imports require a bundler: '+name)
    visiting.add(name)
    source=(root/name).read_text()
    source=re.sub(r"(['\"])\./([^'\"]+\.mjs)\1",lambda m:"'./"+module(m.group(2))+"'",source)
    filename=pathlib.Path(name).stem+'.'+hashlib.sha256(source.encode()).hexdigest()[:12]+'.js'
    emit('assets/'+filename,source);modules[name]=filename;visiting.remove(name)
    return filename
entry=module('app.mjs')
css=(root/'style.css').read_text();cssname='style.'+hashlib.sha256(css.encode()).hexdigest()[:12]+'.css';emit('assets/'+cssname,css)
html=(root/'index.html').read_text().replace('href="style.css"','href="assets/'+cssname+'"').replace('src="app.mjs"','src="assets/'+entry+'"').replace('本地 V','V')
version=re.search(r'V(\d+\.\d+)',html).group(1)
html=html.replace('</head>','<meta name="valence-version" content="'+version+'"></head>')
emit('index.html',html)
manifest={'game':'VALENCE','version':version,'source_repository':'https://github.com/kevin-kkw/valence','source_commit':args.source_commit,'entry':'index.html','files':files}
(out/'release.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'destination':str(out),'version':version,'modules':len(modules),'files':len(files)+1,'bytes':sum(p.stat().st_size for p in out.rglob('*') if p.is_file())}))
