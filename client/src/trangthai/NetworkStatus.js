import Phaser from 'phaser';

export default class NetworkStatus extends Phaser.GameObjects.Text {
    constructor(scene, x, y) {
        super(scene, x, y, 'Ping: 0ms', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#00ff00',
            backgroundColor: '#00000088',
            padding: { x: 5, y: 5 }
        });

        this.scene.add.existing(this);
        this.setScrollFactor(0); // Fix vị trí trên màn hình
        this.setDepth(100);

        this.currentPing = 0;
    }

    // Hàm cập nhật ping từ bên ngoài (khi có networking)
    updatePing(ping) {
        this.currentPing = ping;
        this.setText(`Ping: ${this.currentPing}ms`);
        
        if (this.currentPing > 200) {
            this.setColor('#ff0000');
        } else if (this.currentPing > 100) {
            this.setColor('#ffff00');
        } else {
            this.setColor('#00ff00');
        }
    }

    update() {
        // Nếu không có mạng thật, có thể hiển thị giả lập hoặc giữ nguyên
        // Ở đây mình để component thụ động, chờ được gọi updatePing
    }
}
