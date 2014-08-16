/*global THREE UTIL io*/
var AURA = {
  
  STATE : { EMPTY : -1, LOBBY : 0, GAME : 1 },
  state : -1,
  
  domElement: document,
  selector: {},
  utils: {},

  initTHREE: function() {
    
    AURA.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		AURA.camera.position.set( 0, 100, 100 );
		AURA.scene = new THREE.Scene();
	
		AURA.controls = new THREE.OrbitControls( AURA.camera );
		AURA.controls.enabled = false;

		AURA.selector.distance = 100;
		AURA.selector.selecting = false;
		AURA.utils.shipgeometry = new THREE.SphereGeometry(0.25, 6, 2);

		AURA.selector.firstclick = new THREE.Vector3(0,0,0);
		AURA.selector.radius_sqrd = 0;

		AURA.renderer = new THREE.WebGLRenderer( { antialias: true } );	
		AURA.renderer.setClearColor( 0x000000, 0 );
		AURA.renderer.setSize( window.innerWidth, window.innerHeight ); 
		document.body.appendChild( AURA.renderer.domElement );
		
   	window.addEventListener( 'resize', UTIL.onWindowResize, false );
    
  },
  
  initLobby: function() {
      
      //Initialize the lobby
      AURA.state = AURA.STATE.LOBBY;
      
      //Loop of the map objects and add them as divs.
      for(var i = 0; i < AURA.maps.length; i++) {
        var mDiv = document.createElement('div');
        mDiv.style.backgroundColor = "rgba(70,70,70,.5)";
        mDiv.style.borderRadius = '15px';
        mDiv.id = "mapcont";
        mDiv.style.cursor = 'pointer';
        mDiv.addEventListener('mousedown', UTIL.onMapClick(i), false);
        
        var mDivInt = document.createElement('div');
        mDivInt.id = "map";
				
				var mTitle = document.createElement('div');
				mTitle.style.fontSize = "30pt";
				mTitle.innerHTML = AURA.maps[i].name;
				
        var mDesc = document.createElement('div');
        mDesc.innerHTML = AURA.maps[i].desc;
        
        var mVote = document.createElement('div');
        mVote.innerHTML = "VOTE";
        mVote.style.backgroundColor = "rgba(65,105,225,.7)";
        mVote.style.borderRadius = '5px';
        mVote.style.cursor = 'pointer';
        //Set listeners for hover/click
        

        mDivInt.appendChild(mTitle);
        mDivInt.appendChild(mDesc);
        mDivInt.appendChild(document.createElement('br'));
        mDivInt.appendChild(mVote);
        
        mDiv.appendChild(mDivInt);
        
        var blocker = document.getElementById("panels"); 
  			blocker.appendChild(mDiv);
        
      }
      
      AURA.theta = 0;
      AURA.tick();
      
      console.log("Initialized the Lobby.");
      
  },
  
  initGame: function() {
    
      //Initialize the game.
      
  },
  
  setScene: function(scene) {
  	
  	AURA.scene = scene;
  	
  },
  
  tick: function() {
  	
  	AURA.renderer.render(AURA.scene, AURA.camera);
  	
  	requestAnimationFrame( AURA.tick );
  	
  	if(AURA.state === AURA.STATE.LOBBY) {
 		
  		AURA.theta += 0.1;
  		
  		AURA.camera.position.x = 100 * Math.sin( THREE.Math.degToRad( AURA.theta ) );
			AURA.camera.position.y = 100 * Math.sin( THREE.Math.degToRad( AURA.theta ) );
			AURA.camera.position.z = 100 * Math.cos( THREE.Math.degToRad( AURA.theta ) );
			
			AURA.camera.lookAt( AURA.scene.position );
  		
  	} else {
  		
  		AURA.controls.update();
  		
  	}
  	
  }
  
    
};

AURA.initTHREE();
