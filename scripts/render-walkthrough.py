#!/usr/bin/env python3
"""Render Planvisiq's narrated, perspective-projected 3D tour from saved natural narration.
Requires Python + Pillow + NumPy, FFmpeg and the included media/narration MP3 files.
Run from any directory: python3 scripts/render-walkthrough.py
"""
from pathlib import Path
import json, math, subprocess, tempfile, wave, textwrap
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'media'; OUT.mkdir(exist_ok=True)
DATA=json.loads((ROOT/'scripts/walkthrough.json').read_text())
W,H,FPS=1920,1080,24
FONT=ROOT/'vendor/fonts/DejaVuSans.ttf'; BOLD=ROOT/'vendor/fonts/DejaVuSans-Bold.ttf'
fonts={}
def font(size,bold=False):
 key=(size,bold)
 if key not in fonts: fonts[key]=ImageFont.truetype(str(BOLD if bold else FONT),size)
 return fonts[key]
INK=(24,62,51); GREEN=(36,107,80); MUTED=(100,117,105); LIME=(212,230,168)
def run(args): subprocess.run(args,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
def wrap(txt,maxwidth,size,bold=False):
 lines=['']
 for word in txt.split():
  test=(lines[-1]+' '+word).strip()
  if font(size,bold).getlength(test)>maxwidth and lines[-1]: lines.append(word)
  else: lines[-1]=test
 return lines
# Grounded, illustrative panels; all figures are sample data, not a screen recording.
def panel(scene):
 im=Image.new('RGB',(620,430),'#fffefb');d=ImageDraw.Draw(im)
 d.rectangle((0,0,620,58),fill='#edf2e7');d.text((24,17),'Planvisiq',font=font(21,True),fill=INK)
 d.text((455,22),'SAMPLE PROJECT',font=font(11,True),fill=MUTED)
 d.line((0,58,620,58),fill='#dfe5db',width=2)
 title={'dashboard':'Project overview','team':'Your organisation','project':'New project','files':'Files & source records','review':'Check the results','report':'Project close-out','slides':'Presentation studio','assistant':'Project assistant','export':'Ready to share'}[scene]
 d.text((24,80),title,font=font(27,True),fill=INK)
 if scene=='dashboard':
  for x,k,v in [(24,'OVERALL PROGRESS','76.3%'),(330,'ACTIVITIES COMPLETE','32 / 48')]:
   d.rounded_rectangle((x,130,x+265,232),12,fill='#edf3e9');d.text((x+15,145),k,font=font(11,True),fill=MUTED);d.text((x+15,174),v,font=font(35,True),fill=GREEN)
  for y in [270,310,350,390]:d.line((30,y,580,y),fill='#e6ece3',width=2)
  d.line([(35,383),(118,370),(202,345),(286,322),(369,280),(453,265),(577,245)],fill=GREEN,width=5)
  for x,y in [(35,383),(202,345),(369,280),(577,245)]:d.ellipse((x-5,y-5,x+5,y+5),fill=GREEN)
 elif scene=='team':
  for y,name,role,c in [(145,'Company owner','Owner',GREEN),(224,'Planning team','Planner',(105,138,84)),(303,'Project oversight','Viewer',(174,143,99))]:
   d.ellipse((26,y,76,y+50),fill=c);d.text((95,y+4),name,font=font(21,True),fill=INK);d.text((95,y+31),'Individual user ID',font=font(14),fill=MUTED);d.rounded_rectangle((450,y+8,590,y+43),9,fill='#edf2e7');d.text((464,y+15),role,font=font(17),fill=INK)
 elif scene=='project':
  for y,label,val in [(135,'Project name','Cape Town shutdown'),(225,'Client','Example client'),(315,'Reporting date','Choose your cut-off date')]:
   d.text((28,y),label,font=font(14,True),fill=MUTED);d.rounded_rectangle((25,y+25,590,y+72),7,fill='#f0f4eb',outline='#dfe5db');d.text((40,y+35),val,font=font(21),fill=INK)
 elif scene in ['files','review']:
  rows=[('Activity schedule.xlsx','Match columns'),('Progress update.csv','Confirm import'),('Supporting documents','Keep with project')] if scene=='files' else [('Missing progress','Review record'),('Planned / actual dates','Check dates'),('Confirmed records','Ready for charts')]
  for i,(name,action) in enumerate(rows):
   y=140+i*83;d.rounded_rectangle((24,y,595,y+68),9,fill='#f0f4eb');d.text((42,y+12),name,font=font(20,True),fill=INK);d.text((42,y+39),action,font=font(15),fill=GREEN)
 elif scene=='report':
  d.rounded_rectangle((25,130,260,390),8,fill='#edf2e7');d.text((42,148),'PROJECT SUMMARY',font=font(13,True),fill=GREEN)
  for i,l in enumerate(['Completed work','Progress overview','Key exceptions','Your commentary']):d.text((43,200+i*40),l,font=font(17),fill=INK)
  d.text((290,140),'Progress by discipline',font=font(16,True),fill=INK)
  for i,h in enumerate([115,170,140,205]):d.rounded_rectangle((300+i*65,380-h,341+i*65,380),5,fill=[GREEN,'#8dab77','#b3ce96','#d1e3b2'][i])
 elif scene=='slides':
  for i in range(3):
   y=135+i*85;d.rounded_rectangle((25,y,137,y+65),7,fill='#e9f0e2',outline=GREEN if i==0 else '#dfe5db',width=2);d.text((38,y+20),f'0{i+1}',font=font(21,True),fill=GREEN)
  d.rounded_rectangle((158,135,593,361),10,fill=INK);d.text((185,160),'Shutdown overview',font=font(25,True),fill='white')
  for i,h in enumerate([55,92,115,135]):d.rectangle((200+i*79,335-h,244+i*79,335),fill=['#d4e6a8','#8eae7c','#aacb94','#e9f1dc'][i])
  d.text((160,382),'Edit  /  Reorder  /  Present',font=font(16),fill=MUTED)
 elif scene=='assistant':
  d.rounded_rectangle((25,135,590,205),14,fill='#edf2e7');d.text((43,157),'What needs attention?',font=font(24,True),fill=INK)
  d.rounded_rectangle((25,225,590,367),14,fill=GREEN)
  for i,l in enumerate(['Review overdue activities.','Check missing progress values.','Open the source before sharing.']):d.text((43,245+i*37),l,font=font(20),fill='white')
  d.text((25,389),'Local guidance • linked to your data',font=font(15),fill=MUTED)
 elif scene=='export':
  for i,(fmt,desc) in enumerate([('PDF','Finished report'),('PPTX','Editable slides'),('XLSX','Workbook'),('CSV','Raw figures')]):
   x=25+(i%2)*292;y=135+(i//2)*125;d.rounded_rectangle((x,y,x+270,y+105),12,fill='#edf2e7');d.text((x+18,y+15),fmt,font=font(31,True),fill=GREEN);d.text((x+18,y+62),desc,font=font(18),fill=INK)
 return im
TEXTURES=[panel(c['scene']) for c in DATA]
# Gradient and ground shadows are cached. Geometry is lit and perspective-projected per frame.
y,x=np.mgrid[0:H,0:W];glow=np.exp(-((x-950)**2+(y-320)**2)/130000)
base=np.empty((H,W,3),dtype=np.uint8)
for k,(a,b) in enumerate(zip([248,249,244],[225,237,209])):base[:,:,k]=a+(b-a)*glow
BASE=Image.fromarray(base)
shadow=Image.new('RGBA',(W,H));ds=ImageDraw.Draw(shadow);ds.ellipse((695,475,1220,555),fill=(28,66,45,30));shadow=shadow.filter(ImageFilter.GaussianBlur(23));BASE.paste(shadow,(0,0),shadow)
from walkthrough_visuals import render_frame
def frame(ci,sec,duration,captions):
 return render_frame(ci,DATA[ci],sec,duration,captions)

def stamp(seconds):
 ms=round(seconds*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}'
with tempfile.TemporaryDirectory(prefix='planvisiq-video-') as tmp:
 tmp=Path(tmp);clips=[];chapters=[];allcaps=[];elapsed=0;contact=[]
 for ci,ch in enumerate(DATA):
  # Reuse the saved natural voiceover. No API calls or robotic fallback.
  voicefile=OUT/'narration'/f'{ci+1:02}.mp3'
  if not voicefile.exists():raise FileNotFoundError(f'Missing saved narration: {voicefile}')
  wav=tmp/f'natural-{ci}.wav'
  run(['ffmpeg','-y','-v','error','-i',str(voicefile),'-ar','48000','-ac','1','-c:a','pcm_s16le',str(wav)])
  with wave.open(str(wav)) as w:
   dur=w.getnframes()/w.getframerate();pcm=w.readframes(w.getnframes())
  audio_parts=[pcm];captions=[];at=.45+dur
  # Snap caption breaks to nearby pauses to keep the natural delivery intact.
  samples=np.frombuffer(pcm,dtype=np.int16).astype(float)
  block=480;energy=np.array([np.sqrt(np.mean(v*v)) for v in np.array_split(samples[:len(samples)//block*block],len(samples)//block)])
  spoken=np.where(energy>150)[0];begin=float(spoken[0]/100) if len(spoken) else 0;finish=float(spoken[-1]/100) if len(spoken) else dur
  pauses=[];gap=None
  for j,e in enumerate(energy):
   if e<150 and gap is None:gap=j
   elif e>=150 and gap is not None:
    if j-gap>=12:pauses.append((j+gap)/200)
    gap=None
  import re
  sentences=re.split(r'(?<=[.!?])\s+',ch['voice']);chunks=[]
  for sentence in sentences:
   words=sentence.split();parts=max(1,math.ceil(len(words)/17));chunks.extend(' '.join(v) for v in np.array_split(words,parts))
  weights=[len(v) for v in chunks];total=sum(weights);position=begin;consumed=0
  for j,text in enumerate(chunks):
   consumed+=weights[j];target=begin+(finish-begin)*consumed/total
   candidates=[t for t in pauses if position+.7<t<finish and abs(t-target)<1.2]
   stop=min(candidates,key=lambda t:abs(t-target)) if candidates and j<len(chunks)-1 else target
   stop=max(position+.3,stop);captions.append({'start':.45+position,'end':.45+stop,'text':text});position=stop
  duration=math.ceil((at+.55)*FPS)/FPS;audio=tmp/f'chapter-{ci}.wav'
  with wave.open(str(audio),'wb') as w:
   w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000);w.writeframes(b'\0'*int(.45*48000)*2+b''.join(audio_parts)+b'\0'*int((duration-at)*48000)*2)
  ch['start']=round(elapsed,3);ch['end']=round(elapsed+duration,3);ch['duration']=round(duration,3);chapters.append(ch)
  for cue in captions:allcaps.append({'start':elapsed+cue['start'],'end':elapsed+cue['end'],'text':cue['text']})
  representative=frame(ci,3,duration,captions);contact.append(representative.resize((640,360)))
  if ci==0:representative.save(OUT/'planvisiq-walkthrough-poster.jpg',quality=92)
  clip=tmp/f'clip-{ci}.mp4';clips.append(clip)
  proc=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i',str(audio),'-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-t',str(duration),str(clip)],stdin=subprocess.PIPE)
  try:
   for n in range(round(duration*FPS)):proc.stdin.write(frame(ci,n/FPS,duration,captions).tobytes())
  finally:proc.stdin.close()
  if proc.wait()!=0:raise RuntimeError('Video encoding failed')
  elapsed+=duration;print(f'{ci+1}/{len(DATA)} rendered: {ch["title"]} ({duration:.1f}s)',flush=True)
 concat=tmp/'concat.txt';concat.write_text('\n'.join(f"file '{v}'" for v in clips))
 run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart',str(OUT/'planvisiq-walkthrough.mp4')])
 (OUT/'walkthrough-chapters.json').write_text(json.dumps(chapters,ensure_ascii=False,indent=2)+'\n')
 vtt='WEBVTT\n\n'+'\n\n'.join(f'{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for c in allcaps)+'\n'
 (OUT/'planvisiq-walkthrough.vtt').write_text(vtt)
 cs=Image.new('RGB',(1280,360*5),'white')
 for i,im in enumerate(contact):cs.paste(im,((i%2)*640,(i//2)*360))
 cs.save(str(Path(tempfile.gettempdir())/'planvisiq-walkthrough-contact-sheet.jpg'),quality=88)
 print(f'Complete: {elapsed:.1f} seconds; {len(allcaps)} caption cues.',flush=True)
