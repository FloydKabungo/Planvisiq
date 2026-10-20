// Keep the established database key so existing browser workspaces remain accessible.
const DB_NAME='clarity-frontend-v1';
let pending;
function db(){if(!pending){pending=new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{req.result.createObjectStore('workspace');req.result.createObjectStore('files');};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});pending.catch(()=>{pending=null;});}return pending;}
async function run(store,mode,action){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction(store,mode);const request=action(tx.objectStore(store));let result;request.onsuccess=()=>result=request.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
// A local namespace keeps demo projects separate from company setup previews.
// This is convenience only; browser storage cannot enforce organisation access.
export const loadWorkspace=(key='current')=>run('workspace','readonly',s=>s.get(key));
export const saveWorkspace=(value,key='current')=>run('workspace','readwrite',s=>s.put(value,key));
export const saveFile=(id,file)=>run('files','readwrite',s=>s.put(file,id));
export const getFile=id=>run('files','readonly',s=>s.get(id));
export const removeFile=id=>run('files','readwrite',s=>s.delete(id));
