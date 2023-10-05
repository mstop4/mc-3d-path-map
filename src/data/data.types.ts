type PathTypes =
  | 'ugTunnel'
  | 'ogTunnel'
  | 'cBridge'
  | 'oBridge'
  | 'exPath'
  | 'nCave'
  | 'ladder'
  | 'bastion'
  | 'nFortress';
type RoomTypes = 'ugRoom' | 'ogRoom';
type DoorTypes = 'ex' | 'conn';
type DoorOrientation = 'x' | 'y' | 'z';
export type Coordinates = [number, number, number];

export type PathData = {
  type: PathTypes;
  visible: boolean;
  deprecated: boolean;
  points: Coordinates[];
};

type BaseRoomData = {
  label: string;
  displayLabel: boolean;
  type: RoomTypes;
};

type CuboidRoomData = BaseRoomData & {
  shape: 'cuboid';
  corners: [Coordinates, Coordinates];
};

type CylindricalRoomData = BaseRoomData & {
  shape: 'cylinder';
  bottomCenter: Coordinates;
  height: number;
  radius: number;
};

export type RoomData = CuboidRoomData | CylindricalRoomData;

export function isCuboidRoomData(
  roomData: RoomData,
): roomData is CuboidRoomData {
  return roomData.shape === 'cuboid';
}

export function isCylindricalRoomData(
  roomData: RoomData,
): roomData is CuboidRoomData {
  return roomData.shape === 'cylinder';
}

export type DoorData = {
  quantity: 1 | 2;
  orientation: DoorOrientation;
  type: DoorTypes;
  deprecated: boolean;
  location: Coordinates;
};

export type PortalData = {
  label: string;
  location: Coordinates;
};
