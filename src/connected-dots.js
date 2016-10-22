/*
 *				  ConnectedDots.JS v. 2.0
 * 
 *				 Written by Bilotta Matteo.
 * 
 * Copyright © 2015 - 2016, Bylothink. All rights reserved.
 */

var Point = function(coordX, coordY)
{
    // Private constants:
        var SIZE = {

            MIN: 2,
            MAX: 2
        };
        var WOBBING_RANGE = 100;
        var ANIM_TIME = {

            MIN: 1,
            MAX: 2
        };

    // Private properties:
        var _this = this;
        var _animation = null;

    // Public properties:
        this.originX = coordX;
        this.originY = coordY;

        this.X = coordX;
        this.Y = coordY;

        this.closest = [];

        this.size = (Math.random() * SIZE.MAX) + SIZE.MIN;

    // Public methods:
        this.startAnimation = function()
        {
            var newCoordX = _this.originX + ((Math.random() * WOBBING_RANGE) - (WOBBING_RANGE / 2));
            var newCoordY = _this.originY + ((Math.random() * WOBBING_RANGE) - (WOBBING_RANGE / 2));

            var duration = ANIM_TIME.MAX * Math.random() + ANIM_TIME.MIN;

            _animation = TweenMax.to(_this, duration, {

                X: newCoordX,
                Y: newCoordY,

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
        var DRAW_RANGE = 175;
        var EXIT_COORDS = {

            X: -1920,
            Y: -1080
        };

        var MAX_LINKS = 5;
        var MIN_LINKS = Math.floor(MAX_LINKS / 2);

        var SPACING = 75;

    // Private properties:
        var _this = this;

        var _domElement = document.getElementById(selectorId);
        var _jqueryElement = $(_domElement);

        var _context;
        var _mouse = EXIT_COORDS;
        var _points;
        var _spacing;

        var _color = _jqueryElement.attr("data-color");

    // Private methods:
        var _getDistance = function(point1, point2)
        {
            return Math.sqrt(Math.pow(point1.X - point2.X, 2) + Math.pow(point1.Y - point2.Y, 2));
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
            _domElement.height = $(window).height();
            _domElement.width = $(window).width();

            _context = _domElement.getContext("2d");

            /* Initializing points... */
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

            /* Connecting points... */
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

            /* Initialization animations... */
                for (var x = 0; x < _points.length; x += 1)
                {
                    for (var y = 0; y < _points[x].length; y += 1)
                    {
                        _points[x][y].startAnimation();
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
            for (var x = 0; x < _points.length; x += 1)
            {
                for (var y = 0; y < _points[x].length; y += 1)
                {
                    var pointDistance = _getDistance(_points[x][y], _mouse);

                    if (pointDistance < DRAW_RANGE)
                    {
                        _context.beginPath();
                        _context.arc(_points[x][y].X, _points[x][y].Y, _points[x][y].size, 0, 2 * Math.PI, false);
                        _context.fillStyle = "rgba(" + _color + ", " + (1 - (pointDistance / DRAW_RANGE)) + ")";
                        _context.fill();
                        _context.closePath();
                    }

                    for (var i = 0; i < _points[x][y].closest.length; i += 1)
                    {
                        var startingDistance = _getDistance(_points[x][y], _mouse);
                        var endingDistance = _getDistance(_points[x][y].closest[i], _mouse);

                        if ((startingDistance < DRAW_RANGE) || (endingDistance < DRAW_RANGE))
                        {
                            var gradient = _context.createLinearGradient(_points[x][y].X, _points[x][y].Y, _points[x][y].closest[i].X, _points[x][y].closest[i].Y);

                            gradient.addColorStop(0, "rgba(" + _color + ", " + (1 - (startingDistance / DRAW_RANGE)) + ")");
                            gradient.addColorStop(1, "rgba(" + _color + ", " + (1 - (endingDistance / DRAW_RANGE)) + ")");

                            _context.beginPath();
                            _context.moveTo(_points[x][y].X, _points[x][y].Y);
                            _context.lineTo(_points[x][y].closest[i].X, _points[x][y].closest[i].Y);
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
                _mouse = {

                    X: event.clientX,
                    Y: event.clientY // + $(document).scrollTop()
                };
            });

            $(window).mouseout(function(event)
            {
                _mouse = EXIT_COORDS;
            });

    $(window).resize(function()
    {
        for (var x = 0; x < _points.length; x += 1)
        {
            for (var y = 0; y < _points[x].length; y += 1)
            {
                _points[x][y].killAnimation();
            }
        }

        _this.initialize();
    });
};
