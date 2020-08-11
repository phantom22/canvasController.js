class CanvasGrid {

    constructor(grid) {
        for (let key in grid) {
            this[key] = grid[key];
        }
    }


    dr() {
        return this.draw;
    }

    _dr(v) {
        this.draw = v;
    }

    cell() {
        return this.cellSize;
    }

    _cell(v) {
        this.cellSize = v;
    }

    lWidth() {
        return this.lineWidth;
    }

    _lWidth(v) {
        this.lineWidth = v;
    }

    lDash() {
        return this.lineDash;
    }

    _lDash(v) {
        this.lineDash = v;
    }

    st() {
        return this.strokeStyle;
    }

    _st(v) {
        this.strokeStyle = v;
    }

}