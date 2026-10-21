"""High-resolution, animated product scenes for the Planvisiq walkthrough.
All interface illustrations and figures are fictional. Geometry uses a genuine
perspective projection; the working app itself remains plain HTML/CSS/JS.
"""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
W,H=1920,1080
GREEN='#246b50';INK='#173c31';MUTED='#718278';LINE='#dfe7df';LIME='#cde8a2';PALE='#f0f5ed'
FONTS={}
def ft(n,b=False):
 k=(n,b)
 if k not in FONTS:FONTS[k]=ImageFont.truetype(str(ROOT/'vendor/fonts'/('DejaVuSans-Bold.ttf' if b else 'DejaVuSans.ttf')),n)
 return FONTS[k]
def ease(x):x=max(0,min(1,x));return x*x*(3-2*x)
def txt(d,xy,text,size=20,color=INK,b=False):d.text(xy,text,font=ft(size,b),fill=color)
def box(d,xy,fill='white',radius=14,outline=None,width=1):d.rounded_rectangle(xy,radius,fill=fill,outline=outline,width=width)
def lines(d,x,y,text,width,size=19,color=MUTED,spacing=28,b=False):
 words=text.split();line='';n=0
 for word in words:
  test=(line+' '+word).strip()
  if ft(size,b).getlength(test)>width and line:txt(d,(x,y+n*spacing),line,size,color,b);n+=1;line=word
  else:line=test
 txt(d,(x,y+n*spacing),line,size,color,b)
def button(d,x,y,label,w=175,active=True):
 box(d,(x,y,x+w,y+44),GREEN if active else PALE,9);txt(d,(x+16,y+11),label,17,'white' if active else INK,True)
def heading(d,label,small):
 txt(d,(226,91),label,30,INK,True);txt(d,(226,132),small,16,MUTED)
def card(d,x,y,w,h,title,value):
 box(d,(x,y,x+w,y+h),'white',12,LINE);txt(d,(x+20,y+17),title,15,MUTED);txt(d,(x+20,y+46),value,35,INK,True)
def fields(d,x,y,label,value,w=640,typed=1):
 txt(d,(x,y),label,15,MUTED,True);box(d,(x,y+28,x+w,y+82),'white',8,LINE);txt(d,(x+18,y+44),value[:max(0,int(len(value)*typed))],21,INK)
def focus(d,rect,t):
 # restrained pointer and click ring, only around the action being explained
 x0,y0,x1,y1=rect;box(d,(x0-5,y0-5,x1+5,y1+5),None,12,'#93bd69',3)
 x=x1-20;y=y1-12;r=8+10*(.5+.5*math.sin(t*2.5));d.ellipse((x-r,y-r,x+r,y+r),outline='#b2cf8a',width=2)
 d.polygon([(x,y),(x+7,y+27),(x+13,y+18),(x+24,y+15)],fill=INK,outline='white')
def app(ci,ch,sec,duration):
 im=Image.new('RGB',(1400,670),'#f6f8f3');d=ImageDraw.Draw(im)
 phase=min(2,int(sec/max(1,duration)*3));local=(sec/max(1,duration)*3)%1;growth=ease(sec/2.4)
 # Browser chrome, permanent project navigation and consistent tool positions.
 d.rectangle((0,0,1400,37),fill='#e6ece4')
 for i,col in enumerate(['#b7c4b6','#c9d3c6','#d7dfd4']):d.ellipse((18+i*19,13,27+i*19,22),fill=col)
 txt(d,(440,10),'PLANVISIQ   /   YOUR PROJECT WORKSPACE',12,MUTED,True)
 d.rectangle((0,37,193,670),fill='white');d.line((193,37,193,670),fill=LINE,width=2)
 box(d,(23,60,51,88),GREEN,6);txt(d,(31,60),'p',22,'white',True);txt(d,(62,62),'Planvisiq',21,INK,True)
 txt(d,(23,115),'EXAMPLE PLANNING',11,MUTED,True)
 nav=['My project','Files','Reports','Slides','Activities','Assistant'];active={'team':'Organisation','project':'My project','files':'Files','review':'Files','dashboard':'My project','report':'Reports','slides':'Slides','assistant':'Assistant','export':'Settings'}[ch['scene']]
 for i,name in enumerate(nav):
  yy=158+i*49
  if name==active:box(d,(13,yy-7,179,yy+33),PALE,8)
  d.rectangle((28,yy+5,39,yy+16),outline=GREEN,width=2);txt(d,(51,yy),name,16,GREEN if name==active else MUTED,name==active)
 for i,name in enumerate(['Organisation','Settings','Learn Planvisiq']):txt(d,(24,530+i*37),name,14,GREEN if name==active else MUTED,name==active)
 d.line((194,67,1400,67),fill=LINE);txt(d,(226,47),f'Workspace   /   {active}',13,MUTED);txt(d,(1150,47),'SAMPLE PROJECT',12,GREEN,True)
 scene=ch['scene']
 if scene=='dashboard':
  heading(d,'Cape Town shutdown','A connected view of the work, at your reporting date.');button(d,1194,91,'New project',174)
  for i,(k,v) in enumerate([('Overall progress',f'{76.3*growth:.1f}%'),('Activities complete',f'{round(32*growth)} / 48'),('Work remaining','16 activities'),('Reporting date','10 OCT')]):card(d,226+i*289,179,268,114,k,v)
  box(d,(226,315,956,624),'white',12,LINE);txt(d,(248,336),'Progress over time',21,INK,True);txt(d,(703,341),'Planned   ·   Actual',14,MUTED)
  for yy in [400,450,500,550,596]:d.line((252,yy,928,yy),fill=LINE)
  pts=[(254,585),(365,571),(477,540),(589,490),(700,468),(813,419),(925,395)];n=max(2,int(len(pts)*growth));d.line(pts[:n],fill=GREEN,width=5)
  for x,y in pts[:n]:d.ellipse((x-5,y-5,x+5,y+5),fill=GREEN)
  box(d,(979,315,1368,624),'white',12,LINE);txt(d,(1002,338),'Progress by discipline',20,INK,True)
  for i,(label,value) in enumerate([('Mechanical',.81),('Electrical',.72),('Civil',.87),('Instrumentation',.63)]):
   y=385+i*56;txt(d,(1002,y),label,15,MUTED);box(d,(1002,y+25,1340,y+35),PALE,5);box(d,(1002,y+25,1002+int(338*value*growth),y+35),GREEN,5)
  if ci==5:focus(d,[(1194,91,1368,135),(979,315,1368,624),(13,347,179,386)][phase],sec)
 elif scene=='team':
  heading(d,'Your organisation','Each person has their own role and user ID.');button(d,1184,91,'Add a person',184)
  for i,(name,role,id_) in enumerate([('Alex Morgan','Owner','PVQ-001'),('Sam Jacobs','Planner','PVQ-002'),('Leigh Naidoo','Viewer','PVQ-003')]):
   y=190+i*105;box(d,(226,y,1368,y+85),'white',12,LINE);d.ellipse((247,y+18,296,y+67),fill=[GREEN,'#89aa70','#b39b70'][i]);txt(d,(307,y+18),name,21,INK,True);txt(d,(307,y+48),id_,14,MUTED);button(d,1148,y+20,role,180,False)
  box(d,(226,527,1368,624),PALE,12);txt(d,(249,548),'Company plan + a licence for each active person',21,INK,True);txt(d,(249,584),'Account setup and billing are previews in this frontend.',16,MUTED)
  focus(d,[(1184,91,1368,135),(1148,315,1328,359),(226,527,1368,624)][phase],sec)
 elif scene=='project':
  heading(d,'Create a project','Keep each job’s files, reports and presentations together.')
  for i,(label,value) in enumerate([('Project name','Cape Town shutdown'),('Client','Example client'),('Reporting date','10 October 2026')]):fields(d,250,182+i*109,label,value,775,ease((sec-i*2)/2))
  button(d,250,550,'Create project',190);box(d,(1080,182,1368,595),PALE,15)
  txt(d,(1105,210),'ONE PROJECT',15,GREEN,True)
  for i,v in enumerate(['Source files','Progress charts','Saved reports','Slide decks']):txt(d,(1105,270+i*64),v,22,INK,True)
  focus(d,[(250,210,1025,264),(250,319,1025,373),(250,550,440,594)][phase],sec)
 elif scene=='files':
  heading(d,'Bring your project files','Start with Excel or CSV, then check the column matches.')
  if phase==0:
   box(d,(245,180,1347,560),'white',18,LINE,2);txt(d,(557,240),'Drop your files here',34,INK,True);txt(d,(549,295),'Excel · CSV · Supporting documents',19,MUTED);button(d,660,351,'Upload files',190)
   xx=int(300+350*ease(sec/5));yy=int(467-51*ease(sec/5));box(d,(xx,yy,xx+290,yy+76),PALE,10,GREEN,2);txt(d,(xx+21,yy+13),'XLSX',15,GREEN,True);txt(d,(xx+21,yy+39),'Activity schedule.xlsx',18,INK,True);focus(d,(660,351,850,395),sec)
  else:
   txt(d,(249,181),'Confirm your columns',24,INK,True)
   for i,(left,right) in enumerate([('Activity ID','Activity identifier'),('Activity name','Task name'),('Progress','Progress %'),('Planned finish','Planned finish date')]):
    y=234+i*69;fields(d,250,y-26,'',left,420);txt(d,(699,y+17),'→',28,GREEN);fields(d,760,y-26,'',right,560)
   button(d,1110,558,'Confirm import',218);focus(d,(760,234+phase*69,1320,290+phase*69) if phase==1 else (1110,558,1328,602),sec)
 elif scene=='review':
  heading(d,'Check the results','Resolve missing values before you share the figures.')
  for i,v in enumerate(['Activity','Progress','Planned finish','Check']):txt(d,([249,720,929,1177][i],188),v,16,MUTED,True)
  rows=[('Inspect vessel','Missing' if phase<2 else '80%','10 OCT','Review' if phase<2 else 'Checked'),('Check valve','100%','09 OCT','Checked'),('Close out records','60%','11 OCT','Checked')]
  for i,row in enumerate(rows):
   y=225+i*84;box(d,(226,y,1368,y+69),'#fff2db' if i==0 and phase<2 else 'white',10,LINE)
   for j,v in enumerate(row):txt(d,([249,720,929,1177][j],y+24),v,19,INK,j==0)
  fields(d,250,508,'Progress for selected activity','80' if phase else '',440);button(d,1112,548,'Save new version',230);focus(d,(250,536,690,590) if phase<2 else (1112,548,1342,592),sec)
 elif scene=='report':
  heading(d,'Project close-out','Build a report from your confirmed project records.')
  for i,label in enumerate(['Progress update','Weekly report','Close-out pack']):button(d,226,185+i*62,label,300,i==2)
  txt(d,(230,404),'Your commentary',17,INK,True);box(d,(226,440,526,588),'white',10,LINE);comment='Completed work and remaining actions are ready for review.';lines(d,243,456,comment[:int(len(comment)*ease((sec-4)/5))],266,17,MUTED,26)
  box(d,(565,177,1368,625),'#e7eee5',13);box(d,(617,194,1318,607),'white',2)
  txt(d,(648,225),'CAPE TOWN SHUTDOWN',13,GREEN,True);txt(d,(648,259),'Project close-out',36,INK,True)
  for i,(label,value) in enumerate([('Overall progress','76.3%'),('Activities complete','32 / 48')]):txt(d,(648+i*318,329),label,15,MUTED);txt(d,(648+i*318,358),value,35,INK,True)
  for i,h in enumerate([83,128,106,151,177]):box(d,(650+i*117,569-h,711+i*117,569),[GREEN,'#7c9f68','#abc88e','#416e54','#c5dca9'][i],6)
  focus(d,[(226,309,526,353),(226,440,526,588),(617,194,1318,607)][phase],sec)
 elif scene=='slides':
  heading(d,'Presentation studio','Create the deck, tell the story, present with confidence.');button(d,1204,91,'Present',164)
  for i,title in enumerate(['Overview','Progress','Next steps']):
   y=181+i*133;box(d,(226,y,411,y+112),INK if i==phase else 'white',9,GREEN if i==phase else LINE,2);txt(d,(243,y+18),f'0{i+1}',16,LIME if i==phase else GREEN,True);txt(d,(243,y+64),title,20,'white' if i==phase else INK,True)
  box(d,(445,178,1368,589),INK,12);txt(d,(482,215),'CAPE TOWN SHUTDOWN',14,LIME,True)
  if phase==0:
   txt(d,(482,276),'The work. The progress.',42,'white',True);txt(d,(482,337),'The result.',53,LIME,True);txt(d,(484,516),'Project close-out • Stakeholder briefing',20,'#a8c0ad')
  elif phase==1:
   txt(d,(482,264),'Progress by discipline',34,'white',True)
   for i,h in enumerate([105,166,132,197]):box(d,(511+i*198,548-h,620+i*198,548),[LIME,'#729c69','#aacb8f','#e3edce'][i],9)
  else:
   txt(d,(482,264),'What happens next',37,'white',True)
   for i,t in enumerate(['Confirm outstanding actions','Review the final records','Share the approved pack']):txt(d,(487,346+i*65),f'0{i+1}   {t}',24,LIME if i==0 else 'white')
  txt(d,(450,617),'Speaker notes     /     Themes     /     Export PowerPoint',18,MUTED);focus(d,(1204,91,1368,135) if phase==2 else (226,181+phase*133,411,293+phase*133),sec)
 elif scene=='assistant':
  heading(d,'Project assistant','Explore the figures, then check the supporting source.')
  box(d,(226,181,754,625),'white',12,LINE);txt(d,(251,210),'Your project',23,INK,True)
  for i,(name,value) in enumerate([('Progress','76.3%'),('Complete','32 / 48'),('Source','Activity schedule')]):txt(d,(255,277+i*96),name,16,MUTED);txt(d,(255,308+i*96),value,31,INK,True)
  box(d,(787,180,1368,625),'white',12,LINE);txt(d,(812,202),'Assistant',22,INK,True);box(d,(813,250,1340,310),PALE,11);txt(d,(833,267),'What needs attention?',22,INK,True)
  content='Review overdue activities and missing progress values. Check the source before adding commentary to your report.'
  if sec>2:lines(d,818,345,content[:int(len(content)*ease((sec-2)/5))],500,21,INK,33)
  button(d,813,518,'Open source',205,False);txt(d,(814,591),'Local guidance · Source-linked figures',14,MUTED);focus(d,[(813,250,1340,310),(808,335,1340,465),(813,518,1018,562)][phase],sec)
 else:
  heading(d,'Ready to share','Choose the format that fits the next conversation.')
  formats=[('PDF','Finished report'),('PPTX','Editable slides'),('XLSX','Excel workbook'),('CSV','Raw figures')]
  for i,(fmt,desc) in enumerate(formats):
   x=226+i*289;box(d,(x,203,x+267,463),'white',14,GREEN if (i==phase and phase<2) else LINE,2);box(d,(x+25,229,x+101,311),PALE,9);txt(d,(x+37,258),fmt,21,GREEN,True);txt(d,(x+25,346),desc,22,INK,True);txt(d,(x+25,404),'Download ↓',18,GREEN,True)
  box(d,(226,512,1368,619),INK,13);txt(d,(251,536),'Keep a workspace backup',26,'white',True);txt(d,(251,578),'Settings → Export workspace backup → a portable ZIP of your project',18,'#b4cbb6')
  focus(d,(226+phase*289,203,493+phase*289,463) if phase<2 else (226,512,1368,619),sec)
 return im
# A soft-lit studio, deliberately unlike the previous flat card stack.
y,x=np.mgrid[0:H,0:W];glow=np.exp(-((x-1000)**2/(850**2)+(y-550)**2/(650**2)))
a=np.zeros((H,W,3),dtype=np.uint8)
for k,(base,add) in enumerate([(8,17),(26,32),(21,23)]):a[:,:,k]=base+add*glow
BASE=Image.fromarray(a)
shadow=Image.new('RGBA',(W,H));ImageDraw.Draw(shadow).ellipse((215,816,1710,989),fill=(0,0,0,100));shadow=shadow.filter(ImageFilter.GaussianBlur(35));BASE.paste(shadow,(0,0),shadow)
def render_frame(ci,ch,sec,duration,captions):
 im=BASE.copy();d=ImageDraw.Draw(im);progress=ease(sec/1.6)
 box(d,(73,49,116,92),LIME,10);txt(d,(86,48),'p',33,INK,True);txt(d,(133,53),'Planvisiq',29,'white',True)
 txt(d,(1417,56),f'{ci+1:02} / 10   •   QUICK START',18,'#b7cba8',True)
 txt(d,(75,121),ch['title'],49,'white',True);txt(d,(78,184),ch['outcome'],21,'#afc5b7')
 # Perspective transform of a solid desktop display, settling for readability.
 angle=-.11*(1-progress)+.007*math.sin(sec*.5);tilt=.055*(1-progress)
 R=np.array([[math.cos(angle),0,math.sin(angle)],[0,1,0],[-math.sin(angle),0,math.cos(angle)]])@np.array([[1,0,0],[0,math.cos(tilt),-math.sin(tilt)],[0,math.sin(tilt),math.cos(tilt)]])
 def project(points):
  q=np.array(points)@R.T;f=2100/(2100-q[:,2]);return np.column_stack([960+q[:,0]*f,570-q[:,1]*f+(1-progress)*50])
 front=project([(-760,345,5),(760,345,5),(760,-345,5),(-760,-345,5)]);back=project([(-760,345,-25),(760,345,-25),(760,-345,-25),(-760,-345,-25)])
 for face in [[back[0],back[1],front[1],front[0]],[back[1],back[2],front[2],front[1]],[back[2],back[3],front[3],front[2]]]:d.polygon([tuple(v) for v in face],fill='#73937c')
 tex=app(ci,ch,sec,duration);minx,miny=np.floor(front.min(axis=0)).astype(int);maxx,maxy=np.ceil(front.max(axis=0)).astype(int);dest=front-[minx,miny];src=[(0,0),(1400,0),(1400,670),(0,670)];A=[];B=[]
 for (u,v),(sx,sy) in zip(dest,src):A.extend([[u,v,1,0,0,0,-sx*u,-sx*v],[0,0,0,u,v,1,-sy*u,-sy*v]]);B.extend([sx,sy])
 coeff=np.linalg.solve(A,B);tile=tex.transform((maxx-minx,maxy-miny),Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC,fillcolor='#f6f8f3');mask=Image.new('L',tile.size);ImageDraw.Draw(mask).polygon([tuple(p) for p in dest],fill=255);im.paste(tile,(minx,miny),mask)
 d=ImageDraw.Draw(im);phase=min(2,int(sec/max(1,duration)*3))
 for i,step in enumerate(ch['steps']):
  xx=80+i*600;d.ellipse((xx,936,xx+25,961),fill=LIME if i==phase else '#365a43');txt(d,(xx+8,937),str(i+1),15,INK if i==phase else '#b3c5b4',True);txt(d,(xx+37,935),step,19,'#f3f7ed' if i==phase else '#8fa795',i==phase)
 active=next((c['text'] for c in captions if c['start']<=sec<c['end']),None)
 if active:
  words=active.split();ll=['']
  for word in words:
   t=(ll[-1]+' '+word).strip()
   if ft(25).getlength(t)>1700:ll.append(word)
   else:ll[-1]=t
  for j,line in enumerate(ll):txt(d,((W-ft(25).getlength(line))/2,988+j*30),line,25,'#eff5e9')
 for j in range(10):
  xx=80+j*177;box(d,(xx,1065,xx+164,1068),'#3a5842',2)
  if j<=ci:box(d,(xx,1065,xx+max(1,164*(sec/duration if j==ci else 1)),1068),LIME,2)
 return im
