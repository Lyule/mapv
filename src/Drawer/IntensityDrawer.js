/**
 * @file 按渐变颜色分类绘制方法
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 */

/* globals Drawer, util */

function IntensityDrawer() {
    this.masker = {
        min: 0,
        max: 0
    };
    Drawer.apply(this, arguments);

    // 临时canvas，用来绘制颜色条，获取颜色
    this._tmpCanvas = document.createElement('canvas');
    this.gradient(this.defaultGradient);
}

util.inherits(IntensityDrawer, Drawer);

IntensityDrawer.prototype.defaultGradient = {
    '0.0': 'yellow',
    '1.0': 'red'
};

IntensityDrawer.prototype.drawMap = function (mapv, ctx) {
    var self = this;
    mapv = self.mapv = self.mapv || mapv;
    ctx = self.ctx = self.ctx || ctx;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);


    var data = this._layer.getData();
    var drawOptions = this.drawOptions;
    ctx.strokeStyle = drawOptions.strokeStyle;

    var ctxW = ctx.canvas.width;
    var ctxH = ctx.canvas.height;

    window.console.time('drawMap');

    for (var i = 0, len = data.length; i < len; i++) {
        var item = data[i];
        if (item.px < 0 || item.px > ctxW || item.py < 0 || item.py > ctxH) {
            continue;
        }
        var isTooSmall = self.masker.min && (item.count < self.masker.min);
        var isTooBig = self.masker.max && (item.count > self.masker.max);
        if (isTooSmall || isTooBig) {
            continue;
        }
        ctx.beginPath();
        ctx.moveTo(item.px, item.py);
        ctx.fillStyle = this.getColor(item.count);
        ctx.arc(item.px, item.py, drawOptions.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    window.console.timeEnd('drawMap');

    if (drawOptions.strokeStyle) {
        ctx.stroke();
    }

    this.Scale.set({
        min: 0,
        max: self.getMax(),
        colors: 'default'
    });
};

IntensityDrawer.prototype.scale = function (scale) {
    var self = this;

    scale.change(function (min, max) {
        self.masker = {
            min: min,
            max: max
        };

        self.drawMap();
    });
    self.Scale = scale;
};

IntensityDrawer.prototype.getMax = function () {
    var dataRange = this.mapv.geoData.getDataRange();
    var max = dataRange.max;

    if (this.drawOptions.max) {
        max = this.drawOptions.max;
    }
    return max;
};

IntensityDrawer.prototype.getColor = function (val) {
    var max = this.getMax();

    var index = val / max;
    if (index > 1) {
        index = 1;
    }
    index *= 255;
    index = parseInt(index, 10);
    index *= 4;

    var color = 'rgba(' + this._grad[index] + ', ' + this._grad[index + 1] + ', ' + this._grad[index + 2] + ',0.8)';
    return color;
};

IntensityDrawer.prototype.gradient = function (grad) {
    // create a 256x1 gradient
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var gradient = ctx.createLinearGradient(0, 0, 0, 256);

    canvas.width = 1;
    canvas.height = 256;

    for (var i in grad) {
        gradient.addColorStop(i, grad[i]);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);

    this._grad = ctx.getImageData(0, 0, 1, 256).data;

    return this;
};
