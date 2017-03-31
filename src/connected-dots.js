/*
 *                ConnectedDots.JS v. 2.1.0
 * 
 *                Written by Bilotta Matteo.
 * 
 *  Copyright © 2015 - 2016, Bylothink. All rights reserved.
 */

var Point = function(coordX, coordY)
{
    // Private constants:
        const SIZE = {

            MIN: 2,
            MAX: 2
        };
        const WOBBING_RANGE = 100;
        const ANIM_TIME = {

            MIN: 1,
            MAX: 2
        };

    // Private properties:
        var _this = this;
        var _animation = null;

    // Public properties:
        this.originX = coordX;
        this.originY = coordY;

        this.x = coordX;
        this.y = coordY;

        this.closest = [];

        this.size = (Math.random() * SIZE.MAX) + SIZE.MIN;

    // Public methods:
        this.startAnimation = function()
        {
            var newCoordX = _this.originX + ((Math.random() * WOBBING_RANGE) - (WOBBING_RANGE / 2));
            var newCoordY = _this.originY + ((Math.random() * WOBBING_RANGE) - (WOBBING_RANGE / 2));

            var duration = ANIM_TIME.MAX * Math.random() + ANIM_TIME.MIN;

            _animation = TweenMax.to(_this, duration, {

                x: newCoordX,
                y: newCoordY,

                ease: Back.easeInOut,

                onComplete: function()
                {
                    _this.startAnimation();
                }
            });
        };

        this.killAnimation = function()
        {
            _animation.kill();
        }
};

var ConnectedDots = function(selectorId)
{
    // Private Constants:
        const DRAW_RANGE = 175;
        const EXIT_COORDS = {

            X: -1920,
            Y: -1080
        };

        const MAX_LINKS = 5;
        const MIN_LINKS = Math.floor(MAX_LINKS / 2);

        const SPACING = 75;

    // Private properties:
        var _this = this;

        var _domElement = document.getElementById(selectorId);

        var _size = {

            width: $(window).width(),
            height: $(window).height()
        };
        var _mouse = {
            
            x: EXIT_COORDS.X,
            y: EXIT_COORDS.Y
        };

        var _context;
        var _points;
        var _spacing;

        var _color = $(_domElement).data("color");

    // Private methods:
        var _getDistance = function(point1, point2)
        {
            return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
        };

        var _getMin = function(num1, num2, num3)
        {
            if (num1 <= num3)
            {
                if (num2 <= num3)
                {
                    if (num1 <= num2)
                    {
                        return num1;
                    }
                    else
                    {
                        return num2;
                    }
                }
                else
                {
                    return num1;
                }
            }
            else if (num2 <= num3)
            {
                return num2;
            }
            else
            {
                return num3;
            }
        };

    // Public methods:
        this.initialize = function()
        {
            _domElement.width = _size.width;
            _domElement.height = _size.height;

            _context = _domElement.getContext("2d");

            // Initializing points...
                _points = [];

                for (var x = -1; (x * SPACING) < (_domElement.width + SPACING); x += 1)
                {
                    var row = [];

                    for (var y = -1; (y * SPACING) < (_domElement.height + SPACING); y += 1)
                    {
                        var coordX = (x + Math.random()) * SPACING;
                        var coordY = (y + Math.random()) * SPACING;

                        row.push(new Point(coordX, coordY));
                    }

                    _points.push(row);
                }

            // Connecting points...
                for (var x1 = 0; x1 < _points.length; x1 += 1)
                {
                    for (var y1 = 0; y1 < _points[x1].length; y1 += 1)
                    {
                        for (var x2 = 0; x2 < _points.length; x2 += 1)
                        {
                            for (var y2 = 0; y2 < _points[x2].length; y2 += 1)
                            {
                                if (_points[x1][y1] != _points[x2][y2])
                                {
                                    var linked = false;
                                    var linkCount = 0;
                                    var max_links = _getMin((_points.length - x1) + MIN_LINKS, (_points[x1].length - y1) + MIN_LINKS, MAX_LINKS);

                                    do
                                    {
                                        if (_points[x1][y1].closest[linkCount] == undefined)
                                        {
                                            _points[x1][y1].closest.push(_points[x2][y2]);

                                            linked = true;
                                        }

                                        linkCount += 1;
                                    }
                                    while ((linked == false) && (linkCount < max_links));

                                    linkCount = 0;

                                    while ((linked == false) && (linkCount < _points[x1][y1].closest.length))
                                    {
                                        if (_getDistance(_points[x1][y1], _points[x2][y2]) < _getDistance(_points[x1][y1], _points[x1][y1].closest[linkCount]))
                                        {
                                            _points[x1][y1].closest[linkCount] = _points[x2][y2];

                                            linked = true;
                                        }

                                        linkCount += 1;
                                    }
                                }
                            }
                        }
                    }
                }

            // Initialization animations...
                for (var x1 = 0; x1 < _points.length; x1 += 1)
                {
                    for (var y1 = 0; y1 < _points[x1].length; y1 += 1)
                    {
                        _points[x1][y1].startAnimation();
                    }
                }
        };

        this.updateFrame = function(timestamp)
        {
            _context.clearRect(0, 0, _domElement.width, _domElement.height);

            _this.draw();

            requestAnimationFrame(_this.updateFrame);
        };

        this.draw = function()
        {
            for (var x1 = 0; x1 < _points.length; x1 += 1)
            {
                for (var y1 = 0; y1 < _points[x1].length; y1 += 1)
                {
                    var pointDistance = _getDistance(_points[x1][y1], _mouse);

                    if (pointDistance < DRAW_RANGE)
                    {
                        _context.beginPath();
                        _context.arc(_points[x1][y1].x, _points[x1][y1].y, _points[x1][y1].size, 0, 2 * Math.PI, false);
                        _context.fillStyle = "rgba(" + _color + ", " + (1 - (pointDistance / DRAW_RANGE)) + ")";
                        _context.fill();
                        _context.closePath();
                    }

                    for (var i = 0; i < _points[x1][y1].closest.length; i += 1)
                    {
                        var startingDistance = _getDistance(_points[x1][y1], _mouse);
                        var endingDistance = _getDistance(_points[x1][y1].closest[i], _mouse);

                        if ((startingDistance < DRAW_RANGE) || (endingDistance < DRAW_RANGE))
                        {
                            var gradient = _context.createLinearGradient(_points[x1][y1].x, _points[x1][y1].y, _points[x1][y1].closest[i].x, _points[x1][y1].closest[i].y);

                            gradient.addColorStop(0, "rgba(" + _color + ", " + (1 - (startingDistance / DRAW_RANGE)) + ")");
                            gradient.addColorStop(1, "rgba(" + _color + ", " + (1 - (endingDistance / DRAW_RANGE)) + ")");

                            _context.beginPath();
                            _context.moveTo(_points[x1][y1].x, _points[x1][y1].y);
                            _context.lineTo(_points[x1][y1].closest[i].x, _points[x1][y1].closest[i].y);
                            _context.strokeStyle = gradient;
                            _context.stroke();
                            _context.closePath();
                        }
                    }
                }
            }
        };

    // Start executions...
        requestAnimationFrame(_this.updateFrame);

    // Listening for events...
        // Mouse events:
            $(window).mousemove(function(event)
            {
                _mouse.x = event.clientX;
                _mouse.y = event.clientY; // + $(document).scrollTop();
            });

            $(window).mouseout(function(event)
            {
                _mouse = {
                    
                    x: EXIT_COORDS.X,
                    y: EXIT_COORDS.Y
                };
            });

        $(window).resize(function()
        {
            var newWidth = $(window).width();
            var newHeight = $(window).height();

            // TODO: Modificare questa logica introducendo una sorta di tolleranza?
            //
                if ((_size.width != newWidth) || (_size.height != newHeight))
                {
                    _size.width = newWidth;
                    _size.height = newHeight;

                    // TODO: Evitare di eliminare e reinizializzare, ogni volta, TUTTI i ConnectedDots?
                    //
                        for (var x1 = 0; x1 < _points.length; x1 += 1)
                        {
                            for (var y1 = 0; y1 < _points[x1].length; y1 += 1)
                            {
                                _points[x1][y1].killAnimation();
                            }
                        }

                        _this.initialize();
                }
        });
};
