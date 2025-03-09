<template>
    <div 
      class="snitch-container" 
      :style="{ transform: `translate(${position.x}px, ${position.y}px)` }"
    >
      <div class="snitch">
        <div class="body"></div>
        <div class="wing left"></div>
        <div class="wing right"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted,ref } from 'vue';
  
  const position = ref({ x: 0, y: 0 });
  const speed = { x: 4, y: 3 }; // Increased initial speed
  const maxSpeed = 6; // Increased max speed
  
  // Centered starting position with 30% variance
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  position.value = {
    x: centerX + (Math.random() - 0.5) * window.innerWidth * 0.3,
    y: centerY + (Math.random() - 0.5) * window.innerHeight * 0.3
  };
  
  const animate = () => {
    // Update position
    position.value.x += speed.x;
    position.value.y += speed.y;
  
    // Bounce with central bias (keep within 60% of viewport)
    const marginX = window.innerWidth * 0.2;
    const marginY = window.innerHeight * 0.2;
  
    if (position.value.x <= marginX || 
        position.value.x >= window.innerWidth - marginX - 40) {
      speed.x *= -1;
      speed.x += (Math.random() - 0.5) * 4; // More aggressive speed changes
      speed.x = Math.max(-maxSpeed, Math.min(maxSpeed, speed.x));
    }
  
    if (position.value.y <= marginY || 
        position.value.y >= window.innerHeight - marginY - 40) {
      speed.y *= -1;
      speed.y += (Math.random() - 0.5) * 3;
      speed.y = Math.max(-maxSpeed, Math.min(maxSpeed, speed.y));
    }
  
    requestAnimationFrame(animate);
  };
  
  onMounted(() => {
    animate();
  });
  </script>
  
  <style scoped>
  .snitch-container {
    position: fixed;
    width: 40px;
    height: 40px;
    z-index: 10;
    pointer-events: none; /* Allow clicks to pass through */
  }
  
  .snitch {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .body {
    position: absolute;
    width: 100%;
    height: 100%;
    background: gold;
    border-radius: 50%;
    box-shadow: 0 0 15px gold, 0 0 30px gold;
    animation: glow 1.5s infinite alternate, zoom 1s infinite;
  }
  
  .wing {
    position: absolute;
    width: 20px;
    height: 10px;
    background: gold;
    border-radius: 50%;
    animation: flap 0.3s infinite;
  }
  
  .wing.left {
    left: -15px;
    transform-origin: right center;
  }
  
  .wing.right {
    right: -15px;
    transform-origin: left center;
  }
  
  @keyframes flap {
    0% { transform: rotate(0deg); }
    50% { transform: rotate(45deg); }
    100% { transform: rotate(0deg); }
  }
  
  @keyframes zoom {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

  
  @keyframes glow {
    0% { box-shadow: 0 0 10px gold; }
    100% { box-shadow: 0 0 30px gold, 0 0 60px gold; }
  }
  </style>








 