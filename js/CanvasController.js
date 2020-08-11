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

    addMethod(name,func) {
        if (typeof func=="function") {
            this[name] = func;
        }
    }

    // {id,fps,grid,background,items}
    validate(obj) {

        const t = this, id = obj.id;

        let {fps,grid,background,items} = obj,
            {draw,cellSize,lineWidth,color,lineDash} = typeof grid == "object" ? grid : {};
        
        if (typeof id == "undefined" || !document.getElementById(id)) return;

        t.id = id;
        fps = typeof fps == "number" ? fps : 60;
        t.fps = () => fps;
        draw = typeof draw == "boolean" ? draw : false;
        cellSize = typeof cellSize == "number" ? cellSize : 100;
        lineWidth = typeof lineWidth == "number" ? lineWidth : 1;
        color = typeof color == "string" ? color : "white";
        lineDash = typeof lineDash != "undefined" && Array.isArray(lineDash) && lineDash.length == 2 && typeof lineDash.reduce((a,b)=>a+b) == "number" ? lineDash : [0,0];
        t.grid = new CanvasGrid({draw,cellSize,lineWidth,strokeStyle:color,lineDash});
        t.items = [];
        t.background = typeof background == "string" ? background : "black";

        const context = t.getCanvas().getContext("2d", {alpha: false});

        t._2D = () => context;

        for (let index in items) {

          t.addItem(items[index]);

        }

        obj.methods.forEach(v => t.addMethod(v.name,v.function));

        t.start();

    }

    bg() {
        return this.background;
    }

    _bg(v) {
        this.background = v;
    }

    // {shape,dimensions,color:{fill,stroke},physX:{enable,bounce,friction},events}
    addItem(item) {
        
        const t = this, index = t.items.length, shapes = {"fillRect":4,"arc":5},
              {shape, dimensions, physX, events} = typeof item == "object" ? item : {};
        let   color = typeof item.color == "object" ? color : {},
              {fill, stroke                           } = typeof color == "object" ? color : {},
              {enable, gravity, bounce, friction, acc } = typeof physX == "object" ? physX : {},
              output = {};
        
        if (Object.keys(shapes).includes(shape) && dimensions.length == shapes[shape]) {

            //events = Array.isArray(events) ? events : [];
            color.fill = typeof fill == "string" ? fill : "black";
            color.stroke = typeof stroke == "string" ? stroke : "black";
            enable = typeof enable == "boolean" ? enable : false;

            t._physX.push(index);
            physX.enable = typeof enable == "boolean" ? enable : false;
            physX.gravity = typeof gravity == "number" ? gravity : 9.81;
            physX.bounce = typeof bounce == "number" ? bounce : 0.4;
            physX.friction = typeof friction == "number" ? friction : 0.0;
            physX.acc = Array.isArray(acc) && acc.length == 2 && typeof acc.reduce((a,b)=>a+b) == "number" ? acc : [0,0];
            physX.isDragged = false;
      
            const _validEvents = t.validateEvents(events);
            t.registerEvents(index,_validEvents);
            output = {shape,dimensions,color,physX,events:_validEvents};

            t.items.push(new CanvasItem(output,t._2D()));

        }

    }

    // {type,assist,callback,bindself,assists,dragAxis}
    validateEvents(events) {

        const _events = [], types = ["mousedown","mouseup","mouseover","mouseout","dblclick","click","mousemove","drag"/*,"hover"*/], axis = ["x","y"];

        for (let e in events) {
            
            const event = events[e], 
                  {type} = event;
            let   {callback,assist,dragAxis,assists,bindself} = event;
            
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

                _dragEvents.push({type:"mousedown",assist:a,callback:function(i){i._isDragged(true);this.disableCursor();}},{type:"mouseup",assist:c,callback:function(i){i._isDragged(false);this.enableCursor();}})

                switch(dragAxis) {
                    case "x": _dragEvents.push({type:"mousemove",assist:b,callback:function(i){if (i.isDragged()) {i._x(this.centerMouseX())}},bindself:true}); break;
                    case "y": _dragEvents.push({type:"mousemove",assist:b,callback:function(i){if (i.isDragged()) {i._y(this.centerMouseY())}},bindself:true}); break;
                    default : _dragEvents.push({type:"mousemove",assist:b,callback:function(i){if (i.isDragged()) {const [x,y] = this.centerMouse(); i._xy([x,y])}},bindself:true}); break;
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
    
        const t = this, mouse = [evt.clientX, evt.clientY], type = evt.type, eventType = t.events[type];

        for (let e in eventType) {

            const itemId = eventType[e][0],
            eventId = eventType[e][1],
            item = t.items[itemId],
            [x,y] = item.xy(),
            shape = item.shape,
            event = item.events[eventId],
            assist = typeof event.assist == "number" ? event.assist : 0;

            let [w,h] = item.abc(), itemBordersX, itemBordersY, result;

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
                evt.id = itemId;
                evt.item = item;

                t._evt = evt;

                event.bindself == false ? event.callback() : event.callback.call(t,item,evt);

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

        const t = this, items = t.items, _isPaused = t._isPaused, fps = t.fps(), speedMult = t.speedMult;

        if (_isPaused == false) {

            t.canvasAdapt();
            t.clearFrame();
            t.drawGrid();

            const client = t.client;

            for (let i in items) {

                items[i].step(fps,speedMult);
                items[i].inBounds(client);
                items[i].draw();

            }

        }

    }

    drawGrid() {

        const t = this, g = t.grid;

        if (g.dr() == true) {

            const t = this, _2D = t._2D(), { clientWidth, clientHeight } = t.getCanvas(), cellSize = g.cell(), 
                  rows = Math.ceil(clientHeight / cellSize), columns = Math.ceil(clientWidth / cellSize);

            let xPos = cellSize, yPos = cellSize;

            _2D.lineWidth = g.lWidth();
            _2D.strokeStyle = g.st();
            _2D.setLineDash(g.lDash());

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

        _2D.fillStyle = t.bg();
        _2D.fillRect(0,0,clientWidth,clientHeight);

    }

    canvasAdapt() {

        const t = this, c = t.getCanvas(), {clientWidth, clientHeight} = c;
        c.width = clientWidth;
        c.height = clientHeight;
        t.client = [clientWidth, clientHeight];

        t.items.forEach(v => v.client = t.client);

    }

    centerMouseX() {
        return this._evt.item.sh() == "arc" ? this._evt.mouse.x : this._evt.mouse.x - this._evt.item.a() / 2;
    }

    centerMouseY() {
        return this._evt.item.sh() == "arc" ? this._evt.mouse.y : this._evt.mouse.y - this._evt.item.b() / 2;
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
        let dFrames = 0;
        t.drawnFrames = () => dFrames;
        this.drawFrame();
        t.refreshFrame = setInterval((function(){drawFrame.bind(this)(); dFrames++}).bind(t),(1000/t.fps()));
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
//  grid: {
//    draw, 
//    cellSize,
//    lineWidth,
//    color,
//    lineDash
//  },
//  background,
//  methods: [
//    {name,function}
//  ],
//  items: [ 
//    {
//      shape,
//      dimensions,
//      color: {fill, stroke},
//      physX: {enable, bounce, friction, gravity},
//        events: [{
//          type, 
//          callback (item,evt), (item gives an easy access to all the parameters of the affected item)
//          bindself, (by default set to true, use it only to set it to false)
//          assist (click assist: bigger number = bigger hitbox)
//        },{
//        type: "drag",
//          assists: [mouseDown,mouseMove,MouseUp]
//        }]
//     }
//   ]
// }
//