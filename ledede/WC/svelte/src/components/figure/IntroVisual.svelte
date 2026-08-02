<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';

  let { activeStep } = $props();

  let mapContainer;
  let map = $state(null);
  let isSpinning = true;
  let spinFrame;

  const MAPBOX_TOKEN = env.PUBLIC_MAPBOX_TOKEN;

  // 🌟 activeStep === 1（スタジアム到着時）に実際の写真を表示するフラグ
  let showRealPhoto = $derived(activeStep >= 1);

  onMount(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.js';
    script.onload = () => {
      initMap();
    };
    document.head.appendChild(script);

    return () => {
      if (map) map.remove();
      cancelAnimationFrame(spinFrame);
    };
  });

  function initMap() {
    if (!MAPBOX_TOKEN) {
      console.error("🚨 エラー: Mapboxトークンが読み込めません！");
      return;
    }

    window.mapboxgl.accessToken = MAPBOX_TOKEN;
    const newMap = new window.mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/satellite-v9', 
      projection: 'globe', 
      zoom: 1.5,
      center: [-90, 40],
      interactive: false 
    });

    newMap.on('style.load', () => {
      newMap.setFog({
        'color': 'rgb(10, 15, 25)',
        'high-color': 'rgb(20, 30, 45)',
        'horizon-blend': 0.05,
        'space-color': 'rgb(5, 5, 10)',
        'star-intensity': 0.2
      });
      map = newMap;
      spinGlobe();
    });
  }

  function spinGlobe() {
    if (!isSpinning || !map) return;
    const center = map.getCenter();
    center.lng -= 0.2; 
    map.setCenter(center);
    spinFrame = requestAnimationFrame(spinGlobe);
  }

  $effect(() => {
    if (!map) return;

    if (activeStep === 0) {
      isSpinning = true;
      spinGlobe();
      map.flyTo({ center: [-90, 40], zoom: 1.5, pitch: 0, bearing: 0, duration: 2000 });
    } else if (activeStep === 1) {
      isSpinning = false;
      cancelAnimationFrame(spinFrame);
      map.flyTo({
        center: [-74.0744, 40.8136],
        zoom: 16.5,
        pitch: 65,
        bearing: 30,
        duration: 4500,
        essential: true
      });
    }
  });
</script>

<div class="intro-layer" class:fade-out={activeStep >= 2}>
  <div class="map-container" bind:this={mapContainer}></div>

  <div class="real-photo-layer" class:visible={showRealPhoto}>
    <img src="{base}/images/fifafinal.jpg" alt="World Cup Final Stadium View" />
    <div class="photo-overlay"></div>
    <div class="photo-credit">Photo: FIFA</div>
  </div>
</div>

<style>
  .intro-layer {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100vh;
    z-index: 20;
    transition: opacity 1.5s ease, visibility 1.5s;
    background-color: #000;
    overflow: hidden;
  }
  
  .intro-layer.fade-out { 
    opacity: 0; 
    visibility: hidden; 
    pointer-events: none; 
  }

  .map-container { 
    width: 100%; 
    height: 100%; 
    filter: grayscale(40%) contrast(1.2); 
  }

  /* 🌟 実写写真レイヤー（ズームイン完了に合わせてフェードイン） */
  .real-photo-layer {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    opacity: 0;
    visibility: hidden;
    /* ズームインが完了するタイミングに合わせて滑らかにフェードイン */
    transition: opacity 1.5s ease-in-out 3.0s, visibility 1.5s;
    z-index: 4;
  }
  
  .real-photo-layer.visible {
    opacity: 1;
    visibility: visible;
  }

  .real-photo-layer img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .photo-overlay {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(
      to bottom, 
      rgba(0, 0, 0, 0.15) 0%, 
      rgba(0, 0, 0, 0.4) 70%, 
      rgba(0, 0, 0, 0.8) 100%
    );
    pointer-events: none;
  }

  /* 📷 右下の出典（Photo: FIFA） */
  .photo-credit {
    position: absolute;
    bottom: 15px;
    right: 20px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    font-family: sans-serif;
    letter-spacing: 0.5px;
    z-index: 6;
    pointer-events: none;
  }
</style>