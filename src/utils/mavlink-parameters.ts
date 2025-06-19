// NASA JPL: Comprehensive MAVLink 2 waypoint parameters for ArduPilot/PX4
// Based on MAVLink specification and best practices research

import { MAVCmd } from '../services/MAVLinkService'

// NASA JPL: Re-export MAVCmd for components using this utility module
export { MAVCmd }

export interface WaypointParameter {
  name: string
  description: string
  unit?: string
  min?: number
  max?: number
  default: number
  precision?: number
  options?: { value: number; label: string }[]
}

export interface WaypointCommandDefinition {
  command: MAVCmd
  name: string
  description: string
  category: 'Navigation' | 'Action' | 'Condition' | 'Camera' | 'Gimbal'
  params: [
    WaypointParameter, // param1
    WaypointParameter, // param2
    WaypointParameter, // param3
    WaypointParameter, // param4
    WaypointParameter, // param5 (lat/x)
    WaypointParameter, // param6 (lon/y)
    WaypointParameter  // param7 (alt/z)
  ]
  supportedPlatforms: ('ArduPilot' | 'PX4')[]
  frame: number // Default MAV_FRAME
}

// NASA JPL: MAV_FRAME constants
export enum MAVFrame {
  GLOBAL = 0,
  LOCAL_NED = 1,
  MISSION = 2,
  GLOBAL_RELATIVE_ALT = 3,
  LOCAL_ENU = 4,
  GLOBAL_INT = 5,
  GLOBAL_RELATIVE_ALT_INT = 6,
  LOCAL_OFFSET_NED = 7,
  BODY_NED = 8,
  BODY_OFFSET_NED = 9,
  GLOBAL_TERRAIN_ALT = 10,
  GLOBAL_TERRAIN_ALT_INT = 11
}

// NASA JPL: Comprehensive command definitions based on MAVLink specification

export const WAYPOINT_COMMANDS: Record<MAVCmd, WaypointCommandDefinition> = {
  [MAVCmd.NAV_WAYPOINT]: {
    command: MAVCmd.NAV_WAYPOINT,
    name: 'Waypoint',
    description: 'Navigate to a waypoint',
    category: 'Navigation',
    supportedPlatforms: ['ArduPilot', 'PX4'],
    frame: MAVFrame.GLOBAL_RELATIVE_ALT_INT,
    params: [
      {
        name: 'Hold Time',
        description: 'Hold time at waypoint (0 = no hold)',
        unit: 'seconds',
        min: 0,
        max: 3600,
        default: 0,
        precision: 1
      },
      {
        name: 'Accept Radius',
        description: 'Acceptance radius for waypoint (0 = use default)',
        unit: 'meters',
        min: 0,
        max: 1000,
        default: 3,
        precision: 1
      },
      {
        name: 'Pass Through',
        description: 'Pass through the waypoint (0 = fly through, 1 = stop)',
        unit: '',
        min: 0,
        max: 1,
        default: 0,
        options: [
          { value: 0, label: 'Fly Through' },
          { value: 1, label: 'Stop at Waypoint' }
        ]
      },
      {
        name: 'Desired Yaw',
        description: 'Desired yaw angle at this waypoint (NaN = ignore)',
        unit: 'degrees',
        min: -180,
        max: 180,
        default: NaN,
        precision: 1
      },
      {
        name: 'Latitude',
        description: 'Target latitude',
        unit: 'degrees',
        min: -90,
        max: 90,
        default: 0,
        precision: 7
      },
      {
        name: 'Longitude',
        description: 'Target longitude',
        unit: 'degrees',
        min: -180,
        max: 180,
        default: 0,
        precision: 7
      },
      {
        name: 'Altitude',
        description: 'Target altitude (relative to home)',
        unit: 'meters',
        min: -1000,
        max: 10000,
        default: 50,
        precision: 1
      }
    ]
  },

  [MAVCmd.NAV_TAKEOFF]: {
    command: MAVCmd.NAV_TAKEOFF,
    name: 'Takeoff',
    description: 'Takeoff to specified altitude',
    category: 'Navigation',
    supportedPlatforms: ['ArduPilot', 'PX4'],
    frame: MAVFrame.GLOBAL_RELATIVE_ALT_INT,
    params: [
      {
        name: 'Minimum Pitch',
        description: 'Minimum pitch angle during takeoff (0 = use default)',
        unit: 'degrees',
        min: -45,
        max: 45,
        default: 0,
        precision: 1
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Desired Yaw',
        description: 'Desired yaw angle after takeoff (NaN = ignore)',
        unit: 'degrees',
        min: -180,
        max: 180,
        default: NaN,
        precision: 1
      },
      {
        name: 'Latitude',
        description: 'Takeoff latitude (0 = current position)',
        unit: 'degrees',
        min: -90,
        max: 90,
        default: 0,
        precision: 7
      },
      {
        name: 'Longitude',
        description: 'Takeoff longitude (0 = current position)',
        unit: 'degrees',
        min: -180,
        max: 180,
        default: 0,
        precision: 7
      },
      {
        name: 'Altitude',
        description: 'Takeoff altitude (relative to home)',
        unit: 'meters',
        min: 1,
        max: 1000,
        default: 10,
        precision: 1
      }
    ]
  },

  [MAVCmd.NAV_LAND]: {
    command: MAVCmd.NAV_LAND,
    name: 'Land',
    description: 'Land at specified location',
    category: 'Navigation',
    supportedPlatforms: ['ArduPilot', 'PX4'],
    frame: MAVFrame.GLOBAL_RELATIVE_ALT_INT,
    params: [
      {
        name: 'Abort Altitude',
        description: 'Minimum altitude for abort (0 = use default)',
        unit: 'meters',
        min: 0,
        max: 100,
        default: 0,
        precision: 1
      },
      {
        name: 'Landing Mode',
        description: 'Precision landing mode',
        unit: '',
        min: 0,
        max: 2,
        default: 0,
        options: [
          { value: 0, label: 'Normal Landing' },
          { value: 1, label: 'Precision Landing' },
          { value: 2, label: 'Precision Landing Strict' }
        ]
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Desired Yaw',
        description: 'Desired yaw angle during landing (NaN = ignore)',
        unit: 'degrees',
        min: -180,
        max: 180,
        default: NaN,
        precision: 1
      },
      {
        name: 'Latitude',
        description: 'Landing latitude (0 = current position)',
        unit: 'degrees',
        min: -90,
        max: 90,
        default: 0,
        precision: 7
      },
      {
        name: 'Longitude',
        description: 'Landing longitude (0 = current position)',
        unit: 'degrees',
        min: -180,
        max: 180,
        default: 0,
        precision: 7
      },
      {
        name: 'Altitude',
        description: 'Landing altitude (relative to home)',
        unit: 'meters',
        min: -1000,
        max: 1000,
        default: 0,
        precision: 1
      }
    ]
  },

  [MAVCmd.NAV_RETURN_TO_LAUNCH]: {
    command: MAVCmd.NAV_RETURN_TO_LAUNCH,
    name: 'Return to Launch',
    description: 'Return to launch location',
    category: 'Navigation',
    supportedPlatforms: ['ArduPilot', 'PX4'],
    frame: MAVFrame.MISSION,
    params: [
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      }
    ]
  },

  [MAVCmd.NAV_LOITER_TIME]: {
    command: MAVCmd.NAV_LOITER_TIME,
    name: 'Loiter Time',
    description: 'Loiter at position for specified time',
    category: 'Navigation',
    supportedPlatforms: ['ArduPilot', 'PX4'],
    frame: MAVFrame.GLOBAL_RELATIVE_ALT_INT,
    params: [
      {
        name: 'Loiter Time',
        description: 'Time to loiter at position',
        unit: 'seconds',
        min: 0,
        max: 3600,
        default: 10,
        precision: 1
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Loiter Radius',
        description: 'Radius for loiter (0 = default, + = clockwise, - = counter-clockwise)',
        unit: 'meters',
        min: -1000,
        max: 1000,
        default: 0,
        precision: 1
      },
      {
        name: 'Exit Heading',
        description: 'Heading after loiter (NaN = ignore)',
        unit: 'degrees',
        min: -180,
        max: 180,
        default: NaN,
        precision: 1
      },
      {
        name: 'Latitude',
        description: 'Target latitude',
        unit: 'degrees',
        min: -90,
        max: 90,
        default: 0,
        precision: 7
      },
      {
        name: 'Longitude',
        description: 'Target longitude',
        unit: 'degrees',
        min: -180,
        max: 180,
        default: 0,
        precision: 7
      },
      {
        name: 'Altitude',
        description: 'Target altitude (relative to home)',
        unit: 'meters',
        min: -1000,
        max: 10000,
        default: 50,
        precision: 1
      }
    ]
  },

  [MAVCmd.NAV_LOITER_UNLIM]: {
    command: MAVCmd.NAV_LOITER_UNLIM,
    name: 'Loiter Unlimited',
    description: 'Loiter at position indefinitely',
    category: 'Navigation',
    supportedPlatforms: ['ArduPilot', 'PX4'],
    frame: MAVFrame.GLOBAL_RELATIVE_ALT_INT,
    params: [
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Loiter Radius',
        description: 'Radius for loiter (0 = default, + = clockwise, - = counter-clockwise)',
        unit: 'meters',
        min: -1000,
        max: 1000,
        default: 0,
        precision: 1
      },
      {
        name: 'Exit Heading',
        description: 'Heading to maintain (NaN = ignore)',
        unit: 'degrees',
        min: -180,
        max: 180,
        default: NaN,
        precision: 1
      },
      {
        name: 'Latitude',
        description: 'Target latitude',
        unit: 'degrees',
        min: -90,
        max: 90,
        default: 0,
        precision: 7
      },
      {
        name: 'Longitude',
        description: 'Target longitude',
        unit: 'degrees',
        min: -180,
        max: 180,
        default: 0,
        precision: 7
      },
      {
        name: 'Altitude',
        description: 'Target altitude (relative to home)',
        unit: 'meters',
        min: -1000,
        max: 10000,
        default: 50,
        precision: 1
      }
    ]
  },

  [MAVCmd.DO_SET_ROI]: {
    command: MAVCmd.DO_SET_ROI,
    name: 'Set ROI',
    description: 'Point camera/vehicle at region of interest',
    category: 'Camera',
    supportedPlatforms: ['ArduPilot', 'PX4'],
    frame: MAVFrame.GLOBAL_RELATIVE_ALT_INT,
    params: [
      {
        name: 'ROI Mode',
        description: 'Region of interest mode',
        unit: '',
        min: 0,
        max: 4,
        default: 0,
        options: [
          { value: 0, label: 'None' },
          { value: 1, label: 'Waypoint Index' },
          { value: 2, label: 'Waypoint Location' },
          { value: 3, label: 'Fixed Location' },
          { value: 4, label: 'Target' }
        ]
      },
      {
        name: 'Waypoint Index',
        description: 'Waypoint index for ROI mode 1',
        unit: '',
        min: 0,
        max: 65535,
        default: 0
      },
      {
        name: 'ROI Index',
        description: 'ROI index for multiple ROIs',
        unit: '',
        min: 0,
        max: 255,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Latitude',
        description: 'Target latitude for fixed ROI',
        unit: 'degrees',
        min: -90,
        max: 90,
        default: 0,
        precision: 7
      },
      {
        name: 'Longitude',
        description: 'Target longitude for fixed ROI',
        unit: 'degrees',
        min: -180,
        max: 180,
        default: 0,
        precision: 7
      },
      {
        name: 'Altitude',
        description: 'Target altitude for fixed ROI',
        unit: 'meters',
        min: -1000,
        max: 10000,
        default: 0,
        precision: 1
      }
    ]
  },

  [MAVCmd.DO_DIGICAM_CONTROL]: {
    command: MAVCmd.DO_DIGICAM_CONTROL,
    name: 'Camera Trigger',
    description: 'Control digital camera',
    category: 'Camera',
    supportedPlatforms: ['ArduPilot', 'PX4'],
    frame: MAVFrame.MISSION,
    params: [
      {
        name: 'Session Control',
        description: 'Session control (0 = no action, 1 = start session, 2 = stop session)',
        unit: '',
        min: 0,
        max: 2,
        default: 1,
        options: [
          { value: 0, label: 'No Action' },
          { value: 1, label: 'Start Session' },
          { value: 2, label: 'Stop Session' }
        ]
      },
      {
        name: 'Zoom Position',
        description: 'Zoom position (0 = ignore)',
        unit: '',
        min: 0,
        max: 100,
        default: 0,
        precision: 1
      },
      {
        name: 'Zoom Step',
        description: 'Zoom step size (negative = wide, positive = tele)',
        unit: '',
        min: -50,
        max: 50,
        default: 0
      },
      {
        name: 'Focus Lock',
        description: 'Focus lock (0 = ignore, 1 = unlock, 2 = lock)',
        unit: '',
        min: 0,
        max: 2,
        default: 0,
        options: [
          { value: 0, label: 'Ignore' },
          { value: 1, label: 'Unlock Focus' },
          { value: 2, label: 'Lock Focus' }
        ]
      },
      {
        name: 'Shooting Command',
        description: 'Shooting command (0 = ignore, 1 = shoot)',
        unit: '',
        min: 0,
        max: 1,
        default: 1,
        options: [
          { value: 0, label: 'Ignore' },
          { value: 1, label: 'Take Photo' }
        ]
      },
      {
        name: 'Command Identity',
        description: 'Command identity for feedback',
        unit: '',
        min: 0,
        max: 255,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      }
    ]
  },

  [MAVCmd.DO_CHANGE_SPEED]: {
    command: MAVCmd.DO_CHANGE_SPEED,
    name: 'Change Speed',
    description: 'Change vehicle speed',
    category: 'Action',
    supportedPlatforms: ['ArduPilot', 'PX4'],
    frame: MAVFrame.MISSION,
    params: [
      {
        name: 'Speed Type',
        description: 'Speed type to change',
        unit: '',
        min: 0,
        max: 3,
        default: 0,
        options: [
          { value: 0, label: 'Airspeed' },
          { value: 1, label: 'Ground Speed' },
          { value: 2, label: 'Climb Speed' },
          { value: 3, label: 'Descent Speed' }
        ]
      },
      {
        name: 'Target Speed',
        description: 'Target speed value',
        unit: 'm/s',
        min: 0,
        max: 50,
        default: 10,
        precision: 1
      },
      {
        name: 'Throttle',
        description: 'Throttle percentage (-1 = no change)',
        unit: '%',
        min: -1,
        max: 100,
        default: -1,
        precision: 1
      },
      {
        name: 'Relative',
        description: 'Relative speed change (0 = absolute, 1 = relative)',
        unit: '',
        min: 0,
        max: 1,
        default: 0,
        options: [
          { value: 0, label: 'Absolute' },
          { value: 1, label: 'Relative' }
        ]
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      }
    ]
  },

  [MAVCmd.CONDITION_YAW]: {
    command: MAVCmd.CONDITION_YAW,
    name: 'Condition Yaw',
    description: 'Control vehicle yaw angle',
    category: 'Condition',
    supportedPlatforms: ['ArduPilot', 'PX4'],
    frame: MAVFrame.MISSION,
    params: [
      {
        name: 'Target Angle',
        description: 'Target yaw angle (0 = north)',
        unit: 'degrees',
        min: -180,
        max: 180,
        default: 0,
        precision: 1
      },
      {
        name: 'Angular Speed',
        description: 'Angular speed (0 = use default)',
        unit: 'deg/s',
        min: 0,
        max: 180,
        default: 0,
        precision: 1
      },
      {
        name: 'Direction',
        description: 'Direction (-1 = counter-clockwise, 1 = clockwise)',
        unit: '',
        min: -1,
        max: 1,
        default: 1,
        options: [
          { value: -1, label: 'Counter-Clockwise' },
          { value: 1, label: 'Clockwise' }
        ]
      },
      {
        name: 'Relative',
        description: 'Relative angle (0 = absolute, 1 = relative)',
        unit: '',
        min: 0,
        max: 1,
        default: 0,
        options: [
          { value: 0, label: 'Absolute Angle' },
          { value: 1, label: 'Relative Angle' }
        ]
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      },
      {
        name: 'Empty',
        description: 'Not used',
        unit: '',
        min: 0,
        max: 0,
        default: 0
      }
    ]
  }
}

// NASA JPL: Helper functions for parameter validation and formatting

export function getCommandDefinition(command: MAVCmd): WaypointCommandDefinition | undefined {
  return WAYPOINT_COMMANDS[command]
}

export function validateParameter(param: WaypointParameter, value: number): boolean {
  if (param.min !== undefined && value < param.min) return false
  if (param.max !== undefined && value > param.max) return false
  return true
}

export function formatParameterValue(param: WaypointParameter, value: number): string {
  if (isNaN(value)) return 'N/A'
  
  const formattedValue = param.precision !== undefined 
    ? value.toFixed(param.precision)
    : value.toString()
  
  return param.unit ? `${formattedValue} ${param.unit}` : formattedValue
}

export function getParameterDisplayName(command: MAVCmd, paramIndex: number): string {
  const definition = getCommandDefinition(command)
  if (!definition || paramIndex < 0 || paramIndex >= 7) return `Param ${paramIndex + 1}`
  
  return definition.params[paramIndex].name
}

export function getParameterDescription(command: MAVCmd, paramIndex: number): string {
  const definition = getCommandDefinition(command)
  if (!definition || paramIndex < 0 || paramIndex >= 7) return ''
  
  return definition.params[paramIndex].description
}

// NASA JPL: Command categorization for UI organization

export function getCommandsByCategory(): Record<string, MAVCmd[]> {
  const categories: Record<string, MAVCmd[]> = {}
  
  Object.values(WAYPOINT_COMMANDS).forEach(definition => {
    if (!categories[definition.category]) {
      categories[definition.category] = []
    }
    categories[definition.category].push(definition.command)
  })
  
  return categories
}

// NASA JPL: Columbia SC specific safety parameters

export const COLUMBIA_SC_SAFETY_LIMITS = {
  maxAltitude: 120, // meters (400 feet FAA limit)
  maxSpeed: 25, // m/s
  minBatteryVoltage: 22.0, // volts for 6S battery
  maxWindSpeed: 10, // m/s
  maxTemperature: 50, // Celsius
  minTemperature: -10, // Celsius
  maxFlightTime: 25 * 60, // 25 minutes in seconds
  emergencyRTLAltitude: 60, // meters
  geofenceRadius: 32186.88 // 20 miles in meters
}