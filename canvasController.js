class CanvasController {

    constructor(object) {

        const t = this;

            t.events = {};
            t._isPaused = false;
            t._evt = {mouse:[],dimensions:[]};
            t._vars = {};
            t._physX = [];
            t.speedMult = 1;

        t.validate(object);

    }

    // {id,fps,grid,items}
    // {shape,dimensions,color:{fill,stroke},physX:{enable,bounce,friction},events}
    // {type,assist,callback,bindself}
    validate(obj) {

        const t = this,
        /**/
        /**/ id = obj.id;
        /**/ let {fps,items,grid} = obj;
        /**/
        if (typeof id == "undefined" || !document.getElementById(id)) return;
        t.id = id;
        t.fps = typeof fps == "number" ? fps : 60;
        t.grid = typeof grid == "boolean" ? grid : false;
        t.items = [];

        const context = t.getCanvas().getContext("2d");

        t._2D = () => context;

        for (let index in items) {

          t.addItem(items[index]);

        }

        t.start();

      }

    // {shape,dimensions,color:{fill,stroke},physX:{enable,bounce,friction},events}
    addItem(item) {
        /**/
        /**/const t = this, index = t.items.length, shapes = {"fillRect":4,"arc":5},
        /**/      {shape, dimensions, physX, events} = typeof item == "object" ? item : {};
        /**/let   color = typeof item.color == "object" ? color : {},
        /**/      {fill, stroke                           } = typeof color == "object" ? color : {},
        /**/      {enable, gravity, bounce, friction, acc } = typeof physX == "object" ? physX : {},
        /**/      output = {};
        /**/
        if (Object.keys(shapes).includes(shape) && dimensions.length == shapes[shape]) {

            //events = Array.isArray(events) ? events : [];
            color.fill = typeof fill == "string" ? fill : "black";
            color.stroke = typeof stroke == "string" ? stroke : "black";
            enable = typeof enable == "boolean" ? enable : false;


            if (enable) {

                t._physX.push(index);
                physX.enable = enable;
                physX.gravity = typeof gravity == "number" ? gravity : 9.81;
                physX.bounce = typeof bounce == "number" ? bounce : 0.4;
                physX.friction = typeof friction == "number" ? friction : 0.0;
                physX.acc = Array.isArray(acc) && acc.length == 2 && typeof acc.reduce((a,b)=>a+b) == "number" ? acc : [0,0];
                physX.isDragged = false;

            }
      
            const _validEvents = t.validateEvents(events);
            t.registerEvents(index,_validEvents);
            output = {shape,dimensions,color,physX,events:_validEvents};

            t.items.push(output);

        }

    }

    // {type,assist,callback,bindself,assists,dragAxis}
    validateEvents(events) {

        const _events = [], types = ["mousedown","mouseup","mouseover","mouseout","dblclick","click","mousemove","drag"/*,"hover"*/], axis = ["x","y"];

        for (let e in events) {
        /**/
        /**/const event = events[e], 
        /**/      {type} = event;
        /**/let   {callback,assist,dragAxis,assists,bindself} = event;
        /**/
            const typeIndex = typeof type == "string" ? types.indexOf(type) : -1;
            bindself = typeof bindself == "boolean" ? bindself : true;
            callback = typeof callback == "function" ? callback : function(){};

            if (typeIndex == -1) continue;

            // 7 == index of "custom" events ("drag" and "hover")
            else if (typeIndex < 7) {

                assist = typeof assist == "number" ? assist : 0;
                _events.push({type,assist,callback,bindself});

            }

            else if (typeIndex == 7) {

                assists = Array.isArray(assists) ? assists : [15,1000,2000];
                let _dragEvents = [], [a,b,c] = assists;
                a = typeof a == "number" ? a : 15;
                b = typeof b == "number" ? b : 1000;
                c = typeof c == "number" ? c : 2000;
                dragAxis = typeof dragAxis == "string" && axis.includes(dragAxis) ? dragAxis : "";

                _dragEvents.push({type:"mousedown",assist:a,callback:function(e){this.items[e.id].physX.isDragged=true;this.disableCursor();}},{type:"mouseup",assist:c,callback:function(e){this.items[e.id].physX.isDragged=false;this.enableCursor();}})

                switch(dragAxis) {
                    case "x": _dragEvents.push({type:"mousemove",assist:b,callback:function(e){if (this.itemIsDragged(e.id)) {this.setItemPos(e.id,{x:this.centerMouseX()})}},bindself:true}); break;
                    case "y": _dragEvents.push({type:"mousemove",assist:b,callback:function(e){if (this.itemIsDragged(e.id)) {this.setItemPos(e.id,{y:this.centerMouseY()})}},bindself:true}); break;
                    default : _dragEvents.push({type:"mousemove",assist:b,callback:function(e){if (this.itemIsDragged(e.id)) {const [x,y] = this.centerMouse(); this.setItemPos(e.id,{x,y})}},bindself:true}); break;
                }

                _events.push(..._dragEvents);

            }

        }

        return _events;

    }

    registerEventType(type) {

        const t = this, events = t.events;

        if (typeof type == "string" && typeof events[type] == "undefined") {
            t.events[type] = [];
            t.addHandler(type);
        }

    }

    registerEvents(index,events) {

        const t = this, _eventKeys = events.map(v => v.type);

        _eventKeys.forEach(v => t.registerEventType(v));

        for (let e in events) {

            const event = events[e];
            t.events[_eventKeys[e]].push([index,e]);

        }

    }

    addHandler(event) {

        const t = this, eventHandler = t.eventHandler;
        t.getCanvas().addEventListener(event, eventHandler.bind(t));

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

                t._evt = evt;

                ev.bindself == false ? ev.callback() : ev.callback.call(t,evt);

            }

        }

    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                      NEEDS OPTIMIZATION
    gravity() {

        if (!this._isPaused) {

            const t = this, items = t._physX, fps = t.fps, [clientWidth, clientHeight] = t.client,
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

                if (t.items[id].physX.enable && !t.itemIsDragged(id)) {

                    const item = t.items[id], physX = item.physX, {gravity, bounce, friction, acc} = physX, {shape, dimensions} = item, [x, y] = dimensions, speedMult = t.speedMult;
                    let limitsX, limitsY, nextPos = [x, y], adjust1, adjust2;

                    // y
                    acc[1] += (gravity / fps) * speedMult;
                    nextPos[1] += acc[1];
                    // x
                    acc[0] = acc[0] * (1 - (friction / 100));
                    nextPos[0] += (acc[0] / fps) * speedMult;

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

                else { t.setItemAcc(id, [0, 0]) }

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

        const t = this, items = t.items, _isPaused = t._isPaused;

        if (_isPaused == false) {

            t.canvasAdapt();
            //t.clearFrame();
            t.drawGrid();
            t.gravity();

            for (let i in items) {

                t.drawItem(i);

            }

        }

    }

    drawGrid() {

        if (this.grid == true) {

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
        const t = this, item = t.items[i], g = [-15,-11,-7,7,11,15], R = [15,20,25,30,35];

        if (item.shape == "arc") {
            const r = item.dimensions[2], [clientWidth, clientHeight] = t.client,
            newX = Math.floor(Math.random() * (clientWidth-r*2)) + r,
            newY = Math.floor(Math.random() * (clientHeight-r*5)) + r*3,
            newHA = Math.floor(Math.random() * 1000) + 500;
            t.items[i].physX.gravity = g[Math.floor(Math.random() * g.length)];
            t.items[i].dimensions[2] = R[Math.floor(Math.random() * R.length)];

            t.setItemPos(i,{x:newX,y:newY});
            t.setItemHAcc(i,newHA);
        }
    }

    itemIsDragged(i) {
          return this.items[i].physX.isDragged;
    }

    setItemPos(i,{x,y}) {
        this.items[i].dimensions[0] = typeof x == "number" ? x : this.items[i].dimensions[0];
        this.items[i].dimensions[1] = typeof y == "number" ? y : this.items[i].dimensions[1];
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
        return this._vars[name]
    }

    setVar(name,value) {
        this._vars[name] = value;
    }

    delVar(name) {
        delete this._vars[name]
    }

    centerMouseX() {
        return this._evt.shape == "arc" ? this._evt.mouse.x : this._evt.mouse.x - this._evt.width / 2;
    }

    centerMouseY() {
        return this._evt.shape == "arc" ? this._evt.mouse.y : this._evt.mouse.y - this._evt.height / 2;
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
        this._isPaused = true;
    }

    unpause() {
        this._isPaused = false;
    }

    stop() {
        clearInterval(this.refreshFrame);
        delete this.refreshFrame;
    }

}

// {
//  id,
//  fps,
//  grid,
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
//