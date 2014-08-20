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
    	var mElement = document.getElementById("map"+index);
        AURA.setScene(UTIL.sceneFromMap(AURA.maps[index]));
        if (UTIL.selectedmap !== undefined) {
        	document.getElementById("map"+UTIL.selectedmap).style.backgroundColor = "rgba(70,70,70,.5)";
        }
        UTIL.selectedmap = index;
        mElement.style.backgroundColor = "rgba(30,30,30,.75)";
    };
  
  },
  
  onVoteClick : function(index) {
      
    "use strict";
    return function() {
    	
        if (UTIL.votedfor === undefined) {
       
        	UTIL.votedfor = index;
        	socket.emit('vote', index);
    				
        } else {
        	
        	socket.emit('unvote', UTIL.votedfor);
        	
        	document.getElementById("vote"+UTIL.votedfor).style.backgroundColor = "rgba(65,105,225,.7)";
        	
        	UTIL.votedfor = index;
        	socket.emit('vote', index);
        	
        }
        
        document.getElementById("vote"+UTIL.votedfor).style.backgroundColor = "rgba(105,225,65,.7)";
        
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
    AURA.initLobby();
});

socket.on("voteregistered", function(data) {

   document.getElementById("vote"+data.map).innerHTML = data.num + " VOTES";
    
});

socket.on("countdown", function(data) {
   
   document.getElementById("blocker-left").innerHTML = data.time;
    
});

socket.on("gamestart", function(data) {
   
   console.log(data);
    
});


document.onselectstart = function()
{
    window.getSelection().removeAllRanges();
};
document.onselectstart = function() { return false; };
document.body.style.MozUserSelect = "none";
document.body.style.KhtmlUserSelect = "none";
document.body.unselectable = "on";