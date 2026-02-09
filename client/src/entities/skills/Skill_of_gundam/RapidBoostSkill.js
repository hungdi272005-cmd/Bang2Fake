import Phaser from 'phaser';
import Skill from '../Skill';

export default class RapidBoostSkill extends Skill {
  constructor(scene) {
    super(scene, { 
        cooldown: 10000, // Hồi chiêu 10 giây
        key: 'e'
    }); 
  }

  execute(tankContainer) {
    // Tìm các thành phần của xe tăng
    // Chúng ta cần truy cập instance Tank hoặc các component trực tiếp
    // tankContainer chỉ là container hiển thị.
    // Chữ ký 'execute' của lớp Skill trong thiết kế hiện tại có thể cần truyền components hoặc chúng ta tự tìm kiếm.
    
    // LƯU Ý: Trong TankAbilities.js, chúng ta thấy:
    // useSkill('space', movementComponent)
    // Nhưng với 'e' (Shield), nó là: useSkill('e')
    
    // Chúng ta cần truy cập TankWeapon và TankMovement.
    // Vì cấu trúc cơ sở của class Skill là: execute(tankContainer, ...args)
    // Chúng ta có thể cần truyền Weapon và Movement components khi kích hoạt.
    
    // Tuy nhiên, nhìn vào cấu trúc Tank.js:
    // this.movement = ...
    // this.weapon = ...
    // this.abilities = ...
    
    // TankAbilities dường như không giữ tham chiếu đến movement hoặc weapon theo mặc định,
    // trừ khi được truyền vào trong 'update' hoặc 'activate'.
    
    // HACK: Chúng ta có thể thử giả định `tankContainer.parent` hoặc tương tự,
    // hoặc tốt hơn, chúng ta có thể sửa đổi TankAbilities.js để truyền toàn bộ instance Tank hoặc các components.
    
    // NHƯNG, để giữ đơn giản và nhất quán với code trước đó:
    // Trong Tank.js:
    // useAbilityE() { this.abilities.useShield(); }
    
    // Chúng ta nên cập nhật Tank.js để truyền các components chúng ta cần.
    // sửa Tank.js: useAbilityE() { this.abilities.useRapidBoost(this.movement, this.weapon); }
    // sửa TankAbilities.js: useRapidBoost(movement, weapon) { this.useSkill('e', movement, weapon); }
    
    // Vì vậy ở đây, execute nhận (container, movement, weapon)
  }
  
  // Viết lại execute mong đợi tham số
  activate(tankContainer, pointer, movementComponent, weaponComponent) {
      if (!this.canUse()) return;
      // Lưu ý: Chúng ta có thể nhận (tank, pointer, movement, weapon)
      // Gọi super.activate có thể chỉ với tank, nhưng super.activate gọi execute với ...args
      // đơn giản hơn là chỉ thực hiện logic ở đây hoặc gọi super.activate(tank) và sau đó execute?
      
      // Skill.js activate mặc định:
      // activate(tank, ...args) { this.execute(tank, ...args); }
      
      // Vì vậy nếu chúng ta để Skill.js xử lý, execute sẽ được gọi với (tank, pointer, movement, weapon)
      // Nhưng ở đây chúng ta ghi đè activate.
      
      // Hãy tự gọi logic cơ bản nhưng kiểm soát chặt chẽ cuộc gọi execute
      if (this.canUse()) {
        this.lastUsed = this.scene.time.now;
        this.execute(tankContainer, pointer, movementComponent, weaponComponent);
        return true;
      }
      return false;
  }

  execute(tankContainer, pointer, movementComponent, weaponComponent) {
      if (!movementComponent || !weaponComponent) {
          console.error("RapidBoostSkill: Missing components!", movementComponent, weaponComponent);
          return;
      }

      // 1. Kích hoạt Tăng tốc
      movementComponent.setSpeed(170);

      // 2. Kích hoạt Chế độ Bắn Nhau
      weaponComponent.setBurstMode(true);

      // 3. Đặt hẹn giờ để hoàn tác
      this.scene.time.delayedCall(4000, () => {
          movementComponent.resetSpeed();
          weaponComponent.setBurstMode(false);
      });
  }
}
