# 🚁 OCIH Mission Hub

## Advanced Drone Mission Planning & Flight Control System

**Status**: ✅ **DEPLOYED** - Ready for Law Enforcement Operations

### 🎯 Mission Critical Features

- **Real-time MAVLink Integration**: Industry-standard drone protocol support
- **Interactive Mission Planning**: Click-and-drop waypoints with 20-mile Columbia SC radius
- **MGRS Coordinate System**: Military-grade positioning (NATO standard)
- **NASA JPL Safety Standards**: Space-grade reliability and coding practices
- **Law Enforcement Optimized**: Tactical operations and emergency response ready

### 🛠 Technical Stack

- **Frontend**: Vue 3 + TypeScript + Tailwind CSS
- **Mapping**: Leaflet with OpenStreetMap tiles
- **Desktop**: Tauri (Rust + WebView)
- **Protocols**: MAVLink 2 for ArduPilot/PX4
- **Standards**: NASA JPL Power of 10 Rules

### 🚀 Quick Start

```bash
# Development
npm install
npm run dev

# Production Build
npm run build

# Desktop App
npm run build:tauri
```

### 📍 Columbia SC Operations

- **Operational Radius**: 20-mile boundary enforcement
- **Center Point**: 408 Lockleven Dr, Columbia SC
- **Altitude Limit**: 120m (400ft) FAA compliance
- **Safety Features**: Real-time geofencing and validation

### 🛡 OLYMPUS Platform Support

- **AUTOLYCUS**: Multi-rotor tactical platform
- **HERMES**: High-speed reconnaissance drone
- **PEGASUS**: Long-endurance surveillance
- **ICARUS**: Vertical takeoff fixed-wing

### 🔧 Critical Fix Applied

**Plan A Completed**: Fixed mission planner map display issue
- Added missing `export { MAVCmd }` to `src/utils/mavlink-parameters.ts`
- Resolved import error in `LeafletMap.vue` 
- Mission planner now loads map correctly instead of blank background

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**