import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapView({
  participants = [],
  optimalPoint = { name: 'Dharmahusada', lat: -7.2685, lng: 112.76 },
  recommendations = [],
  radius = 800,
  focusedCafe = null,
  onSelectCafe,
  sidebarOpen = true,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Inisialisasi peta Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = optimalPoint.lat || -7.2685;
      const initialLng = optimalPoint.lng || 112.76;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: false,
      });

      // Basemap OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Posisi zoom control di pojok kanan atas
      L.control
        .zoom({
          position: 'topright',
        })
        .addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Responsif terhadap pembukaan/penutupan sidebar dan perubahan ukuran kontainer
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Update Markers, Garis Rute, dan Radius ketika data berubah
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds = [];
    const optLat = optimalPoint.lat || -7.2685;
    const optLng = optimalPoint.lng || 112.76;
    bounds.push([optLat, optLng]);

    // 1. Lingkaran Radius Pencarian Tempat Kumpul
    L.circle([optLat, optLng], {
      radius: radius || 800,
      color: '#10B981',
      fillColor: '#10B981',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '6, 6',
    }).addTo(layerGroup);

    // 2. Pin Titik Temu Optimal (Emerald Glow Pin)
    const optimalIcon = L.divIcon({
      className: 'custom-optimal-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(16, 185, 129, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 34px; height: 34px; border-radius: 9999px; background: #10B981; color: white; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const optimalMarker = L.marker([optLat, optLng], { icon: optimalIcon }).addTo(layerGroup);
    optimalMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
        <strong style="color: #047857; font-size: 13px;">Titik Temu Paling Adil</strong><br/>
        <span>${optimalPoint.name || 'Dharmahusada, Surabaya'}</span><br/>
        <span style="color: #64748B; font-size: 11px;">Rata-rata waktu tempuh antar peserta paling seimbang</span>
      </div>
    `);

    // 3. Pin Peserta & Animasi Garis Rute Jalan Raya
    participants.forEach((p, idx) => {
      const sampleCoords = [
        [-7.28197, 112.79532], // ITS Sukolilo
        [-7.27138, 112.75882], // Unair Gubeng
        [-7.29745, 112.67568], // Pakuwon Barat
        [-7.2625, 112.7428],   // TP Pusat
        [-7.3328, 112.7351],   // UINSA Selatan
      ];
      const pLat = typeof p.lat === 'number' ? p.lat : sampleCoords[idx % sampleCoords.length][0];
      const pLng = typeof p.lng === 'number' ? p.lng : sampleCoords[idx % sampleCoords.length][1];
      bounds.push([pLat, pLng]);

      const colors = ['#4F46E5', '#F59E0B', '#F43F5E', '#10B981', '#0EA5E9', '#8B5CF6'];
      const markerColor = colors[idx % colors.length];

      // Garis Rute Animasi Bergerak (Dash Flow)
      L.polyline([[pLat, pLng], [optLat, optLng]], {
        color: markerColor,
        weight: 3.5,
        dashArray: '8, 6',
        opacity: 0.85,
        className: 'animate-dash-flow',
      }).addTo(layerGroup);

      const pIcon = L.divIcon({
        className: 'custom-p-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="width: 28px; height: 28px; border-radius: 9999px; background: ${markerColor}; color: white; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <span style="background: white; border: 1px solid #E2E8F0; border-radius: 9999px; font-size: 10px; font-weight: 700; padding: 2px 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); margin-top: 2px; white-space: nowrap; color: #1E293B;">
              ${p.name || `Teman ${idx + 1}`}
            </span>
          </div>
        `,
        iconSize: [60, 48],
        iconAnchor: [30, 24],
      });

      const pMarker = L.marker([pLat, pLng], { icon: pIcon }).addTo(layerGroup);
      pMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px;">
          <strong>${p.name}</strong><br/>
          <span style="color: #64748B;">${p.address || 'Titik Berangkat'}</span>
        </div>
      `);
    });

    // 4. Pin Tempat / Kafe Rekomendasi
    recommendations.forEach((cafe, cIdx) => {
      const sampleOffsets = [
        [-0.002, -0.0015],
        [0.0018, 0.0022],
        [-0.003, 0.0028],
        [0.0025, -0.002],
        [0.001, -0.0032],
      ];
      const cLat = typeof cafe.lat === 'number' ? cafe.lat : (optLat + sampleOffsets[cIdx % sampleOffsets.length][0]);
      const cLng = typeof cafe.lng === 'number' ? cafe.lng : (optLng + sampleOffsets[cIdx % sampleOffsets.length][1]);

      const isFocused = focusedCafe?.name === cafe.name;

      const cafeIcon = L.divIcon({
        className: 'custom-cafe-marker',
        html: `
          <div style="width: ${isFocused ? '34px' : '28px'}; height: ${isFocused ? '34px' : '28px'}; border-radius: 9999px; background: ${isFocused ? '#4F46E5' : 'white'}; color: ${isFocused ? 'white' : '#4F46E5'}; border: 2px solid #4F46E5; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.15); transition: all 0.2s;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const cafeMarker = L.marker([cLat, cLng], { icon: cafeIcon }).addTo(layerGroup);
      cafeMarker.on('click', () => {
        if (onSelectCafe) onSelectCafe(cafe);
      });

      cafeMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <strong style="color: #1E293B; font-size: 13px;">${cafe.name}</strong><br/>
          <span style="color: #047857; font-weight: 700;">${cafe.score}</span> · <span>${cafe.dist}</span><br/>
          <span style="color: #64748B; font-size: 11px;">${cafe.note}</span>
        </div>
      `);
    });

    // 5. Fit bounds jika ada lebih dari 1 titik dan tidak sedang fokus ke kafe tertentu
    if (!focusedCafe && bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [participants, optimalPoint, recommendations, radius, focusedCafe]);

  // Efek terbang/pan ketika salah satu kartu kafe diklik
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusedCafe) return;

    const optLat = optimalPoint.lat || -7.2685;
    const optLng = optimalPoint.lng || 112.76;
    const targetLat = typeof focusedCafe.lat === 'number' ? focusedCafe.lat : optLat;
    const targetLng = typeof focusedCafe.lng === 'number' ? focusedCafe.lng : optLng;

    map.flyTo([targetLat, targetLng], 16, { duration: 1.2 });
  }, [focusedCafe]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl select-none">
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" style={{ zIndex: 1 }} />
    </div>
  );
}
