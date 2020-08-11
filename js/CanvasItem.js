class CanvasItem {

    constructor(item,context) {

        const t = this;

        for (let key in item) {
            t[key] = item[key];
        }

        const shape = t.sh();

        t._2D = context;

        switch (shape) {
            case "fillRect": t.draw = function() { t._2D.fillStyle = t.fill(); t._2D[shape](...t.dims()) }; break;
            case "arc": t.draw = function() { const _2D = t._2D; _2D.fillStyle = t.fill(); _2D.strokeStyle = t.stroke(); _2D.beginPath(); _2D[shape](...t.dims()); _2D.fill(); _2D.stroke() }; break;
        }
    }

    step(fps,speedMult) {

        const t = this;

        if (t.isDragged()) {
            t._acc([0,0]);
        }
        else if (t.phEnable()) {

            const {gravity, bounce, friction} = t.phX(), 
            shape = t.sh(), 
            [x, y] = t.xy(),
            nextStep = [];

            let acc = t.acc();

            // x
            acc[0] = acc[0] * (1 - (friction / 100));
            nextStep[0] = x + (acc[0] / fps) * speedMult;
            // y
            acc[1] += (gravity / fps) * speedMult;
            nextStep[1] = y + acc[1];

            t._acc(acc);
            t._xy(nextStep);

        }

    }

    inBounds(client) {

        const t = this, [x,y] = t.xy(), [clientWidth, clientHeight] = client;
        let limitsX, limitsY;

        if (t.sh() == "arc") {
            const r = t.a();
            limitsX = [r, clientWidth - r];
            limitsY = [r, clientHeight - r];
        }
        else {
            const [w,h] = t.abc();
            limitsX = [0, clientWidth - w]; limitsY = [0, clientHeight - h];
        }

        if (limitsX[0] >= x) {
            t._x(limitsX[0]),
            t.hBounce();
        }
        else if (limitsX[1] <= x) {
            t._x(limitsX[1]),
            t.hBounce();
        }
        if (limitsY[0] >= y) {
            t._y(limitsY[0]),
            t.vBounce();
        }
        else if (limitsY[1] <= y) {
            t._y(limitsY[1]),
            t.vBounce();
        }

    }

    sh() {
        return this.shape;
    }

    _sh(v) {
        this.shape = v;
    }

    dims() {
        return this.dimensions;
    }

    _dims(v) {
        this.dimensions = v;
    }

    x() {
        return this.dimensions[0];
    }

    _x(v) {
        this.dimensions[0] = v;
    }

    y() {
        return this.dimensions[1];
    }

    _y(v) {
        this.dimensions[1] = v;
    }

    xy() {
        return this.dimensions.slice(0,2);
    }

    _xy([x,y]) {
        this.dimensions[0] = x;
        this.dimensions[1] = y;
    }

    a() {
        return this.dimensions[2];
    }

    _a(v) {
        this.dimensions[2] = v;
    }

    b() {
        return this.dimensions[3];
    }

    _b(v) {
        this.dimensions[3] = v;
    }

    c() {
        return this.dimensions[4];
    }

    _c(v) {
        this.dimensions[4] = v;
    }

    abc() {
        return this.dimensions.slice(2);
    }

    color() {
        return this.color;
    }

    _color({fill,stroke}) {
        this.color.fill = fill;
        this.color.stroke = stroke;
    }

    fill() {
        return this.color.fill;
    }

    _fill(v) {
        this.color.fill = v;
    }

    stroke() {
        return this.color.stroke;
    }

    _stroke(v) {
        this.color.stroke = v;
    }

    phX() {
        return this.physX;
    }

    phEnable() {
        return this.physX.enable;
    }

    _phEnable(v) {
        this.physX.enable = v;
    }

    gr() {
        return this.physX.gravity;
    }

    _gr(v) {
        this.physX.gravity = v;
    }

    bo() {
        return this.physX.bounce;
    }

    _bo(v) {
        this.physX.bounce = v;
    }

    hBounce() {
      this.physX.acc[0] *= -this.physX.bounce;
    }

    vBounce() {
      this.physX.acc[1] *= -this.physX.bounce;
    }

    fr() {
        return this.physX.friction;
    }

    _fr(v) {
        this.physX.friction = v;
    }

    acc() {
        return this.physX.acc;
    }

    _acc([hAcc,vAcc]) {
        this.physX.acc[0] = hAcc;
        this.physX.acc[1] = vAcc;
    }

    hAcc() {
        return this.physX.acc[0];
    }

    _hAcc(v) {
        this.physX.acc[0] = v;
    }

    vAcc() {
        return this.physX.acc[1];
    }

    _vAcc(v) {
        this.physX.acc[1] = v;
    }

    isDragged() {
        return this.physX.isDragged;
    }

    _isDragged(v) {
        this.physX.isDragged = v;
    }

    evts() {
        return this.events;
    }

    ev(i) {
        return this.events[i];
    }

}