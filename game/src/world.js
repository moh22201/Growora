import Phaser from 'phaser';

const TILE = 16;
const TILE_SCALE = 2;
const LANDMARKS = {
  landscape: {
    farmhouse: { x: 480, y: 132 },
    market: { x: 230, y: 555 },
    vehicle: { x: 370, y: 555 },
    coop: { x: 720, y: 295 },
    apiary: { x: 725, y: 520 },
    dock: { x: 505, y: 615 },
    roadX: 500,
    roadY: 478,
    fields: [
      [185, 265], [265, 265], [345, 265],
      [185, 335], [265, 335], [345, 335],
      [185, 405], [265, 405], [345, 405],
    ],
  },
  portrait: {
    farmhouse: { x: 180, y: 115 },
    market: { x: 82, y: 526 },
    vehicle: { x: 242, y: 535 },
    coop: { x: 270, y: 306 },
    apiary: { x: 276, y: 468 },
    dock: { x: 180, y: 630 },
    roadX: 180,
    roadY: 438,
    fields: [
      [18, 218], [68, 218], [118, 218],
      [18, 268], [68, 268], [118, 268],
      [18, 318], [68, 318], [118, 318],
    ],
  },
};

const COASTLINE = [
  [6, 21], [3, 23], [2, 26], [1, 28], [1, 29], [0, 29], [0, 29],
  [1, 28], [0, 28], [1, 26], [2, 27], [0, 24], [2, 24], [3, 25],
  [5, 22], [6, 22], [7, 20], [5, 15],
];

const PORTRAIT_COASTLINE = [
  [2, 8], [1, 9], [0, 10], [0, 10], [0, 10], [0, 9],
  [0, 10], [0, 10], [1, 10], [0, 10], [0, 10], [0, 9],
  [1, 10], [0, 10], [0, 10], [0, 9], [1, 9], [2, 8],
];
const CROP_FRAMES = [31, 68, 54, 66, 83, 42, 44, 80, 41];

export default class GroworaWorld extends Phaser.Scene {
  constructor({ getFields, getSelectedField, onPlot, onPlace }) {
    super({ key: 'island' });
    this.getFields = getFields;
    this.getSelectedField = getSelectedField;
    this.onPlot = onPlot;
    this.onPlace = onPlace;
    this.landmarks = LANDMARKS.landscape;
    this.mapScale = 1;
    this.mapOffsetX = 0;
    this.mapOffsetY = 0;
    this.portrait = false;
    this.fishJumpAt = 0;
    this.waterTime = 0;
    this.animals = [];
    this.bees = [];
  }

  preload() {
    this.load.spritesheet('kenney-farm', `${import.meta.env.BASE_URL}assets/kenney-tiny-farm/tilemap.png`, {
      frameWidth: TILE,
      frameHeight: TILE,
      spacing: 1,
    });
    this.load.spritesheet('kenney-town', `${import.meta.env.BASE_URL}assets/kenney-tiny-town/tilemap.png`, {
      frameWidth: TILE,
      frameHeight: TILE,
      spacing: 1,
    });
  }

  create() {
    this.cameras.main.setBackgroundColor('#38aeb5');
    this.ocean = this.add.graphics().setDepth(0);
    this.world = this.add.container(0, 0).setDepth(1);
    this.waterEffects = this.add.graphics().setDepth(2);
    this.creatures = this.add.container(0, 0).setDepth(5);
    this.input.on('pointerup', (pointer) => this.handleTap(pointer));
    this.scale.on('resize', () => this.layoutWorld());
    this.layoutWorld();
  }

  layoutWorld() {
    const portrait = this.scale.width / this.scale.height < 0.72;
    if (portrait !== this.portrait || this.world.length === 0) {
      this.portrait = portrait;
      this.landmarks = portrait ? LANDMARKS.portrait : LANDMARKS.landscape;
      this.buildWorld();
    }
    this.paintOcean();

    const width = this.portrait ? 360 : 960;
    const height = this.portrait ? 720 : 700;
    const topInset = this.portrait ? 68 : 65;
    const bottomInset = this.portrait ? 70 : 88;
    const availableHeight = Math.max(1, this.scale.height - topInset - bottomInset);
    this.mapScale = Math.min(this.scale.width / width, availableHeight / height);
    this.mapOffsetX = (this.scale.width - width * this.mapScale) / 2;
    this.mapOffsetY = topInset + (availableHeight - height * this.mapScale) / 2;
    this.world.setPosition(this.mapOffsetX, this.mapOffsetY).setScale(this.mapScale);
    this.waterEffects.setPosition(this.mapOffsetX, this.mapOffsetY).setScale(this.mapScale);
  }

  buildWorld() {
    this.world.removeAll(true);
    this.creatures.removeAll(true);
    this.animals = [];
    this.bees = [];
    this.paintOcean();
    this.paintLand();
    this.paintRoads();
    this.paintGarden();
    this.plotLayer = this.add.container(0, 0).setDepth(3);
    this.world.add(this.plotLayer);
    this.paintFarmPlots(this.getFields());
    this.paintBuildings();
    this.paintAnimals();
    this.paintHarbor();
  }

  paintOcean() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.ocean.clear();
    this.ocean.fillGradientStyle(0x52c9c0, 0x50b9c1, 0x2b91a8, 0x277f9b, 1);
    this.ocean.fillRect(0, 0, width, height);
  }

  addTile(x, y, key, frame, scale = TILE_SCALE, depth = 1) {
    const image = this.add.image(x, y, key, frame).setOrigin(0).setScale(scale).setDepth(depth);
    (this.activeLayer || this.world).add(image);
    return image;
  }

  paintLand() {
    const tileSize = TILE * TILE_SCALE;
    const rows = 18;
    const columns = this.portrait ? 11 : 30;

    for (let row = 0; row < rows; row += 1) {
      const coast = this.portrait ? PORTRAIT_COASTLINE[row] : COASTLINE[row];
      const [start, end] = coast;
      for (let col = start; col <= end; col += 1) {
        const x = this.portrait ? col * tileSize : col * tileSize;
        const y = this.portrait ? row * tileSize + 8 : row * tileSize + 20;
        this.addTile(x, y, 'kenney-town', 0, TILE_SCALE);
        if ((row * 7 + col * 3) % 37 === 0) {
          this.addTile(x + tileSize / 2, y + tileSize / 2, 'kenney-town', 1 + (row + col) % 3, 1.5, 2);
        }
      }
    }

    const shore = this.portrait
      ? [[0, columns - 1, rows - 1]]
      : COASTLINE.slice(0, rows).map(([start, end], row) => [start, end, row]);
    for (const edge of shore) {
      const row = edge.length === 3 ? edge[2] : edge[0];
      const [start, end] = edge;
      const y = this.portrait ? row * tileSize + 8 : row * tileSize + 20;
      const edgeColumns = this.portrait ? Array.from({ length: end - start + 1 }, (_, index) => start + index) : [start, end];
      for (const col of edgeColumns) {
        const x = col * tileSize;
        this.addTile(x, y, 'kenney-town', 12, TILE_SCALE, 2);
      }
    }

    if (this.portrait) {
      this.addTile(0, 0, 'kenney-town', 0, 1);
    } else {
      for (const [x, y, frame] of [[105, 190, 16], [820, 218, 32], [110, 510, 16], [835, 492, 32], [785, 510, 16]]) {
        this.addTile(x, y, 'kenney-town', frame, 3, 2);
      }
    }

    this.landBounds = this.portrait
      ? { left: 0, right: 360, top: 8, bottom: 584 }
      : { left: 0, right: 960, top: 20, bottom: 596 };
  }

  paintRoads() {
    const { roadX, roadY } = this.landmarks;
    const tileSize = TILE * TILE_SCALE;
    const road = this.add.graphics().setDepth(2);
    this.world.add(road);
    road.fillStyle(0x8b5940, 0.36);
    road.fillRect(roadX - 22, 118, 44, this.portrait ? 522 : 516);
    road.fillStyle(0xd3a776, 1);
    road.fillRect(roadX - 17, 118, 34, this.portrait ? 522 : 516);
    road.fillStyle(0xe5c496, 0.8);
    road.fillRect(roadX - 11, 118, 22, this.portrait ? 522 : 516);
    road.fillStyle(0x8b5940, 0.36);
    road.fillRect(this.portrait ? 5 : 94, roadY - 18, this.portrait ? 350 : 776, 36);
    road.fillStyle(0xd3a776, 1);
    road.fillRect(this.portrait ? 5 : 94, roadY - 13, this.portrait ? 350 : 776, 26);
    road.fillStyle(0xe5c496, 0.8);
    road.fillRect(this.portrait ? 5 : 94, roadY - 8, this.portrait ? 350 : 776, 16);

    for (let y = 128; y < (this.portrait ? 625 : 635); y += tileSize) {
      for (const x of [roadX - 16, roadX]) this.addTile(x, y, 'kenney-town', 43, TILE_SCALE, 3);
    }
    for (let x = this.portrait ? 0 : 96; x < (this.portrait ? 352 : 870); x += tileSize) {
      this.addTile(x, roadY - 16, 'kenney-town', 43, TILE_SCALE, 3);
    }
  }

  paintGarden() {
    const { farmhouse } = this.landmarks;
    const flowerBeds = this.portrait
      ? [[30, 136], [278, 132], [37, 176], [272, 176]]
      : [[350, 142], [575, 143], [360, 191], [594, 190], [433, 202], [545, 205]];
    flowerBeds.forEach(([x, y], index) => {
      this.addTile(x, y, 'kenney-town', 2, 1.8, 3);
      this.addTile(x + 14, y + 10, 'kenney-farm', 83, 1.5, 3);
    });

    const shrubY = this.portrait ? 400 : 386;
    const shrubCount = this.portrait ? 7 : 16;
    const shrubStart = this.portrait ? 10 : 205;
    const shrubStep = this.portrait ? 49 : 35;
    for (let i = 0; i < shrubCount; i += 1) {
      this.addTile(shrubStart + shrubStep * i, shrubY, 'kenney-town', 5, 2.5, 4);
    }
    this.placeBuilding(farmhouse.x, farmhouse.y, [52, 53, 54, 55], [72, 73, 74, 75], 4, 3);
    this.addSpriteText(farmhouse.x, farmhouse.y + 94, 'GROWORA', 0x6b7745);
  }

  paintFarmPlots(fields) {
    this.plotLayer.removeAll(true);
    this.activeLayer = this.plotLayer;
    const cropPlots = this.landmarks.fields;
    cropPlots.forEach(([x, y], index) => {
      const field = fields[index];
      const width = this.portrait ? 42 : 64;
      const height = this.portrait ? 42 : 64;
      const base = this.add.graphics().setDepth(3);
      this.plotLayer.add(base);
      base.fillStyle(0x38291f, 1);
      base.fillRoundedRect(x - 2, y - 2, width + 4, height + 4, 4);
      base.fillStyle(0x65422f, 1);
      base.fillRoundedRect(x, y, width, height, 3);
      base.fillStyle(0x765039, 1);
      base.fillRoundedRect(x + 3, y + 3, width - 6, height - 6, 2);
      base.lineStyle(1, this.getSelectedField() === index ? 0xffe58a : 0xb78a59, 1);
      base.strokeRoundedRect(x, y, width, height, 3);
      for (let row = 0; row < 3; row += 1) {
        const furrowY = y + 12 + row * (this.portrait ? 9 : 16);
        base.lineStyle(2, 0x4d3329, 0.9);
        base.lineBetween(x + 6, furrowY, x + width - 6, furrowY);
        base.lineStyle(1, 0xa17651, 0.55);
        base.lineBetween(x + 6, furrowY + 3, x + width - 6, furrowY + 3);
      }
      if (!field.unlocked) {
        const lock = this.add.graphics().setDepth(4);
        this.plotLayer.add(lock);
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const lockSize = this.portrait ? 9 : 13;
        lock.fillStyle(0xf2d99e, 1);
        lock.fillRoundedRect(centerX - lockSize / 2, centerY - 1, lockSize, lockSize * 0.72, 2);
        lock.lineStyle(this.portrait ? 1.5 : 2, 0x3b3028, 1);
        lock.strokeCircle(centerX, centerY - 3, lockSize * 0.34);
        lock.fillStyle(0x3b3028, 1);
        lock.fillRect(centerX - lockSize * 0.34, centerY - 2, lockSize * 0.68, lockSize * 0.48);
        return;
      }
      if (!field.plantedAt) return;

      const duration = Math.max(1, field.readyAt - field.plantedAt);
      const progress = Math.max(0, Math.min(1, (Date.now() - field.plantedAt) / duration));
      const stage = progress >= 1 ? 3 : progress >= 0.72 ? 2 : progress >= 0.33 ? 1 : 0;
      const cropFrame = CROP_FRAMES[field.crop] ?? CROP_FRAMES[0];
      const cropScale = stage === 0 ? 0.65 : stage === 1 ? 0.95 : stage === 2 ? 1.25 : 1.55;
      const points = this.portrait
        ? stage < 2 ? [[x + 21, y + 21]] : [[x + 12, y + 13], [x + 30, y + 30]]
        : stage < 2 ? [[x + 32, y + 32]] : [[x + 18, y + 18], [x + 47, y + 18], [x + 32, y + 47], [x + 47, y + 45]];
      for (const [cropX, cropY] of points) {
        this.addTile(cropX - 8, cropY - 8, 'kenney-farm', cropFrame, cropScale, 4);
      }
      if (progress >= 1) {
        const glow = this.add.graphics().setDepth(4.5);
        this.plotLayer.add(glow);
        glow.lineStyle(2, 0xffd05d, 0.9);
        glow.strokeRoundedRect(x - 1, y - 1, width + 2, height + 2, 4);
      }
    });
    this.plotSignature = this.fieldSignature(fields);
    this.activeLayer = null;
  }

  fieldSignature(fields) {
    const now = Date.now();
    const stages = fields.map((field) => {
      if (!field.plantedAt) return 0;
      const duration = Math.max(1, field.readyAt - field.plantedAt);
      const progress = Math.max(0, Math.min(1, (now - field.plantedAt) / duration));
      return progress >= 1 ? 3 : progress >= 0.72 ? 2 : progress >= 0.33 ? 1 : 0;
    });
    return `${this.getSelectedField()}|${fields.map((field, index) => [
      field.unlocked,
      field.crop,
      field.plantedAt,
      field.readyAt,
      stages[index],
    ].join(':')).join('|')}`;
  }

  placeBuilding(x, y, roofFrames, wallFrames, columns = 4, rows = 3) {
    const size = TILE * TILE_SCALE;
    const left = x - columns * size / 2;
    const top = y - rows * size / 2;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const index = row * columns + col;
        const frame = row < 1 ? roofFrames[index % roofFrames.length] : wallFrames[index % wallFrames.length];
        this.addTile(left + col * size, top + row * size, 'kenney-town', frame, TILE_SCALE, 4 + row * 0.01);
      }
    }
    const shadow = this.add.graphics().setDepth(3.8);
    this.world.add(shadow);
    shadow.fillStyle(0x34443a, 0.25);
    shadow.fillEllipse(x, y + rows * size / 2, columns * size * 1.1, size * 0.48);
  }

  addSpriteText(x, y, value, color = 0x5c4834) {
    const text = this.add.text(x, y, value, {
      fontFamily: 'monospace',
      fontSize: this.portrait ? '10px' : '12px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      backgroundColor: '#f4d89b',
      padding: { left: 5, right: 5, top: 2, bottom: 2 },
    }).setOrigin(0.5).setDepth(5);
    this.world.add(text);
    return text;
  }

  paintBuildings() {
    const { market, vehicle, coop, apiary } = this.landmarks;
    this.placeBuilding(coop.x, coop.y, [48, 49, 50, 51], [56, 57, 58, 59], this.portrait ? 3 : 4, 3);
    this.placeBuilding(market.x, market.y, [52, 53, 54, 55], [72, 73, 74, 75], this.portrait ? 3 : 4, 3);
    this.addSpriteText(market.x, market.y - (this.portrait ? 45 : 58), 'MARKET', 0x633e34);

    for (let hive = 0; hive < 3; hive += 1) {
      const hx = apiary.x + (hive - 1) * (this.portrait ? 31 : 48);
      const hy = apiary.y + (hive % 2) * 9;
      this.addTile(hx - 8, hy - 8, 'kenney-town', 94, this.portrait ? 1.8 : 2.4, 4);
      this.addSpriteText(hx, hy + 22, '✿', 0x4b8e53);
    }

    this.placeVehicle(vehicle.x, vehicle.y);
    this.addTile(market.x + 54, market.y + 12, 'kenney-farm', 47, this.portrait ? 1.4 : 1.8, 4.2);
    this.addTile(market.x + 70, market.y + 10, 'kenney-farm', 44, this.portrait ? 1.1 : 1.4, 4.2);
    this.paintFence(coop);
    this.paintDecorations();
  }

  placeVehicle(x, y) {
    const vehicle = this.add.graphics().setDepth(4.2);
    this.world.add(vehicle);
    vehicle.fillStyle(0x314641, 0.3);
    vehicle.fillEllipse(x, y + 10, 68, 34);
    vehicle.fillStyle(0x302824, 1);
    for (const wheelY of [y - 13, y + 7]) {
      vehicle.fillRoundedRect(x - 29, wheelY, 9, 14, 2);
      vehicle.fillRoundedRect(x + 20, wheelY, 9, 14, 2);
    }
    vehicle.fillStyle(0x5b302c, 1);
    vehicle.fillRoundedRect(x - 25, y - 20, 50, 39, 7);
    vehicle.fillStyle(0xc75e4b, 1);
    vehicle.fillRoundedRect(x - 22, y - 18, 44, 35, 6);
    vehicle.fillStyle(0xe98767, 1);
    vehicle.fillRoundedRect(x - 15, y - 16, 30, 8, 3);
    vehicle.fillStyle(0x416b70, 1);
    vehicle.fillRoundedRect(x - 15, y - 7, 30, 9, 2);
    vehicle.fillRoundedRect(x - 15, y + 4, 30, 7, 2);
    vehicle.fillStyle(0xf4d58a, 1);
    vehicle.fillRect(x - 17, y - 20, 7, 3);
    vehicle.fillRect(x + 10, y - 20, 7, 3);
  }

  paintFence(coop) {
    const fence = this.add.graphics().setDepth(4.5);
    this.world.add(fence);
    const radiusX = this.portrait ? 54 : 98;
    const radiusY = this.portrait ? 48 : 66;
    const width = radiusX * 2;
    const height = radiusY * 2;
    fence.lineStyle(this.portrait ? 3 : 5, 0x9a7045, 1);
    fence.strokeRoundedRect(coop.x - radiusX, coop.y - radiusY, width, height, 9);
    fence.lineStyle(this.portrait ? 2 : 3, 0xd3aa72, 1);
    fence.strokeRoundedRect(coop.x - radiusX, coop.y - radiusY + 13, width, height - 26, 7);
    fence.clear();
    fence.lineStyle(this.portrait ? 3 : 5, 0x9a7045, 1);
    fence.strokeRoundedRect(coop.x - radiusX, coop.y - radiusY, width, height, 9);
    fence.lineStyle(this.portrait ? 2 : 3, 0xd3aa72, 1);
    fence.lineBetween(coop.x - radiusX, coop.y - radiusY + 13, coop.x + radiusX, coop.y - radiusY + 13);
    fence.lineBetween(coop.x - radiusX, coop.y + radiusY - 13, coop.x + radiusX, coop.y + radiusY - 13);
    fence.lineStyle(this.portrait ? 3 : 4, 0xf1d294, 1);
    fence.lineBetween(coop.x - 12, coop.y + radiusY, coop.x + 12, coop.y + radiusY);
  }

  paintDecorations() {
    const trees = this.portrait
      ? [[18, 126], [326, 184], [12, 496], [329, 566]]
      : [[110, 183], [845, 179], [125, 537], [855, 552], [808, 334]];
    for (const [x, y] of trees) {
      const tree = this.add.image(x, y, 'kenney-town', 4).setScale(this.portrait ? 2.3 : 3.2).setDepth(4);
      this.world.add(tree);
    }
  }

  paintAnimals() {
    const { coop, apiary } = this.landmarks;
    const chickenCount = 3;
    for (let index = 0; index < chickenCount; index += 1) {
      const chicken = this.add.sprite(coop.x - 27 + index * 20, coop.y + 23, 'kenney-farm', 120)
        .setScale(this.portrait ? 1.3 : 1.7)
        .setDepth(5);
      this.world.add(chicken);
      this.animals.push({
        sprite: chicken,
        originX: chicken.x,
        originY: chicken.y,
        bounds: this.portrait ? { left: coop.x - 42, right: coop.x + 42, top: coop.y - 14, bottom: coop.y + 26 } : { left: coop.x - 78, right: coop.x + 78, top: coop.y - 14, bottom: coop.y + 30 },
        nextMoveAt: 0,
        pauseUntil: 0,
      });
    }

    for (let index = 0; index < 4; index += 1) {
      const bee = this.add.graphics().setDepth(5.1);
      bee.fillStyle(0xf6cf52, 1);
      bee.fillEllipse(0, 0, this.portrait ? 5 : 7, this.portrait ? 3 : 4);
      bee.fillStyle(0x43372f, 1);
      bee.fillRect(this.portrait ? -1 : -1, this.portrait ? -1.5 : -2, 1.5, this.portrait ? 3 : 4);
      bee.fillStyle(0xf5ffdf, 0.9);
      bee.fillEllipse(-1, this.portrait ? -2 : -3, 2, 2);
      this.world.add(bee);
      this.bees.push({ sprite: bee, hive: index % 3, phase: index * Math.PI / 2 });
    }
  }

  paintHarbor() {
    const { dock } = this.landmarks;
    const size = TILE * TILE_SCALE;
    const dockGraphics = this.add.graphics().setDepth(4);
    this.world.add(dockGraphics);
    dockGraphics.fillStyle(0x654631, 1);
    dockGraphics.fillRoundedRect(dock.x - (this.portrait ? 38 : 55), dock.y - 15, this.portrait ? 78 : 112, 58, 6);
    dockGraphics.fillStyle(0xc3935e, 1);
    for (let plank = 0; plank < 7; plank += 1) {
      dockGraphics.fillRect(dock.x - (this.portrait ? 34 : 51) + plank * (this.portrait ? 10 : 15), dock.y - 13, this.portrait ? 8 : 12, 54);
    }
    dockGraphics.lineStyle(3, 0x634a36, 1);
    for (const x of [dock.x - 32, dock.x + 31]) {
      dockGraphics.lineBetween(x, dock.y - 22, x, dock.y + 48);
      dockGraphics.fillCircle(x, dock.y - 20, 4);
    }
    dockGraphics.fillStyle(0x4b3529, 1);
    dockGraphics.fillTriangle(dock.x + 65, dock.y + 37, dock.x + 108, dock.y + 37, dock.x + 86, dock.y + 82);
    dockGraphics.fillStyle(0xb67c4d, 1);
    dockGraphics.fillTriangle(dock.x + 70, dock.y + 40, dock.x + 103, dock.y + 40, dock.x + 86, dock.y + 72);
    dockGraphics.fillStyle(0x6b4934, 1);
    dockGraphics.fillRect(dock.x + 76, dock.y + 49, 21, 4);
    dockGraphics.fillRect(dock.x + 79, dock.y + 61, 15, 4);
    this.addSpriteText(dock.x, dock.y - 37, 'FISHING', 0x405d69);
    this.fish = this.add.graphics().setPosition(dock.x + 94, dock.y + 60).setDepth(1.4).setVisible(false);
    this.fish.fillStyle(0x42b6b2, 1);
    this.fish.fillEllipse(0, 0, 12, 7);
    this.fish.fillTriangle(-5, 0, -11, -5, -11, 5);
    this.fish.fillStyle(0xffe4a4, 1);
    this.fish.fillEllipse(2, 2, 7, 2);
    this.fish.fillStyle(0x244a51, 1);
    this.fish.fillCircle(4, -1, 1);
    this.world.add(this.fish);
    this.fishJumpAt = this.time.now + 2500;
    this.dockSeaBounds = { left: dock.x + 75, right: dock.x + 148, top: dock.y + 30, bottom: dock.y + 55 };
    this.splashAt = 0;
  }

  paintWater(time) {
    this.waterEffects.clear();
    const { left, right, top, bottom } = this.dockSeaBounds;
    const duration = 1500;
    if (time >= this.fishJumpAt && this.fish && !this.fish.visible) {
      this.fish.setPosition(Phaser.Math.Between(left + 10, right - 10), bottom - 2).setVisible(true);
      this.tweens.add({
        targets: this.fish,
        y: top + 3,
        angle: 180,
        duration,
        ease: 'Sine.easeOut',
        yoyo: true,
        onComplete: () => {
          this.fish?.setVisible(false).setAngle(0);
          this.splashAt = this.time.now;
          this.fishJumpAt = this.time.now + Phaser.Math.Between(3500, 7000);
        },
      });
    }
    for (let index = 0; index < 9; index += 1) {
      const y = top + (index % 3) * 18 + Math.sin(time / 500 + index) * 4;
      const x = left + ((time / 28 + index * 31) % Math.max(1, right - left));
      this.waterEffects.lineStyle(index % 3 === 0 ? 2 : 1, 0xc4fff0, 0.3);
      this.waterEffects.beginPath();
      this.waterEffects.arc(x, y, 5 + index % 3, 0.2, Math.PI * 1.1);
      this.waterEffects.strokePath();
    }
    if (this.splashAt && time - this.splashAt < 450) {
      this.waterEffects.lineStyle(2, 0xe0fff1, 0.8 * (1 - (time - this.splashAt) / 450));
      this.waterEffects.strokeEllipse(this.fish.x, this.fish.y, 18, 7);
      this.waterEffects.strokeEllipse(this.fish.x, this.fish.y, 30, 12);
    }
    const shoreline = this.portrait
      ? [[72, 578], [180, 580], [288, 578]]
      : [[415, 583], [474, 595], [540, 585], [675, 555]];
    shoreline.forEach(([x, y], index) => {
      this.waterEffects.lineStyle(2, 0xd8fff1, 0.42 + Math.sin(time / 380 + index) * 0.12);
      this.waterEffects.beginPath();
      this.waterEffects.arc(x + Math.sin(time / 600 + index) * 3, y, 7 + index % 2 * 3, 0.1, Math.PI * 0.95);
      this.waterEffects.strokePath();
    });
  }

  paintIsland(fields) {
    if (!this.plotLayer || this.fieldSignature(fields) === this.plotSignature) return;
    this.paintFarmPlots(fields);
  }

  update(time, delta) {
    this.waterTime += delta;
    this.paintWater(time);
    const { coop, apiary } = this.landmarks;
    this.animals.forEach((animal, index) => {
      const { sprite, bounds } = animal;
      if (time >= animal.pauseUntil && time >= animal.nextMoveAt) {
        const nextX = Phaser.Math.Clamp(sprite.x + Phaser.Math.Between(-26, 26), bounds.left, bounds.right);
        const nextY = Phaser.Math.Clamp(sprite.y + Phaser.Math.Between(-12, 12), bounds.top, bounds.bottom);
        animal.pauseUntil = time + Phaser.Math.Between(1000, 2600);
        animal.nextMoveAt = animal.pauseUntil + Phaser.Math.Between(1200, 3000);
        sprite.setFlipX(nextX < sprite.x);
        this.tweens.add({ targets: sprite, x: nextX, y: nextY, duration: 650, ease: 'Sine.easeInOut' });
      }
      sprite.setFrame(120 + (Math.floor(time / 420 + index) % 2));
    });
    this.bees.forEach(({ sprite, hive, phase }) => {
      const angle = time / 680 + phase;
      const centerX = apiary.x + (hive - 1) * (this.portrait ? 31 : 48);
      const centerY = apiary.y + (hive % 2) * 9 - 12;
      sprite.setPosition(centerX + Math.cos(angle) * 12, centerY + Math.sin(angle * 1.1) * 8);
    });
  }

  handleTap(pointer) {
    const x = (pointer.x - this.mapOffsetX) / this.mapScale;
    const y = (pointer.y - this.mapOffsetY) / this.mapScale;
    const { fields, farmhouse, coop, apiary, market, dock } = this.landmarks;
    const fieldSize = this.portrait ? 42 : 64;
    const fieldIndex = fields.findIndex(([fieldX, fieldY]) => x >= fieldX && x <= fieldX + fieldSize && y >= fieldY && y <= fieldY + fieldSize);
    if (fieldIndex >= 0) {
      this.onPlot(fieldIndex);
      return;
    }

    const places = [
      { point: farmhouse, radiusX: 72, radiusY: 68, tab: 'shop' },
      { point: coop, radiusX: this.portrait ? 57 : 90, radiusY: 62, tab: 'animals' },
      { point: apiary, radiusX: this.portrait ? 60 : 95, radiusY: 44, tab: 'animals' },
      { point: market, radiusX: this.portrait ? 48 : 80, radiusY: 67, tab: 'market' },
      { point: dock, radiusX: this.portrait ? 72 : 100, radiusY: 72, tab: 'fishing' },
    ];
    const place = places.find(({ point, radiusX, radiusY }) => Math.abs(x - point.x) <= radiusX && Math.abs(y - point.y) <= radiusY);
    if (place) this.onPlace(place.tab);
  }
}
