const C = new CanvasController({
  id: "display",
  fps: 240,
  grid:true,
  items: [
    {shape:"arc",dimensions:[0,0,30,0,2 * Math.PI],physX:{enable:true,bounce:1,acc:[200,-5],friction:[0.005]},events:[{type:"mousedown",assist:50,callback:function(e){this.setItemRandomColor(e.id);this.randomizeItemState(e.id)}}]}
  ]
});