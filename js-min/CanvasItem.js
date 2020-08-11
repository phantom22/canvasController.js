class CanvasItem{constructor(s,i){const t=this;for(let i in s)t[i]=s[i];const e=t.sh();switch(t._2D=i,e){case"fillRect":t.draw=function(){t._2D.fillStyle=t.fill(),t._2D[e](...t.dims())};break;case"arc":t.draw=function(){const s=t._2D;s.fillStyle=t.fill(),s.strokeStyle=t.stroke(),s.beginPath(),s[e](...t.dims()),s.fill(),s.stroke()}}}step(s,i){const t=this;if(t.isDragged())t._acc([0,0]);else if(t.phEnable()){const{gravity:e,bounce:n,friction:h}=t.phX(),[r,c]=(t.sh(),t.xy()),o=[];let l=t.acc();l[0]=l[0]*(1-h/100),o[0]=r+l[0]/s*i,l[1]+=e/s*i,o[1]=c+l[1],t._acc(l),t._xy(o)}}inBounds(s){const i=this,[t,e]=i.xy(),[n,h]=s;let r,c;if("arc"==i.sh()){const s=i.a();r=[s,n-s],c=[s,h-s]}else{const[s,t]=i.abc();r=[0,n-s],c=[0,h-t]}r[0]>=t?(i._x(r[0]),i.hBounce()):r[1]<=t&&(i._x(r[1]),i.hBounce()),c[0]>=e?(i._y(c[0]),i.vBounce()):c[1]<=e&&(i._y(c[1]),i.vBounce())}sh(){return this.shape}_sh(s){this.shape=s}dims(){return this.dimensions}_dims(s){this.dimensions=s}x(){return this.dimensions[0]}_x(s){this.dimensions[0]=s}y(){return this.dimensions[1]}_y(s){this.dimensions[1]=s}xy(){return this.dimensions.slice(0,2)}_xy([s,i]){this.dimensions[0]=s,this.dimensions[1]=i}a(){return this.dimensions[2]}_a(s){this.dimensions[2]=s}b(){return this.dimensions[3]}_b(s){this.dimensions[3]=s}c(){return this.dimensions[4]}_c(s){this.dimensions[4]=s}abc(){return this.dimensions.slice(2)}color(){return this.color}_color({fill:s,stroke:i}){this.color.fill=s,this.color.stroke=i}fill(){return this.color.fill}_fill(s){this.color.fill=s}stroke(){return this.color.stroke}_stroke(s){this.color.stroke=s}phX(){return this.physX}phEnable(){return this.physX.enable}_phEnable(s){this.physX.enable=s}gr(){return this.physX.gravity}_gr(s){this.physX.gravity=s}bo(){return this.physX.bounce}_bo(s){this.physX.bounce=s}hBounce(){this.physX.acc[0]*=-this.physX.bounce}vBounce(){this.physX.acc[1]*=-this.physX.bounce}fr(){return this.physX.friction}_fr(s){this.physX.friction=s}acc(){return this.physX.acc}_acc([s,i]){this.physX.acc[0]=s,this.physX.acc[1]=i}hAcc(){return this.physX.acc[0]}_hAcc(s){this.physX.acc[0]=s}vAcc(){return this.physX.acc[1]}_vAcc(s){this.physX.acc[1]=s}isDragged(){return this.physX.isDragged}_isDragged(s){this.physX.isDragged=s}evts(){return this.events}ev(s){return this.events[s]}}