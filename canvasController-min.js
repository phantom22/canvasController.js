class CanvasController{constructor(e){const s=this;s.events={},s._isPaused=!1,s._evt={mouse:[],dimensions:[]},s._vars={},s._physX=[],s.speedMult=1,s.validate(e)}addMethod(e,s){"function"==typeof s&&(this[e]=s)}validate(e){const s=this,t=e.id;let{fps:i,grid:n,background:r,items:o}=e,{draw:a,cellSize:c,lineWidth:h,color:l,lineDash:u}="object"==typeof n?n:{};if(void 0===t||!document.getElementById(t))return;s.id=t,i="number"==typeof i?i:60,s.fps=(()=>i),a="boolean"==typeof a&&a,c="number"==typeof c?c:100,h="number"==typeof h?h:1,l="string"==typeof l?l:"white",u=void 0!==u&&Array.isArray(u)&&2==u.length&&"number"==typeof u.reduce((e,s)=>e+s)?u:[0,0],s.grid=new CanvasGrid({draw:a,cellSize:c,lineWidth:h,strokeStyle:l,lineDash:u}),s.items=[],s.background="string"==typeof r?r:"black";const d=s.getCanvas().getContext("2d",{alpha:!1});s._2D=(()=>d);for(let e in o)s.addItem(o[e]);s.start()}bg(){return this.background}_bg(e){this.background=e}addItem(e){const s=this,t=s.items.length,i={fillRect:4,arc:5},{shape:n,dimensions:r,physX:o,events:a}="object"==typeof e?e:{};let c="object"==typeof e.color?c:{},{fill:h,stroke:l}="object"==typeof c?c:{},{enable:u,gravity:d,bounce:y,friction:p,acc:f}="object"==typeof o?o:{},m={};if(Object.keys(i).includes(n)&&r.length==i[n]){c.fill="string"==typeof h?h:"black",c.stroke="string"==typeof l?l:"black",u="boolean"==typeof u&&u,s._physX.push(t),o.enable="boolean"==typeof u&&u,o.gravity="number"==typeof d?d:9.81,o.bounce="number"==typeof y?y:.4,o.friction="number"==typeof p?p:0,o.acc=Array.isArray(f)&&2==f.length&&"number"==typeof f.reduce((e,s)=>e+s)?f:[0,0],o.isDragged=!1;const e=s.validateEvents(a);s.registerEvents(t,e),m={shape:n,dimensions:r,color:c,physX:o,events:e},s.items.push(new CanvasItem(m,s._2D()))}}validateEvents(e){const s=[],t=["mousedown","mouseup","mouseover","mouseout","dblclick","click","mousemove","drag"],i=["x","y"];for(let n in e){const r=e[n],{type:o}=r;let{callback:a,assist:c,dragAxis:h,assists:l,bindself:u}=r;const d="string"==typeof o?t.indexOf(o):-1;if(u="boolean"!=typeof u||u,a="function"==typeof a?a:function(){},-1!=d)if(d<7)c="number"==typeof c?c:0,s.push({type:o,assist:c,callback:a,bindself:u});else if(7==d){l=Array.isArray(l)?l:[15,1e3,2e3];let e=[],[t,n,r]=l;switch(t="number"==typeof t?t:15,n="number"==typeof n?n:1e3,r="number"==typeof r?r:2e3,h="string"==typeof h&&i.includes(h)?h:"",e.push({type:"mousedown",assist:t,callback:function(e){e._isDragged(!0),this.disableCursor()}},{type:"mouseup",assist:r,callback:function(e){e._isDragged(!1),this.enableCursor()}}),h){case"x":e.push({type:"mousemove",assist:n,callback:function(e){e.isDragged()&&e._x(this.centerMouseX())},bindself:!0});break;case"y":e.push({type:"mousemove",assist:n,callback:function(e){e.isDragged()&&e._y(this.centerMouseY())},bindself:!0});break;default:e.push({type:"mousemove",assist:n,callback:function(e){if(e.isDragged()){const[s,t]=this.centerMouse();e._xy([s,t])}},bindself:!0})}s.push(...e)}}return s}registerEventType(e){const s=this,t=s.events;"string"==typeof e&&void 0===t[e]&&(s.events[e]=[],s.addHandler(e))}registerEvents(e,s){const t=this,i=s.map(e=>e.type);i.forEach(e=>t.registerEventType(e));for(let n in s){s[n];t.events[i[n]].push([e,n])}}addHandler(e){const s=this,t=s.eventHandler;s.getCanvas().addEventListener(e,t.bind(s))}eventHandler(e){const s=this,t=[e.clientX,e.clientY],i=e.type,n=s.events[i];for(let i in n){const r=n[i][0],o=n[i][1],a=s.items[r],[c,h]=a.xy(),l=a.shape,u=a.events[o],d="number"==typeof u.assist?u.assist:0;let y,p,f,[m,b]=a.abc();"arc"==l?(y=[c-m-d,c+m+d],p=[h-m-d,h+m+d],b=m,f=s.checkMouse({mouse:t,shape:l,center:[c,h],radius:m,assist:d})):(y=[c-d,c+m+d],p=[h-d,h+b+d],f=s.checkMouse({mouse:t,shape:l,bordersX:y,bordersY:p})),f&&(e.mouse={x:e.clientX,y:e.clientY},e.id=r,e.item=a,s._evt=e,0==u.bindself?u.callback():u.callback.call(s,a,e))}}checkMouse({mouse:e,shape:s,bordersX:t,bordersY:i,center:n,radius:r,assist:o}){if("arc"==s){const s=Math.abs(n[0]-e[0]),t=Math.abs(n[1]-e[1]);return Math.sqrt(s**2+t**2)<=r+(o="number"==typeof o?o:0)}return(([e,s],[t,i],[n,r])=>t<=e&&e<=i&&n<=s&&s<=r)(e,t,i)}drawFrame(){const e=this,s=e.items,t=e._isPaused,i=e.fps(),n=e.speedMult;if(0==t){e.canvasAdapt(),e.clearFrame(),e.drawGrid();const t=e.client;for(let e in s)s[e].step(i,n),s[e].inBounds(t),s[e].draw()}}drawGrid(){const e=this.grid;if(1==e.dr()){const s=this,t=s._2D(),{clientWidth:i,clientHeight:n}=s.getCanvas(),r=e.cell(),o=Math.ceil(n/r),a=Math.ceil(i/r);let c=r,h=r;t.lineWidth=e.lWidth(),t.strokeStyle=e.st(),t.setLineDash(e.lDash());for(let e=1;e<a;e++)t.beginPath(),t.moveTo(c,0),t.lineTo(c,n),t.stroke(),c+=r;for(let e=1;e<o;e++)t.beginPath(),t.moveTo(0,h),t.lineTo(i,h),t.stroke(),h+=r;t.lineWidth=1,t.strokeStyle="",t.setLineDash([])}}clearFrame(){const e=this,s=e._2D(),[t,i]=e.client;s.fillStyle=e.bg(),s.fillRect(0,0,t,i)}canvasAdapt(){const e=this,s=e.getCanvas(),{clientWidth:t,clientHeight:i}=s;s.width=t,s.height=i,e.client=[t,i],e.items.forEach(s=>s.client=e.client)}centerMouseX(){return"arc"==this._evt.item.sh()?this._evt.mouse.x:this._evt.mouse.x-this._evt.item.a()/2}centerMouseY(){return"arc"==this._evt.item.sh()?this._evt.mouse.y:this._evt.mouse.y-this._evt.item.b()/2}centerMouse(){return[this.centerMouseX(),this.centerMouseY()]}disableCursor(){this.getCanvas().style.cursor="none"}enableCursor(){this.getCanvas().style.cursor=""}getCanvas(){return document.getElementById(this.id)}start(){const e=this,s=e.drawFrame;let t=0;e.drawnFrames=(()=>t),this.drawFrame(),e.refreshFrame=setInterval(function(){s.bind(this)(),t++}.bind(e),1e3/e.fps())}pause(){this._isPaused=!0}unpause(){this._isPaused=!1}stop(){clearInterval(this.refreshFrame),delete this.refreshFrame}}class CanvasGrid{constructor(e){for(let s in e)this[s]=e[s]}dr(){return this.draw}_dr(e){this.draw=e}cell(){return this.cellSize}_cell(e){this.cellSize=e}lWidth(){return this.lineWidth}_lWidth(e){this.lineWidth=e}lDash(){return this.lineDash}_lDash(e){this.lineDash=e}st(){return this.strokeStyle}_st(e){this.strokeStyle=e}}class CanvasItem{constructor(e,s){const t=this;for(let s in e)t[s]=e[s];const i=t.sh();switch(t._2D=s,i){case"fillRect":t.draw=function(){t._2D.fillStyle=t.fill(),t._2D[i](...t.dims())};break;case"arc":t.draw=function(){const e=t._2D;e.fillStyle=t.fill(),e.strokeStyle=t.stroke(),e.beginPath(),e[i](...t.dims()),e.fill(),e.stroke()}}}step(e,s){const t=this;if(t.isDragged())t._acc([0,0]);else if(t.phEnable()){const{gravity:i,bounce:n,friction:r}=t.phX(),[o,a]=(t.sh(),t.xy()),c=[];let h=t.acc();h[0]=h[0]*(1-r/100),c[0]=o+h[0]/e*s,h[1]+=i/e*s,c[1]=a+h[1],t._acc(h),t._xy(c)}}inBounds(e){const s=this,[t,i]=s.xy(),[n,r]=e;let o,a;if("arc"==s.sh()){const e=s.a();o=[e,n-e],a=[e,r-e]}else{const[e,t]=s.abc();o=[0,n-e],a=[0,r-t]}o[0]>=t?(s._x(o[0]),s.hBounce()):o[1]<=t&&(s._x(o[1]),s.hBounce()),a[0]>=i?(s._y(a[0]),s.vBounce()):a[1]<=i&&(s._y(a[1]),s.vBounce())}sh(){return this.shape}_sh(e){this.shape=e}dims(){return this.dimensions}_dims(e){this.dimensions=e}x(){return this.dimensions[0]}_x(e){this.dimensions[0]=e}y(){return this.dimensions[1]}_y(e){this.dimensions[1]=e}xy(){return this.dimensions.slice(0,2)}_xy([e,s]){this.dimensions[0]=e,this.dimensions[1]=s}a(){return this.dimensions[2]}_a(e){this.dimensions[2]=e}b(){return this.dimensions[3]}_b(e){this.dimensions[3]=e}c(){return this.dimensions[4]}_c(e){this.dimensions[4]=e}abc(){return this.dimensions.slice(2)}color(){return this.color}_color({fill:e,stroke:s}){this.color.fill=e,this.color.stroke=s}fill(){return this.color.fill}_fill(e){this.color.fill=e}stroke(){return this.color.stroke}_stroke(e){this.color.stroke=e}phX(){return this.physX}phEnable(){return this.physX.enable}_phEnable(e){this.physX.enable=e}gr(){return this.physX.gravity}_gr(e){this.physX.gravity=e}bo(){return this.physX.bounce}_bo(e){this.physX.bounce=e}hBounce(){this.physX.acc[0]*=-this.physX.bounce}vBounce(){this.physX.acc[1]*=-this.physX.bounce}fr(){return this.physX.friction}_fr(e){this.physX.friction=e}acc(){return this.physX.acc}_acc([e,s]){this.physX.acc[0]=e,this.physX.acc[1]=s}hAcc(){return this.physX.acc[0]}_hAcc(e){this.physX.acc[0]=e}vAcc(){return this.physX.acc[1]}_vAcc(e){this.physX.acc[1]=e}isDragged(){return this.physX.isDragged}_isDragged(e){this.physX.isDragged=e}evts(){return this.events}ev(e){return this.events[e]}}