(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Actor = (function() {
    Actor.geometry = new THREE.BoxGeometry(1, 1, 0.01);

    Actor.textures = [];

    Actor.planet = null;

    Actor.loadTextures = function() {
      var geo, i, material, _i;
      for (i = _i = 1; _i <= 7; i = ++_i) {
        this.textures.push(THREE.ImageUtils.loadTexture("img/cats/actual-cat-0000" + i + ".png"));
      }
      geo = new THREE.SphereGeometry(0.6, 20, 20);
      material = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture("img/planet-texture.png"),
        color: 0xFFFFFF
      });
      return this.planet = new THREE.Mesh(geo, material);
    };

    Actor.texture = function() {
      return this.textures[parseInt(Math.random() * this.textures.length, 10)];
    };

    function Actor(system) {
      this.callback = __bind(this.callback, this);
      var material, x, y, z;
      material = new THREE.MeshPhongMaterial({
        map: Actor.texture(),
        color: 0xFFFFFF,
        transparent: true,
        overdraw: true
      });
      this.mesh = new THREE.Mesh(Actor.geometry, material);
      x = Math.random() * 6 - 3;
      y = Math.random() * 6 - 3;
      z = -system.distance;
      this.mesh.position.x = x;
      this.mesh.position.y = y;
      this.mesh.position.z = z;
      console.log("Setting at", x, y, z);
      this.mesh.userData = system;
      this.mesh.callback = this.callback;
    }

    Actor.prototype.userData = function() {
      return this.mesh.userData;
    };

    Actor.prototype.callback = function() {
      var $info, p;
      $info = $('#info');
      $info.find('.name').text(this.userData().name);
      $info.find('.description').text(this.userData().description);
      $info.find('.distance').text(this.userData().distance);
      $info.show();
      p = this.mesh.position;
      Actor.planet.position.set(p.x, p.y, p.z);
      window.s.remove(Actor.planet);
      return window.s.add(Actor.planet);
    };

    Actor.loadTextures();

    return Actor;

  })();

}).call(this);
