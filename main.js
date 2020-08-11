let total_clicks = 0,
	accurate_clicks = 0;

const C = new CanvasController({
  id: "display",
  fps: 120,
  grid: {enable:true,cellSize:60,lineWidth:2,color:"#1a1a1a",lineDash:[7,5]},
  background:"#0d0d0d",
  methods:[
    {name:"randomizeItemState",function(t){const o=this,a=o.items[t],h=[15,20,25,30,35];if("arc"==a.shape){const t=a.a(),[r,n]=o.client,M=Math.floor(Math.random()*(r-2*t))+t,m=Math.floor(Math.random()*(n-5*t))+3*t,e=Math.floor(1e3*Math.random())+500;a._gr(Math.floor(-20*Math.random()+20*Math.random())),a._a(h[Math.floor(Math.random()*h.length)]),a._xy([M,m]),a._hAcc(e)}}},
    {name:"setItemRandomColor",function(t){const o=`rgba(${Math.floor(255*Math.random())},${Math.floor(255*Math.random())},${Math.floor(255*Math.random())},0.4)`;this.items[t]._fill(o),this.items[t]._stroke(o)}}
  ],
  items: [
    {shape:"arc",dimensions:[0,0,30,0,2 * Math.PI],physX:{enable:true,bounce:1,acc:[200,-5],friction:0.005},events:[{type:"mousedown",assist:50,callback:function(i,e){this.setItemRandomColor(e.id);this.randomizeItemState(e.id); accurate_clicks += 1; }},{type:"mousedown",assist:3000,callback(i,e){ total_clicks += 1; console.clear(); console.log("[Total clicks: " + total_clicks + "]\n[Accurate clicks: " + accurate_clicks + "]\n[Accuracy: " + (accurate_clicks / (total_clicks / 100)).toFixed(2) + "%]\n[Time: " + (this.drawnFrames() / this.fps()).toFixed(2) + " secs.]")}}]}
  ]
});