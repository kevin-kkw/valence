"""Bundle local source into a standalone HTML; no external services required."""
import pathlib,re,base64,sys,mimetypes
root=pathlib.Path(__file__).resolve().parents[1]/'dist'
cache={}
def module(name):
    if name in cache:return cache[name]
    source=(root/name).read_text()
    source=re.sub(r"(['\"])\./([^'\"]+\.mjs)\1",lambda m:"'"+module(m.group(2))+"'",source)
    uri='data:text/javascript;base64,'+base64.b64encode(source.encode()).decode()
    cache[name]=uri
    return uri
def inline_asset(match):
    path=(root/match.group(2)).resolve()
    if not path.is_relative_to(root.resolve()):raise ValueError('Asset outside dist: '+str(path))
    mime=mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    return 'url("data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()+'")'
css=re.sub(r"url\(\s*(['\"]?)(assets/[^)'\"]+)\1\s*\)",inline_asset,(root/'style.css').read_text())
html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>').replace('src="app.mjs"','src="'+module('app.mjs')+'"')
out=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else root.parent/'VALENCE-local.html')
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(html)
assert 'src="app.mjs"' not in html and 'href="style.css"' not in html
print(f'{out}: {out.stat().st_size} bytes, {len(cache)} embedded modules')
