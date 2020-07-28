class CanvasController {

  constructor(object) {

    this.validate(object);

  }

  addHandler() {

    const t = this, c = t.getCanvas(), eventHandler = t.eventHandler;
    Object.keys(t.events).forEach( event => c.addEventListener(event,eventHandler.bind(t)) );

  }

  eventHandler(evt) {
    
    const t = this, mouse = [evt.clientX, evt.clientY], type = evt.type, event = t.events[type];

    for (let i in event) {

      const itemId = event[i][0],
      item = t.items[itemId],
      [x,y] = item.dimensions,
      shape = item.shape,
      ev = item.events[event[i][1]],
      assist = typeof ev.assist == "number" ? ev.assist : 0;

      let [w,h] = item.dimensions.slice(2), itemBordersX, itemBordersY, result;

      if (shape == "arc") {

        itemBordersX = [x-w-assist,x+w+assist];
        itemBordersY = [y-w-assist,y+w+assist];
        h = w;
        result = t.checkMouse({mouse,shape,center:[x,y],radius:w,assist});

      }

      else {

        itemBordersX = [x-assist,x+w+assist];
        itemBordersY = [y-assist,y+h+assist];
        result = t.checkMouse({mouse,shape,bordersX:itemBordersX,bordersY:itemBordersY});

      }

      if (result) {

        evt.mouse = {x:evt.clientX,y:evt.clientY};
        evt.dimensions = item.dimensions;
        evt.itemX = x;
        evt.itemY = y;
        evt.width = w;
        evt.height = h;
        evt.shape = shape;
        evt.id = itemId;

        t.evt = evt;

        ev.bindself == false ? ev.callback() : ev.callback.call(t,evt);

      }

    }

  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                      NEEDS OPTIMIZATION
  gravity() {

    const t = this, items = t.physX, fps = t.fps, [clientWidth, clientHeight] = t.client,
    inBounds = (a, [b, c]) => { 

      let r = 0;

      if (b >= a) {
        r = -1;
      }
      else if (c <= a) {
        r = 1;
      }

      return r;

    };

    for (let i in items) {

      const id = items[i]

      if (t.items[id].enablePhysX && !t.itemIsDragged(id)) {

        const item = t.items[id], physX = item.physX, {gravity, bounce, friction, acc} = physX, {shape, dimensions} = item, [x, y] = dimensions;
        let limitsX, limitsY, nextPos = [x, y], adjust1, adjust2;

        // y
        acc[1] += gravity / fps;
        nextPos[1] += acc[1];
        // x
        //acc[0] *= friction;
        nextPos[0] += acc[0] / fps;

        if (shape == "arc") {

          const r = item.dimensions[2];
          limitsX = [r, clientWidth - r];
          limitsY = [r, clientHeight - r];

        }
        else {

          const [w,h] = item.dimensions.slice(2);
          limitsX = [0, clientWidth - w];
          limitsY = [0, clientHeight - h];

        }

        const inboundsX = inBounds(nextPos[0],limitsX), inboundsY = inBounds(nextPos[1],limitsY);

        if (inboundsX != 0 && inboundsY == 0) {
          adjust1 = inboundsX == -1 ? limitsX[0] : limitsX[1];
          t.setItemAcc(id, acc);
          t.setItemPos(id, {x:adjust1,y:nextPos[1]});
          t.itemHBounce(id);
        }
        else if (inboundsY != 0 && inboundsX == 0) {
          adjust1 = inboundsY == -1 ? limitsY[0] : limitsY[1];
          t.setItemPos(id, {x:nextPos[0],y:adjust1});
          t.itemVBounce(id);
        }
        else if (inboundsX != 0 && inboundsY != 0) {
          adjust1 = inboundsX == -1 ? limitsX[0] : limitsX[1];
          adjust2 = inboundsY == -1 ? limitsY[0] : limitsY[1];
          t.itemHBounce(id);
          t.itemVBounce(id);
          t.setItemPos(id, {x:adjust1,y:adjust2});
        }
        else {
          t.setItemAcc(id, acc);
          t.setItemPos(id, {x:nextPos[0],y:nextPos[1]});
        }

      }
      else {
        t.setItemAcc(id, [0, 0]);
      }

    }

  }

  checkMouse({mouse,shape,bordersX,bordersY,center,radius,assist}) {

    const t = this, 
    checkCursor = ([a,b],[c,d],[e,f]) => c <= a  && a <= d && e <= b && b <= f;

    if (shape == "arc") {
      const width = Math.abs(center[0] - mouse[0]), height = Math.abs(center[1] - mouse[1]), hypotenuse = Math.sqrt( width ** 2 + height ** 2 );
      assist = typeof assist == "number" ? assist : 0;
      return hypotenuse <= radius + assist;
    }
    else {
      return checkCursor(mouse,bordersX,bordersY);
    }

  }

  drawFrame() {

    const t = this, items = t.items, isPaused = t.isPaused;

    if (isPaused == false) {

      t.canvasAdapt();
      t.clearFrame();
      t.drawGrid();
      t.gravity();

      for (let i in items) {

        t.drawItem(i);

      }

    }

  }

  drawGrid() {

    const t = this, _2D = t._2D(), { clientWidth, clientHeight } = t.getCanvas(), cellSize = 60, rows = Math.ceil(clientHeight / cellSize), columns = Math.ceil(clientWidth / cellSize);
    let xPos = cellSize, yPos = cellSize;
    _2D.lineWidth = 2;
    _2D.strokeStyle = "#1a1a1a";
    _2D.setLineDash([7, 5]);

    for (let i = 1; i < columns; i++) {

      _2D.beginPath();
      _2D.moveTo(xPos, 0);
      _2D.lineTo(xPos, clientHeight);
      _2D.stroke();
      xPos += cellSize;

    }

    for (let i = 1; i < rows; i++) {

      _2D.beginPath();
      _2D.moveTo(0, yPos);
      _2D.lineTo(clientWidth, yPos);
      _2D.stroke();
      yPos += cellSize;

    }

    _2D.lineWidth = 1;
    _2D.strokeStyle = "";
    _2D.setLineDash([]);

  }

  clearFrame() {

    const t = this, _2D = t._2D(),
    [ clientWidth, clientHeight ] = t.client;

    _2D.clearRect(0,0,clientWidth,clientHeight);

  }

  canvasAdapt() {

    const t = this, c = t.getCanvas(), {clientWidth, clientHeight} = c;
    c.width = clientWidth;
    c.height = clientHeight;
    t.client = [clientWidth, clientHeight];

  }

  drawItem(i) {

    const t = this, items = t.items, _2D = t._2D();

    if (typeof items[i] != "undefined") {

      const item = items[i],
      [ a, b, c, d, e ] = item.dimensions,
      { shape, color } = item,
      { fill, stroke } = color;
      _2D.fillStyle = typeof fill == "string" ? fill : "black";
      _2D.strokeStyle = typeof stroke == "string" ? stroke : _2D.fillStyle;

      switch (shape) {
        case "fillRect": _2D[shape](a,b,c,d); break;
        case "arc": _2D.beginPath(); _2D[shape](a,b,c,d,e); _2D.fill(); _2D.stroke(); break;
      }

    }

  }

  randomizeItemState(i) {
    const t = this, item = t.items[i], g = [-19.62,-9.81, 9.81,19.62];

    if (item.shape == "arc") {
      const r = item.dimensions[2], [clientWidth, clientHeight] = t.client,
      newX = Math.floor(Math.random() * (clientWidth-r*2)) + r,
      newY = Math.floor(Math.random() * (clientHeight-r*5)) + r*3,
      newHA = Math.floor(Math.random() * 1500) + 800;
      t.items[i].physX.gravity = g[Math.floor(Math.random() * 4)];

      t.setItemPos(i,{x:newX,y:newY});
      t.setItemHAcc(i,newHA);
    }
  }

  itemIsDragged(i) {
    return this.items[i].physX.isDragged;
  }

  setItemPos(i,{x,y}) {
    this.items[i].dimensions[0] = x;
    this.items[i].dimensions[1] = y;
  }

  setItemColor(i,color) {
    this.items[i].color.fill = color;
    this.items[i].color.stroke = color;
  }

  setItemAcc(i,acc) {
    this.items[i].physX.acc = acc;
  }

  // horizontal acc
  setItemHAcc(i, acc) {
    this.items[i].physX.acc[0] = acc;
  }

  // vertical acc
  setItemVAcc(i, acc) {
    this.items[i].physX.acc[1] = acc;
  }

  // horizontal bounce
  itemHBounce(i) {
    this.items[i].physX.acc[0] *= -this.items[i].physX.bounce;
  }

  // vertical bounce
  itemVBounce(i) {
    this.items[i].physX.acc[1] *= -this.items[i].physX.bounce;
  }

  setItemRandomColor(i) {
    const color = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},0.4)`;
    this.setItemFillColor(i,color);
    this.setItemStrokeColor(i,color);
  }

  setItemFillColor(i,color) {
    this.items[i].color.fill = color;
  }

  setItemStrokeColor(i,color) {
     this.items[i].color.stroke = color;
  }

  getVar(name) {
    return this.variables[name]
  }

  setVar(name,value) {
    this.variables[name] = value;
  }

  delVar(name) {
    delete this.variables[name]
  }

  centerMouseX() {
    return this.evt.shape == "arc" ? this.evt.mouse.x : this.evt.mouse.x - this.evt.width / 2;
  }

  centerMouseY() {
    return this.evt.shape == "arc" ? this.evt.mouse.y : this.evt.mouse.y - this.evt.height / 2;
  }

  centerMouse() {
    return [this.centerMouseX(), this.centerMouseY()];
  }

  disableCursor() {
    this.getCanvas().style.cursor = "none";
  }

  enableCursor() {
    this.getCanvas().style.cursor = "";
  }

  getCanvas() {
    return document.getElementById(this.id);
  }

  start() {
    const t = this, drawFrame = t.drawFrame;
    this.drawFrame();
    t.refreshFrame = setInterval((function(){drawFrame.bind(this)()}).bind(t),(1000/t.fps));
  }

  pause() {
    this.isPaused = true;
  }

  unpause() {
    this.isPaused = false;
  }

  stop() {
    clearInterval(this.refreshFrame);
    delete this.refreshFrame;
  }

  validate(obj) {

    const t = this, {id} = obj, valid = { shapes: ["fillRect","arc"], types: ["mousedown","mouseup","mouseover","mouseout","dblclick","click","mousemove"] };
    let {fps,items} = obj;

    if (typeof id == "undefined" || !document.getElementById(id)) return;
    t.id = id;
    t.fps = typeof fps == "number" ? fps : 60;
    t.items = Array.isArray(items) ? items : [];
    t.events = {};
    t.isPaused = false;
    t.evt = {mouse:[],dimensions:[]};
    t.variables = {};
    t.physX = [];

    for (let i in items) {

      const item = items[i];
      let {shape ,dimensions, color, physX, events} = item, 
      {bounce, friction, gravity} = physX,
      enablePhysX = physX.enable,
      _validEvents = [], _drag, limits;

      shape = typeof shape == "string" && valid.shapes.includes(shape) ? shape : "fillRect";
      if (!Array.isArray(dimensions) || dimensions.length < 4 || isNaN(dimensions.reduce((a,b)=>a+b))) continue;

      color = typeof color == "object" ? color : {};
      color.fill = typeof color.fill == "string" ? color.fill : "black";
      color.stroke = typeof color.stroke == "string" ? color.stroke : "black";

      if (physX) {
      	gravity = typeof gravity == "number" ? gravity : 9.81;
      	bounce = typeof bounce == "number" ? bounce : 0.4;
      	friction = typeof friction == "number" ? friction : 0;
  	  }

      events = Array.isArray(events) ? events : [];

      _drag = events.map(v => v.drag == true);

      if (_drag.includes(true)) {

      const d = _drag.indexOf(true), event = events[d], {assists,dragAxis} = event,
        [ a, b, c ] = Array.isArray(assists) && assists.length == 3 && typeof (assists.reduce((a,b)=>a+b)) == "number" ? assists : [15,1000,2000];
        let f, counter = 0;

        for (let d = 0; d < _drag.length; d++) {
          if (_drag[d] == true) {
            (d - counter) == 0 ? items[i].events.splice(0,1) : items[i].events.splice(d - counter);
            counter += 1;
          }
        }

        items[i].events.push({type:"mousedown",assist:a,callback:function(e){this.items[e.id].physX.isDragged = true;this.disableCursor();}},{type:"mouseup",assist:c,callback:function(e){this.items[e.id].physX.isDragged = false;this.enableCursor();}});
              
        switch(dragAxis) {
          case "x": f = {type:"mousemove",assist:b,callback:function(e){if (this.itemIsDragged(e.id)) {this.setItemPos(e.id,{x:this.centerMouseX()})}}}; break;
          case "y": f = {type:"mousemove",assist:b,callback:function(e){if (this.itemIsDragged(e.id)) {this.setItemPos(e.id,{y:this.centerMouseY()})}}}; break;
          default:  f = {type:"mousemove",assist:b,callback:function(e){if (this.itemIsDragged(e.id)) {const [x,y] = this.centerMouse(); this.setItemPos(e.id,{x,y})}}}; break;
        }

        items[i].events.push(f);

        events = items[i].events;
      }

      for (let e in events) {

        const event = events[e], _eventKeys = Object.keys(t.events);
        let {type,callback,bindself,assist} = event;

        if (typeof type != "string" || !valid.types.includes(type) || typeof callback != "function") continue;
        bindself = typeof bindself == "boolean" ? bindself : true;
        assist = typeof assist == "number" ? assist : 0;

        if (!_eventKeys.includes(type)) {
          t.events[type] = [];
          t.events[type].push([Number(i),Number(e)]);
        }
        else if (Array.isArray(t.events[type]) && !t.events[type].map(v => v.join(",")).includes(`${i}-${e}`)) {
          t.events[type].push([Number(i),Number(e)])
        }

        _validEvents.push(e);

      }

      _validEvents = _validEvents.map(v => events[Number(v)]);

      t.physX.push(Number(i));
      this.items[i] = { shape, dimensions, color, enablePhysX, events: _validEvents, physX: {gravity, bounce, friction, acc:[0,0], isDragged:false} };
      const context = t.getCanvas().getContext("2d");
      this._2D = () => context;

    }

    t.start();
    t.addHandler();

  }

}


const C = new CanvasController({
  id: "display",
  fps: 240,
  items: [
    {shape:"arc",dimensions:[0,0,30,0,2 * Math.PI],physX:{enable:true,bounce:1},events:[{type:"mousedown",assist:50,callback:function(e){this.setItemRandomColor(e.id);this.randomizeItemState(e.id)}}]}
  ]
});

// {
//  id,
//  fps,
//  items: [ 
//    {
//      shape,
//      dimensions,
//      color: {fill, stroke},
//      physX: {enable, bounce, friction, gravity},
//        events: [{
//          type, 
//          callback (evt), (evt is needed to access the evt object if needed)
//          bindself, (by default set to true, use it only to set it to false)
//          assist (click assist: bigger number = bigger hitbox)
//        },{
//        drag: true,
//          assists: [mouseDown,mouseMove,MouseUp]
//        },
//        {
//         drag,
//         assists
//       }]
//     }
//   ]
// }
// TODO: enable screen collision (add switch(shape) ), enable item collision