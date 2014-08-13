/*global THREE AURA*/
var UTIL = {
  
  onWindowResize: function() {
      
      AURA.camera.aspect = window.innerWidth / window.innerHeight;
      AURA.camera.updateProjectionMatrix();
      
      AURA.renderer.setSize( window.innerWidth, window.innerHeight );
      
  }
    
};