/*
 *                ConnectedDots.JS v. 2.2.0
 * 
 *                Written by Bilotta Matteo.
 * 
 *  Copyright © 2015 - 2017, Bylothink. All rights reserved.
 */

// Checking if jQuery is available...
    if (typeof(jQuery) === "undefined")
    {
        throw new Error("jQuery is required by ConnectedDots to be executed.");
    }
    else if (typeof(jQuery.jByloth) === "undefined")
    {
        throw new Error("jByloth is required by ConnectedDots to be executed.");
    }

    // TODO: Controllo la versione attuale di jByloth?

(function(jQuery, window)
{
    "use strict";

    // Private static constants:
        const ANIM_TIME = {

            MIN: 1,
            MAX: 2
        };

        const DRAW_RANGE = 175;
        const DEFAULT_OPTS = {

            autoUpdate: true,
            color: new Color("265A88"),
            getSize: function()
            {
                return {

                    width: _$window.width(),
                    height: _$window.height()
                };
            }
        };

        const EXIT_COORDS = {

            X: -1920,
            Y: -1080
        };

        const MAX_LINKS = 5;
        const MIN_LINKS = Math.floor(MAX_LINKS / 2);
        const DOTS_SIZE = {

            MIN: 2,
            MAX: 2
        };

        const SPACING = 75;
        const WOBBING_RANGE = 100;

    // Private static properties:
        let _mouse = {

            x: EXIT_COORDS.X,
            y: EXIT_COORDS.Y
        };

        let _$window = jQuery(window);

    // Classes:
        let Dot = function(coordX, coordY)
        {
            // Private properties:
                let _this = this;

                let _animation;

            // Public properties:
                _this.originX = coordX;
                _this.originY = coordY;

                _this.x = coordX;
                _this.y = coordY;

                _this.closest = [];

                _this.size = (Math.random() * DOTS_SIZE.MAX) + DOTS_SIZE.MIN;

            // Public methods:
                _this.startAnimation = function()
                {
                    let newCoordX = _this.originX + ((Math.random() * WOBBING_RANGE) - (WOBBING_RANGE / 2));
                    let newCoordY = _this.originY + ((Math.random() * WOBBING_RANGE) - (WOBBING_RANGE / 2));

                    let duration = ANIM_TIME.MAX * Math.random() + ANIM_TIME.MIN;

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

                _this.stopAnimation = function()
                {
                    _animation.kill();
                };
        };

        let ConnectedDots = function(domElement, options)
        {
            // Private properties:
                let _this = this;

                let _context;
                let _dots;

                let _color;
                let _size;

            // Private methods:
                let _init = function()
                {
                    let ratio = window.devicePixelRatio || 1;

                    domElement.width = _size.width * ratio;
                    domElement.height = _size.height * ratio;

                    domElement.style.width = _size.width + "px";
                    domElement.style.height = _size.height + "px";

                    _context.scale(ratio, ratio);

                    // Initializing dots...
                        _dots = [];

                        for (let x = -1; (x * SPACING) < (domElement.width + SPACING); x += 1)
                        {
                            let row = [];

                            for (let y = -1; (y * SPACING) < (domElement.height + SPACING); y += 1)
                            {
                                let coordX = (x + Math.random()) * SPACING;
                                let coordY = (y + Math.random()) * SPACING;

                                row.push(new Dot(coordX, coordY));
                            }

                            _dots.push(row);
                        }

                    // Connecting dots...
                        for (let x1 = 0; x1 < _dots.length; x1 += 1)
                        {
                            for (let y1 = 0; y1 < _dots[x1].length; y1 += 1)
                            {
                                for (let x2 = 0; x2 < _dots.length; x2 += 1)
                                {
                                    for (let y2 = 0; y2 < _dots[x2].length; y2 += 1)
                                    {
                                        if (_dots[x1][y1] !== _dots[x2][y2])
                                        {
                                            let linked = false;
                                            let linkCount = 0;
                                            let max_links = _getMin((_dots.length - x1) + MIN_LINKS, (_dots[x1].length - y1) + MIN_LINKS, MAX_LINKS);

                                            do
                                            {
                                                if (jQuery.isUndefined(_dots[x1][y1].closest[linkCount]) === true)
                                                {
                                                    _dots[x1][y1].closest.push(_dots[x2][y2]);

                                                    linked = true;
                                                }

                                                linkCount += 1;
                                            }
                                            while ((linked === false) && (linkCount < max_links));

                                            linkCount = 0;

                                            while ((linked === false) && (linkCount < _dots[x1][y1].closest.length))
                                            {
                                                if (_getDistance(_dots[x1][y1], _dots[x2][y2]) < _getDistance(_dots[x1][y1], _dots[x1][y1].closest[linkCount]))
                                                {
                                                    _dots[x1][y1].closest[linkCount] = _dots[x2][y2];

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
                        for (let x1 = 0; x1 < _dots.length; x1 += 1)
                        {
                            for (let y1 = 0; y1 < _dots[x1].length; y1 += 1)
                            {
                                _dots[x1][y1].startAnimation();
                            }
                        }
                };

                let _update = function()
                {
                    let newSize = options.getSize(_this);

                    // TODO: Modificare questa logica introducendo una sorta di tolleranza?
                    //
                        if ((_size.width !== newSize.width) || (_size.height !== newSize.height))
                        {
                            _size = newSize;

                            // TODO: Evitare di eliminare e reinizializzare, ogni volta, TUTTI i ConnectedDots?
                            //
                                for (let x1 = 0; x1 < _dots.length; x1 += 1)
                                {
                                    for (let y1 = 0; y1 < _dots[x1].length; y1 += 1)
                                    {
                                        _dots[x1][y1].stopAnimation();
                                    }
                                }

                            _init();
                        }
                };

                let _draw = function()
                {
                    _context.clearRect(0, 0, domElement.width, domElement.height);

                    for (let x1 = 0; x1 < _dots.length; x1 += 1)
                    {
                        for (let y1 = 0; y1 < _dots[x1].length; y1 += 1)
                        {
                            let dotDistance = _getDistance(_dots[x1][y1], _mouse);

                            if (dotDistance < DRAW_RANGE)
                            {
                                _context.beginPath();
                                _context.arc(_dots[x1][y1].x, _dots[x1][y1].y, _dots[x1][y1].size, 0, 2 * Math.PI, false);
                                _context.fillStyle = "rgba(" + _color.toString(true, true) + ", " + (1 - (dotDistance / DRAW_RANGE)) + ")";
                                _context.fill();
                                _context.closePath();
                            }

                            for (let i = 0; i < _dots[x1][y1].closest.length; i += 1)
                            {
                                let startingDistance = _getDistance(_dots[x1][y1], _mouse);
                                let endingDistance = _getDistance(_dots[x1][y1].closest[i], _mouse);

                                if ((startingDistance < DRAW_RANGE) || (endingDistance < DRAW_RANGE))
                                {
                                    let gradient = _context.createLinearGradient(_dots[x1][y1].x, _dots[x1][y1].y, _dots[x1][y1].closest[i].x, _dots[x1][y1].closest[i].y);

                                    gradient.addColorStop(0, "rgba(" + _color.toString(true, true) + ", " + (1 - (startingDistance / DRAW_RANGE)) + ")");
                                    gradient.addColorStop(1, "rgba(" + _color.toString(true, true) + ", " + (1 - (endingDistance / DRAW_RANGE)) + ")");

                                    _context.beginPath();
                                    _context.moveTo(_dots[x1][y1].x, _dots[x1][y1].y);
                                    _context.lineTo(_dots[x1][y1].closest[i].x, _dots[x1][y1].closest[i].y);
                                    _context.strokeStyle = gradient;
                                    _context.stroke();
                                    _context.closePath();
                                }
                            }
                        }
                    }

                    requestAnimationFrame(_draw);
                };

            // Public methods:
                _this.update = function()
                {
                    _update();
                };

            // Initializing object...
                _color = options.color;
                _size = options.getSize();

                _context = domElement.getContext("2d");

                _init();

            // Start executions...
                requestAnimationFrame(_draw);

            if (options.autoUpdate === true)
            {
                // Start listening for events...
                    _$window.on("resized", _update);
            }
        };

    // Private static methods:
        let _getDistance = function(dot1, dot2)
        {
            return Math.sqrt(Math.pow(dot1.x - dot2.x, 2) + Math.pow(dot1.y - dot2.y, 2));
        };

        let _getMin = function(num1, num2, num3)
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

    // TODO: Capire se è necessario spostare questa logica all'interno di ogni instanza della classe.
    //
        let _onMouseMove = function(event)
        {
            let windowScrollTop = _$window.scrollTop();

            _mouse.x = event.clientX;
            _mouse.y = event.clientY + windowScrollTop;
        };
        let _onMouseOut = function()
        {
            _mouse.x = EXIT_COORDS.X;
            _mouse.y = EXIT_COORDS.Y;
        };

        // Start listening for global events...
            _$window.on("mousemove", _onMouseMove);
            _$window.on("mouseout", _onMouseOut);

    // Exposing ContextMenu as a jQuery plugin...
        jQuery.fn.connectedDots = function(options)
        {
            if (jQuery.isUndefined(this) === false)
            {
                let opts = jQuery.extend({ }, DEFAULT_OPTS, options);

                return new ConnectedDots(this[0], opts);
            }
        };

})(jQuery, window);
