import Phaser from 'phaser';

export default class FPSDisplay extends Phaser.GameObjects.Text {
    constructor(scene, x, y) {
        super(scene, x, y, 'FPS: 0', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#00ff00',
            backgroundColor: '#00000088',
            padding: { x: 5, y: 5 }
        });

        this.scene.add.existing(this);
        this.setScrollFactor(0); // Fix vị trí trên màn hình, không trôi theo camera
        this.setDepth(100); // Luôn hiển thị trên cùng
    }

    update() {
        // Lấy FPS thực tế
        const fps = this.scene.game.loop.actualFps;
        this.setText(`FPS: ${Math.round(fps)}`);
        
        // Đổi màu cảnh báo nếu thấp
        if (fps < 30) {
            this.setColor('#ff0000');
        } else if (fps < 50) {
            this.setColor('#ffff00');
        } else {
            this.setColor('#00ff00');
        }
    }
}
