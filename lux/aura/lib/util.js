/*global THREE AURA io */
var UTIL = {
  
  onWindowResize: function() {
      
      AURA.camera.aspect = window.innerWidth / window.innerHeight;
      AURA.camera.updateProjectionMatrix();
      
      AURA.renderer.setSize( window.innerWidth, window.innerHeight );
      
  },
  
  onMapClick: function(index) {
  
      "use strict";
      return function () {
        AURA.setScene(UTIL.sceneFromMap(AURA.maps[index]));
      };
  
  },
  
  sceneFromMap: function(enclosure) {
    
    var map = enclosure.map;
    var scene = new THREE.Scene();
    
    for(var i = 0; i < map.length; i++) {
      
        var geometry = new THREE.SphereGeometry(map[i].level*5, map[i].level*8, map[i].level*8);
        var material = new THREE.MeshBasicMaterial( { color: "#" + enclosure.colors[map[i].color], wireframe: true } );
        var mesh = new THREE.Mesh( geometry, material );
        
       	mesh.position.x = parseInt(map[i].x, 10);
        mesh.position.y = parseInt(map[i].y, 10);
        mesh.position.z = parseInt(map[i].z, 10);
		    mesh.AURAId = map[i].AURAid;
		    
		    mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        
        scene.add( mesh );
      
    }
    
    return scene;
    
  }
    
};

var socket = io.connect();

socket.on("maps", function(data) {
    AURA.maps = data.maps;
    AURA.initLobby()
});


document.onselectstart = function()
{
    window.getSelection().removeAllRanges();
};
document.onselectstart = function() { return false; };
document.body.style.MozUserSelect = "none";
document.body.style.KhtmlUserSelect = "none";
document.body.unselectable = "on";