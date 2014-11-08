(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Actor = (function() {
    Actor.geometry = new THREE.BoxGeometry(1, 1, 0.01);

    Actor.textures = [];

    Actor.planet = null;

    Actor.loadTextures = function() {
      var geo, i, material, _i, _j;
      for (i = _i = 1; _i <= 9; i = ++_i) {
        this.textures.push(THREE.ImageUtils.loadTexture("img/cats/actual-cat-0000" + i + ".png"));
      }
      for (i = _j = 10; _j <= 26; i = ++_j) {
        this.textures.push(THREE.ImageUtils.loadTexture("img/cats/actual-cat-000" + i + ".png"));
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
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Scene = (function() {
    Scene.prototype.actors = [];

    function Scene() {
      this.render = __bind(this.render, this);
      this.addBackground = __bind(this.addBackground, this);
      var $parent, axes, controls, height, pointLight, width;
      $parent = $('#scene');
      width = parseInt($parent.css('width'), 10);
      height = parseInt($parent.css('height'), 10);
      width = window.innerWidth;
      height = window.innerHeight;
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(750, width / height, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(width, height);
      $parent.prepend(this.renderer.domElement);
      this.addActors();
      this.addBackground();
      pointLight = new THREE.PointLight(0xFFFFFF);
      pointLight.position.set(0, 3, 0);
      this.scene.add(pointLight);
      axes = new THREE.AxisHelper(-1);
      this.scene.add(axes);
      this.camera.position.set(0, 0, 1);
      controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.scene.add(controls);
      this.render();
    }

    Scene.prototype.addBackground = function() {
      var backgroundMesh, texture;
      texture = THREE.ImageUtils.loadTexture('img/bg.jpg');
      backgroundMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2, 0), new THREE.MeshBasicMaterial({
        map: texture
      }));
      backgroundMesh.material.depthTest = false;
      backgroundMesh.material.depthWrite = false;
      this.backgroundScene = new THREE.Scene();
      this.backgroundCamera = new THREE.Camera();
      this.backgroundScene.add(this.backgroundCamera);
      return this.backgroundScene.add(backgroundMesh);
    };

    Scene.prototype.addActors = function(geometry, material) {
      var actor, system, _i, _len, _ref, _results;
      _ref = json_data.slice(0, 40);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        system = _ref[_i];
        actor = new Actor(system.system);
        this.actors.push(actor.mesh);
        _results.push(this.scene.add(actor.mesh));
      }
      return _results;
    };

    Scene.prototype.getCamera = function() {
      return this.camera;
    };

    Scene.prototype.getScene = function() {
      return this.scene;
    };

    Scene.prototype.getActors = function() {
      return this.actors;
    };

    Scene.prototype.render = function() {
      requestAnimationFrame(this.render);
      this.renderer.autoClear = false;
      this.renderer.clear();
      this.renderer.render(this.backgroundScene, this.backgroundCamera);
      return this.renderer.render(this.scene, this.camera);
    };

    return Scene;

  })();

}).call(this);
(function() {
  var PI2, detectClick, load, particleMaterial;

  $.getJSON("/js/cleaned.json").success(function(data) {
    window.json_data = data;
    return load();
  });

  PI2 = Math.PI * 2;

  particleMaterial = new THREE.SpriteMaterial({
    color: 0x00FF00,
    program: function(context) {
      context.beginPath();
      context.arc(0, 0, 1, 0, PI2);
      return context.fill();
    }
  });

  detectClick = function(event) {
    var intersect, intersects, raycaster, vector;
    event.preventDefault();
    vector = new THREE.Vector3();
    vector.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vector.unproject(window.camera);
    raycaster = new THREE.Raycaster();
    raycaster.ray.set(window.camera.position, vector.sub(window.camera.position).normalize());
    intersects = raycaster.intersectObjects(window.objects);
    if (intersects.length > 0) {
      intersect = intersects[0];
      return intersect.object.callback();
    }
  };

  load = function() {
    var scene;
    scene = new Scene();
    window.camera = scene.getCamera();
    window.s = scene.getScene();
    window.objects = scene.getActors();
    $('canvas').on('click', detectClick);
    camera.position.set(1, 1, 8);
    return camera.lookAt(s.position);
  };

  $('.close').on('click', function() {
    $('#info').hide('slow');
    return window.s.remove(Actor.planet);
  });

}).call(this);
