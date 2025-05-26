class Platformer extends Phaser.Scene{
    constructor(){
        super("platformerScene")
    }

    init(){
        this.ACCELERATION = 500;
        this.DRAG = 2000;
        this.JUMP_VELOCITY = -410;
        this.physics.world.gravity.y = 1500;
        this.PARTICLE_VELOCITY = 0;
        this.SCALE = 2;
        this.canDouble = true;
    }

    preload(){
    }

    create(){
        //Creates a new map of 16x16 tiles
        //Width of 60 tiles, height of 40 tiles
        this.map = this.add.tilemap("stage",16,16,60,40);

        //Adding tileset to the map
        //First parameter is the name of the tileset in Tiled
        //Second parameter is the key from the loaded tilemap
        this.tileset = this.map.addTilesetImage("monochrome_tilemap_packed","tilemap_tiles");

        //Load our Tiled layers
        this.backParallax = this.map.createLayer("BackParallax",this.tileset,0,50);
        this.platforms = this.map.createLayer("Platforms",this.tileset,0,0);

        //Set up parallax background
        this.backParallax.setAlpha(.6)
        this.backParallax.setScale(.99)
        this.backParallax.setScrollFactor(.5);
        
        //Set collidable tiles
        this.platforms.setCollisionByProperty({
            collides: true
        });

        this.backParallax.setCollisionByProperty({
            collides: false
        });

        //Set Player character
        my.sprite.player = this.physics.add.sprite(50,500,"platformer_characters","tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        //Enable player collision with map
        this.physics.add.collider(my.sprite.player,this.platforms);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        //Code for the camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        //Code for VFX
        my.vfx.walking = this.add.particles(0,0,"kenny-particles",{
            frame:["star_06.png","star_07.png","star_08.png","star_09.png"],
            random: true,
            scale: {start: 0.01, end: 0.15},
            maxAliveParticles: 10,
            lifespan: 250,
            gravityY: -300,
            alpha: {start: 1, end: 0.1}
        })

        my.vfx.walking.stop();

        my.vfx.jumping = this.add.particles(0,0,"kenny-particles",{
            frame: ["slash_01.png","slash_02.png"],
            random: true,
            scale: {start:0.1,end:.2},
            lifespan: 150,
            gravityY: 400,
            maxAliveParticles: 1,
            duration: 150,
            alpha:{start: 1, end:.1}
        })
        
        my.vfx.jumping.stop();

        //Setting up coin objects

        this.coins = this.map.createFromObjects("Coins",{
            name: "coin",
            key: "transparent",
            frame: 2
        });

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        this.physics.add.overlap(my.sprite.player, this.coinGroup,(obj1,obj2)=>{
            obj2.destroy();
        })

    }

    update(){
        //Handle left and right movement
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            //Handle VFX animation
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            //make sure player is on the ground before playing particles
            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        }else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-20, my.sprite.player.displayHeight/2-5, false);
 
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }
        }else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        //Checking if player is touching the floor
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            my.vfx.walking.stop();
        }

        //Handle jumping
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            //VFX for jump particle
            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2-5,false);
            my.vfx.jumping.start();
        }

        //Handle double jump
        if(!my.sprite.player.body.blocked.down && this.canDouble && Phaser.Input.Keyboard.JustDown(cursors.up)){
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2-5,false);
            my.vfx.jumping.start();
            this.canDouble = false;
        }

        //Reset double jump condition
        if(my.sprite.player.body.blocked.down){
            this.canDouble = true;
        }

        //Reset stage
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        if(my.sprite.player.y >= config.height-100){
            this.scene.restart();
        }

    }
}