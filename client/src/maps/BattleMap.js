export const MAP_DATA = [
    "1111111111111111111111111111111111111111111111111111",
    "1111111111111111111111111111111111111111111111111111",
    "11000000SS00002200000000111100000000220000SS00000011",
    "11000000SS00002200000000111100000000220000SS00000011",
    "1100222222220011000000002222000000001100222222220011",
    "1100222222220011000000002222000000001100222222220011",
    "1111111111000011111111111111111111110000111111111111",
    "1111111111000011111111111111111111110000111111111111",
    "1100000000000022000000002222000000002200000000000011",
    "1100000000000022000000002222000000002200000000000011",
    "110000BB000000221111000000000000111122000000BB000011",
    "110000BB000000221111000000000000111122000000BB000011",
    "110000BB000000221111000000000000111122000000BB000011",
    "110000BB000000221111000000000000111122000000BB000011",
    "1100000000000022000000002222000000002200000000000011",
    "1100000000000022000000002222000000002200000000000011",
    "1111111111000011111111111111111111110000111111111111",
    "1111111111000011111111111111111111110000111111111111",
    "1100222222220011000000002222000000001100222222220011",
    "1100222222220011000000002222000000001100222222220011",
    "11000000SS00002200000000111100000000220000SS00000011",
    "11000000SS00002200000000111100000000220000SS00000011",
    "1111111111111111111111111111111111111111111111111111",
    "1111111111111111111111111111111111111111111111111111"
];

export default class BattleMap {
    constructor(scene) {
        this.scene = scene;
        this.TILE_SIZE = 40;
        this.width = 0;
        this.height = 0;
        this.mapMatrix = [];
        this.spawnPoints = [];
        
        // Physics groups
        this.walls = null;
        this.softWalls = null;
        this.items = null;
        this.grid = null;
    }

    create() {
        this.width = MAP_DATA[0].length * this.TILE_SIZE;
        this.height = MAP_DATA.length * this.TILE_SIZE;

        // Cập nhật World Bounds
        this.scene.physics.world.setBounds(0, 0, this.width, this.height);

        // Tạo các nhóm Physics
        this.walls = this.scene.physics.add.staticGroup(); // Tường cứng (1)
        this.softWalls = this.scene.physics.add.staticGroup(); // Tường mềm (2)
        this.items = this.scene.physics.add.staticGroup(); // Item (B)

        // Parse Map
        // Tạo bản sao BattleMap để có thể cập nhật trạng thái (từ '2' thành '0')
        this.mapMatrix = MAP_DATA.map(row => row.split(''));

        MAP_DATA.forEach((row, rowIndex) => {
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
                const tile = row[colIndex];
                const x = colIndex * this.TILE_SIZE + this.TILE_SIZE / 2;
                const y = rowIndex * this.TILE_SIZE + this.TILE_SIZE / 2;

                if (tile === '1') {
                    // Tường cứng (Hard)
                    const wall = this.scene.add.rectangle(x, y, this.TILE_SIZE, this.TILE_SIZE, 0x999999);
                    wall.setStrokeStyle(2, 0x000000);
                    this.walls.add(this.scene.add.existing(wall));
                } else if (tile === '2') {
                    // Tường mềm (Soft) - phá được
                    const wall = this.scene.add.rectangle(x, y, this.TILE_SIZE, this.TILE_SIZE, 0xA0522D); // Màu nâu đất
                    wall.setStrokeStyle(2, 0x5c4033);
                    wall.setData('gridPos', { row: rowIndex, col: colIndex }); // Lưu vị trí grid
                    this.softWalls.add(this.scene.add.existing(wall));
                } else if (tile === 'S') {
                    // Điểm Spawn
                    this.spawnPoints.push({ x, y });
                } else if (tile === 'B') {
                    // Item (Buff)
                    const item = this.scene.add.rectangle(x, y, this.TILE_SIZE * 0.6, this.TILE_SIZE * 0.6, 0x00FFFF); // Màu Cyan
                    // Thêm hiệu ứng xoay cho item
                    this.scene.tweens.add({
                        targets: item,
                        angle: 360,
                        duration: 3000,
                        repeat: -1
                    });
                    this.items.add(this.scene.add.existing(item));
                }
            }
        });

        // Nền lưới
        this.createGrid();
    }

    createGrid() {
        if(this.grid) this.grid.destroy();
        this.grid = this.scene.add.grid(this.width / 2, this.height / 2, this.width, this.height, this.TILE_SIZE, this.TILE_SIZE, 0x222222, 0.2).setScrollFactor(1);
    }

    resize(width, height) {
        // Grid luôn ở giữa map, không theo màn hình
        // (Camera sẽ tự scroll theo player)
    }

    destroySoftWall(wall) {
        // Cập nhật trạng thái map data từ '2' thành '0'
        const { row, col } = wall.getData('gridPos');
        if (this.mapMatrix[row] && this.mapMatrix[row][col]) {
             this.mapMatrix[row][col] = '0';
             console.log(`Soft wall destroyed at [${row}, ${col}]. Map data updated.`);
        }

        wall.destroy(); // Phá hủy tường ngay lập tức (1 hit)
        // TODO: Thêm hiệu ứng vỡ gạch
    }

    getSpawnPoints() {
        return this.spawnPoints;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }
}
