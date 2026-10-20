import {normalizeDeck,slideScene,chartItems,imageBox,deckWarnings,themes} from './slides-model.js';

function checked(raw){const deck=normalizeDeck(raw),warnings=deckWarnings(deck);if(warnings.length)throw new Error(warnings[0]);return deck;}
const hex=v=>v.replace('#','');
export async function presentationPptx(raw){
 const deck=checked(raw),pptx=new globalThis.pptxgen();
 pptx.layout='LAYOUT_WIDE';pptx.author=deck.company||'Planvisiq';pptx.company=deck.company;pptx.title=deck.title;pptx.subject='Project presentation';pptx.lang='en-ZA';
 pptx.theme={headFontFace:'Arial',bodyFontFace:'Arial',lang:'en-ZA'};
 for(const [index,source] of deck.slides.entries()){
  const slide=pptx.addSlide();
  const add=item=>{
   const box={x:item.x/96,y:item.y/96,w:item.w/96,h:item.h/96};
   if(item.type==='rect'&&item.w>0&&item.h>0)slide.addShape(pptx.ShapeType.rect,{...box,line:{color:hex(item.fill),transparency:100},fill:{color:hex(item.fill)}});
   if(item.type==='text'&&item.text)slide.addText(item.lines.join('\n'),{...box,fontFace:'Arial',fontSize:item.size*.75,bold:item.bold,color:hex(item.color),margin:0,breakLine:false,paraSpaceAfterPt:0,lineSpacingMultiple:1.03,valign:'top',wrap:false});
   if(item.type==='image'){const b=imageBox(item);slide.addImage({data:item.data,x:b.x/96,y:b.y/96,w:b.w/96,h:b.h/96,altText:source.caption||source.title});}
   if(item.type==='chart'){
    const c=item.chart;
    if(!c.labels.length||c.values.some(v=>v===null)){chartItems(item).forEach(add);return;}
    slide.addChart(pptx.ChartType.bar,[{name:c.unit==='%'?'Progress (%)':'Value',labels:c.style==='column'?c.labels:[...c.labels].reverse(),values:c.style==='column'?c.values:[...c.values].reverse()}],{...box,barDir:c.style==='column'?'col':'bar',catAxisLabelFontFace:'Arial',catAxisLabelFontSize:14,catAxisLabelColor:hex(item.theme.ink),catAxisLineShow:false,valAxisLabelFontFace:'Arial',valAxisLabelFontSize:11,valAxisLabelColor:hex(item.theme.muted),valAxisMinVal:0,...(c.unit==='%'?{valAxisMaxVal:100}:{}),valAxisLineShow:false,valGridLine:{color:hex(item.theme.soft),width:1},catAxisLabelPos:'low',showLegend:false,showValue:true,dataLabelPosition:'outEnd',dataLabelColor:hex(item.theme.ink),dataLabelFormatCode:c.unit==='%'?'0.0"%"':'0.##',dataLabelBkgrdColor:hex(item.theme.paper),dataLabelFontSize:13,showTitle:false,showBorder:false,showCatName:false,chartColors:[hex(item.theme.accent)],showShadow:false,showMarker:false});
   }
  };
  const scene=slideScene(deck,source,index);
  if(source.layout==='table'){
   scene.items.filter(item=>item.y<280||item.y>=676).forEach(add);
   const theme=themes[deck.theme],headers=source.table.headers.length?source.table.headers:['Item'],rowH=Math.min(63,370/(source.table.rows.length+1)),cells=scene.items.filter(item=>item.type==='text'&&item.y>=280&&item.y<676);
   const rows=[headers,...source.table.rows].map((row,i)=>headers.map((_,j)=>{const cell=cells[i*headers.length+j];return {text:cell?.lines.join('\n')||'',options:{fontSize:(cell?.size||20)*.75,bold:i===0,color:i===0?'FFFFFF':hex(theme.ink),fill:i===0?hex(theme.ink):hex(i%2?theme.soft:theme.paper)}};}));
   slide.addTable(rows,{x:64/96,y:280/96,w:12,h:rowH*rows.length/96,rowH:rowH/96,colW:headers.map(()=>12/headers.length),fontFace:'Arial',fontSize:15,border:{type:'none'},margin:[7.5,10.5,3,10.5],valign:'top',autoPage:false,paraSpaceAfterPt:0});
  }else scene.items.forEach(add);
  slide.addNotes([source.notes,`Source: ${source.source}`,`Project: ${deck.projectName}. Reporting cut-off: ${deck.cutoff}.`,deck.sample?'Fictional sample project.':'',`Deck created ${deck.createdAt}. Edited ${deck.updatedAt}.`].filter(Boolean).join('\n\n'));
 }
 return pptx.write({outputType:'arraybuffer'});
}

let fontBytes;
async function loadFonts(){if(!fontBytes){fontBytes=Promise.all(['DejaVuSans.ttf','DejaVuSans-Bold.ttf'].map(async name=>{const r=await fetch(new URL('../vendor/fonts/'+name,import.meta.url));if(!r.ok)throw new Error('The PDF fonts could not be loaded. Reload the page and try again.');return r.arrayBuffer();}));fontBytes.catch(()=>{fontBytes=null;});}return fontBytes;}
export async function presentationPdf(raw){
 const deck=checked(raw),{PDFDocument,rgb}=globalThis.PDFLib,doc=await PDFDocument.create();doc.registerFontkit(globalThis.fontkit);
 const bytes=await loadFonts(),fonts=await Promise.all(bytes.map(b=>doc.embedFont(b,{subset:true})));
 doc.setTitle(deck.title);doc.setAuthor(deck.company||'Planvisiq');doc.setSubject(`Project presentation · ${deck.cutoff}`);
 const color=v=>rgb(parseInt(v.slice(1,3),16)/255,parseInt(v.slice(3,5),16)/255,parseInt(v.slice(5,7),16)/255),scale=.75;
 for(const [index,s] of deck.slides.entries()){
  const page=doc.addPage([960,540]);
  const draw=async item=>{
   if(item.type==='rect'&&item.w>0&&item.h>0)page.drawRectangle({x:item.x*scale,y:(720-item.y-item.h)*scale,width:item.w*scale,height:item.h*scale,color:color(item.fill)});
   if(item.type==='text'){const font=fonts[item.bold?1:0];for(const [n,line] of item.lines.entries()){let size=item.size*scale;const measured=font.widthOfTextAtSize(line,size);if(measured>item.w*scale)size*=item.w*scale/measured;page.drawText(line,{x:item.x*scale,y:(720-item.y-item.size-n*item.size*1.24)*scale,size,font,color:color(item.color)});}}
   if(item.type==='image'){const image=await (item.data.startsWith('data:image/png')?doc.embedPng(item.data):doc.embedJpg(item.data)),b=imageBox(item);page.drawImage(image,{x:b.x*scale,y:(720-b.y-b.h)*scale,width:b.w*scale,height:b.h*scale});}
   if(item.type==='chart')for(const child of chartItems(item))await draw(child);
  };
  for(const item of slideScene(deck,s,index).items)await draw(item);
 }
 return doc.save();
}
