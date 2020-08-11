class CanvasGrid {

    constructor(grid,context) {
        for (let key in grid) {
            this[key] = grid[key];
        }

        this._2D = context;
    }

    draw(client) {

        const t = this;

        if (t.en() == true) {

            const _2D = t._2D, [ clientWidth, clientHeight ] = client, cellSize = t.cell(), 
                  rows = Math.ceil(clientHeight / cellSize), columns = Math.ceil(clientWidth / cellSize);

            let xPos = cellSize, yPos = cellSize;

            _2D.lineWidth = t.lWidth();
            _2D.strokeStyle = t.st();
            _2D.setLineDash(t.lDash());

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

    en() {
        return this.enable;
    }

    _en(v) {
        this.enable = v;
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