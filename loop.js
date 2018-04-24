var Loop = function(cfg){ this.setConfig(cfg); };
Object.assign(Loop.prototype, {

  setConfig: function(cfg) {
    // config
    var nope = function(){};
    this.onUpdate = cfg.handleUpdate || nope;
    this.onRender = cfg.handleRender || nope;
    var timestep = cfg.timestep || 66;
    var maxFps = cfg.maxFps || 66;

    // consts
    this.timestep = 1000 / timestep;
    this.minFrameTime = 1000 / maxFps;

    // vars
    this.started = false;
    this.running = false;
    this.rafId = null;
    this.lastFrameTime = 0;
    this.lastFpsUpdate = 0;
    this.framesThisSecond = 0;
    this.delta = 0;
    this.fps = 60;

    // bind this
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.initLoop = this.initLoop.bind(this);
    this.loop = this.loop.bind(this);
  },

  update: function(delta) {
    this.onUpdate(delta);
  },

  render: function(interpol) {
    this.onRender(interpol, this.fps);
  },

  start: function() {
    if( !this.started ) {
      this.started = true;

      // first frame for get timestamp and initial render
      this.rafId = requestAnimationFrame( this.initLoop );
    }
  },

  stop: function() {
    this.running = false;
    this.started = false;
    cancelAnimationFrame( this.rafId );
  },

  initLoop: function(timestamp) {
    this.render(1); // initial render
    this.running = true;

    // reset some vars
    this.lastFrameTime = timestamp;
    this.lastFpsUpdate = timestamp;
    this.framesThisSecond = 0;

    // first standard frame
    this.rafId = requestAnimationFrame( this.loop );
  },

  loop: function(timestamp) {
    // fps throttle - begin
    if( timestamp < this.lastFrameTime + this.minFrameTime ) {
      this.rafId = requestAnimationFrame( this.loop );
      console.log( 'frame skip' );
      return;
    }
    // fps throttle - end

    this.delta += timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // fps meter - begin
    if( timestamp > this.lastFpsUpdate + 1000 ) { // update every second
      this.fps = 0.2 * this.framesThisSecond + 0.8 * this.fps; // compute the new fps

      this.lastFpsUpdate = timestamp;
      this.framesThisSecond = 0;
    }
    this.framesThisSecond++;
    // fps meter - end

    // panic handler loop - begin
    var updateSteps = 0;
    while( this.delta >= this.timestep ) {
      this.update( this.timestep );
      this.delta -= this.timestep;

      if( ++updateSteps >= 240 ) {
        this.panic();
        break;
      }
    }
    // panic handler loop - end

    this.render( this.delta / this.timestep );

    // next standard frame
    this.rafId = requestAnimationFrame( this.loop );
  },

  panic: function() {
    console.warn('panic');
    this.delta = 0;
  }

});