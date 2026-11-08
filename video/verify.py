"""Validate delivered movie, inspect every decoded frame and build review media."""
from pathlib import Path
import subprocess,json,hashlib,struct
from PIL import Image,ImageDraw,ImageFont,ImageStat
B=Path(__file__).parent;V=B/'shubham-gupta-site-tour.mp4';O=B/'review';O.mkdir(exist_ok=True)
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(V)]));(O/'ffprobe.json').write_text(json.dumps(probe,indent=2)+'\n');streams=probe['streams'];s=next(s for s in streams if s['codec_type']=='video');assert (s['width'],s['height'])==(1920,1080);assert s['codec_name']=='h264' and s['pix_fmt']=='yuv420p' and s['avg_frame_rate']=='30/1';assert abs(float(probe['format']['duration'])-64)<.04;assert V.stat().st_size<512*1024*1024;assert int(s['nb_frames'])==1920
# Exhaustive decoder integrity pass, not a sample.
p=subprocess.run(['ffmpeg','-v','error','-i',str(V),'-f','null','-'],capture_output=True,text=True);(O/'decode.log').write_text(p.stderr);assert p.returncode==0 and not p.stderr.strip(),p.stderr
# Check MP4 atom placement (faststart).
atoms=[]
with V.open('rb') as f:
 while True:
  pos=f.tell();h=f.read(8)
  if len(h)<8:break
  size,kind=struct.unpack('>I4s',h);kind=kind.decode('ascii','replace');header=8
  if size==1:size=struct.unpack('>Q',f.read(8))[0];header=16
  if size==0:size=V.stat().st_size-pos
  atoms.append({'type':kind,'offset':pos,'bytes':size});f.seek(pos+size)
assert next(a['offset']for a in atoms if a['type']=='moov')<next(a['offset']for a in atoms if a['type']=='mdat')
# Every frame's actual website viewport (chrome excluded), downsampled for robust no-solid/black checks.
cmd=['ffmpeg','-v','error','-i',str(V),'-vf','crop=1920:1000:0:80,scale=160:84,format=gray','-f','rawvideo','pipe:1'];raw=subprocess.check_output(cmd);frameBytes=84*160;assert len(raw)==1920*frameBytes
stats=[]
for i in range(1920):
 a=Image.frombytes('L',(160,84),raw[i*frameBytes:(i+1)*frameBytes]);lo,hi=a.getextrema();st=ImageStat.Stat(a);stats.append({'frame':i,'time':i/30,'min':lo,'max':hi,'std':st.stddev[0],'mean':st.mean[0]})
solid=[r for r in stats if r['max']-r['min']<3 or r['std']<.35];assert not solid,solid
(O/'all-frame-stats.json').write_text(json.dumps({'frames':len(stats),'solidOrBlankFrames':solid,'minimumViewportStd':min(r['std']for r in stats),'statistics':stats},indent=2)+'\n')
# Poster and real exported-frame contact sheets.
subprocess.run(['ffmpeg','-y','-v','error','-ss','13','-i',str(V),'-frames:v','1',str(B/'poster.png')],check=True)
times=[0,4,8,13,18,24,29,34,39,43,46,48,50.9,51.8,54,57,58.5,60.5,62.5,63.5];font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15);W=480;H=298;sheet=Image.new('RGB',(W*4,H*5),'#111820');draw=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
 p=O/f'final-{t:04.1f}.png';subprocess.run(['ffmpeg','-y','-v','error','-ss',str(t),'-i',str(V),'-frames:v','1',str(p)],check=True);im=Image.open(p).convert('RGB');im.thumbnail((W,270));x=i%4*W;y=i//4*H;sheet.paste(im,(x,y+28));draw.text((x+10,y+7),f'{t:g}s',font=font,fill='#dce7e8')
sheet.save(B/'contact-sheet.jpg',quality=91)
source=json.loads((B/'source-manifest.json').read_text());mismatched=[n for n,h in source['files'].items() if hashlib.sha256((B/'assets/site'/n).read_bytes()).hexdigest()!=h];assert not mismatched
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();manifest={'file':V.name,'sha256':sha(V),'bytes':V.stat().st_size,'durationSeconds':float(probe['format']['duration']),'width':s['width'],'height':s['height'],'fps':s['avg_frame_rate'],'frames':int(s['nb_frames']),'codec':s['codec_name'],'profile':s.get('profile'),'pixelFormat':s['pix_fmt'],'bitrate':int(probe['format']['bit_rate']),'audioStreams':sum(x['codec_type']=='audio' for x in streams),'faststart':True,'allFramesDecoded':True,'solidOrBlankFrames':0,'preservedSiteFiles':len(source['files']),'capture':'Faithful offline browser-style rendering of exact v9.6; authored neutral chrome/cursor/edit; not hardware real-time speed','hyperframesVersion':'0.9.21','postedToX':False,'atoms':atoms}
(B/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');(B/'SHA256SUMS').write_text(''.join(sha(B/n)+'  '+n+'\n'for n in[V.name,'poster.png','contact-sheet.jpg','manifest.json']));print(json.dumps(manifest,indent=2))
