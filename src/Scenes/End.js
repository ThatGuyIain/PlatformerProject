class End extends Phaser.Scene{
    constructor(){
        super("endgame");
    }

    init(){

    }

    preload(){

    }

    create(){
        this.add.text((config.width/2)-75,(config.height/2)-150, "Level complete!", {
            fontFamily: 'Times, serif',
            fontSize: 50,
            wordWrap: {
                width: 1000
            }
        });

        this.add.text((config.width/2)-100,(config.height/2), "Play Again? Press R",{
            fontFamily:'Times, serif',
            fontSize:30,
            wordWrap:{
                width: 500
            }
        });

        this.start = this.input.keyboard.addKey('R');
    }

    update(){
        if(Phaser.Input.Keyboard.JustDown(this.start)) {
            this.scene.start("platformerScene");
        }

    }
}