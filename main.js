let total_clicks = 0,
	accurate_clicks = 0;

const C = new CanvasController({
  id: "display",
  fps: 120,
  grid:true,
  items: [
    {shape:"arc",dimensions:[0,0,30,0,2 * Math.PI],physX:{enable:true,bounce:1,acc:[200,-5],friction:0.005},events:[{type:"mousedown",assist:50,callback:function(i,e){this.setItemRandomColor(e.id);this.randomizeItemState(e.id); accurate_clicks += 1; }},{type:"mousedown",assist:3000,callback(i,e){ total_clicks += 1; console.clear(); console.log("Accuracy: " + (accurate_clicks / (total_clicks / 100)).toFixed(2) + "%\n seconds: " + (this.drawnFrames() / this.fps()).toFixed(2))}}]}
  ]
});