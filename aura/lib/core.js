/*global THREE UTIL*/
var AURA = {
  
  STATE : { EMPTY : -1, LOBBY : 0, GAME : 1 },
  state : -1,
  
  domElement: document,
  selector: {},
  utils: {},
  
  menu: {
      
      
    
  },

  initTHREE: function() {
    
    AURA.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		AURA.camera.position.set( 0, 100, 100 );
		AURA.scene = new THREE.Scene();
	
		AURA.controls = new THREE.OrbitControls( AURA.camera );

		AURA.selector.distance = 100;
		AURA.selector.selecting = false;
		AURA.utils.shipgeometry = new THREE.SphereGeometry(0.25, 6, 2);

		AURA.selector.firstclick = new THREE.Vector3(0,0,0);
		AURA.selector.radius_sqrd = 0;

		AURA.renderer = new THREE.WebGLRenderer( { antialias: true } );	
		AURA.renderer.setClearColor( 0x000000, 1 );
		AURA.renderer.setSize( window.innerWidth, window.innerHeight ); 
		AURA.container = AURA.domElement.getElementById( 'container' );
		AURA.container.appendChild( AURA.renderer.domElement );

   	window.addEventListener( 'resize', UTIL.onWindowResize, false );
    
  },
  
  initLobby: function() {
      
      //Initialize the lobby
      AURA.state = AURA.STATE.LOBBY;
      
      
      
      console.log("Initialized the Lobby.");
      
  },
  
  initGame: function() {
    
      //Initialize the game.
      
  }
  
    
};

AURA.initTHREE();