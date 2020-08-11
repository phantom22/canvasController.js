let total_clicks = 0,
	accurate_clicks = 0;

const randomizeItemState = function(i) {

    const t = this, item = t.items[i], g = [-15,-11,-7,7,11,15], R = [15,20,25,30,35];

    if (item.shape == "arc") {
        const r = item.a(), [clientWidth, clientHeight] = t.client,
        newX = Math.floor(Math.random() * (clientWidth-r*2)) + r,
        newY = Math.floor(Math.random() * (clientHeight-r*5)) + r*3,
        newHA = Math.floor(Math.random() * 1000) + 500;

        item._gr(Math.floor(Math.random() * -20 + Math.random() * 20));
        item._a(R[Math.floor(Math.random() * R.length)]);
        item._xy([newX,newY]);
        item._hAcc(newHA);
    }
}, setItemRandomColor = function(i) {
    const color = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},0.4)`;
    this.items[i]._fill(color);
    this.items[i]._stroke(color);
};

const C = new CanvasController({
  id: "display",
  fps: 120,
  grid: {draw:true,cellSize:60,lineWidth:2,color:"#1a1a1a",lineDash:[7,5]},
  background:"#0d0d0d",
  items: [
    {shape:"arc",dimensions:[0,0,30,0,2 * Math.PI],physX:{enable:true,bounce:1,acc:[200,-5],friction:0.005},events:[{type:"mousedown",assist:50,callback:function(i,e){this.setItemRandomColor(e.id);this.randomizeItemState(e.id); accurate_clicks += 1; }},{type:"mousedown",assist:3000,callback(i,e){ total_clicks += 1; console.clear(); console.log("[Total clicks: " + total_clicks + "]\n[Accurate clicks: " + accurate_clicks + "]\n[Accuracy: " + (accurate_clicks / (total_clicks / 100)).toFixed(2) + "%]\n[Time: " + (this.drawnFrames() / this.fps()).toFixed(2) + " secs.]")}}]}
  ]
});

C.addMethod("randomizeItemState",randomizeItemState);
C.addMethod("setItemRandomColor",setItemRandomColor);