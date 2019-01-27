const foodTypes = {
	ANY:0,
	LIQUID:1,
		WATER:11,
		OIL:12,
	VEGETABLE:2,
		EGGPLANT:21,
		CARROT:22,
		CABBAGE:23,
	FRUIT:3,
		BANANA:31,
		ORANGE:32,
		APPLE:33,
	BREAD:4,
	MEAT:5,
		BONE:51,
		STEAK:52,
		PORK:53
};

const liquids = [11, 12];
const vegetables = [21, 22, 23];
const fruits = [31, 32, 33];
const meats = [51, 52, 53];

const foodNames = {
	11:"water.png",
	12:"Oil.png",
	21:"eggplant.png",
	22:"Carrot.png",
	23:"Cabbage.png",
	31:"bannana.png",
	32:"orange.png",
	33:"Apple.png",
	4:"BreadPiece.png",
	51:"Bone.png",
	52:"Steak.png",
	53:"Pork.png"
};

const towerTypes = {
	COMPOST:1,
	ANIMALS:2,
	FACTORY:3,
	DONATION:4,
	RECYCLE:5,
	PURIFIER:6
};

const uiMargin = 120

const relPos = {
	IGNOREMARGIN:0,
	USEMARGIN:1,
	SIDEBAR:2
};

const waves = [
   // FORMAT: time:TIME TO START IN SECONDS, type:foodTypes.ANY, startRate:FRAMES BETWEEN SPAWNING A NEW FOOD, endRate:AMOUNT OF FOOD SPAWNED IS LERPED BETWEEN startRate AND THIS, length:HOW LONG FOOD WILL BE SPAWNED
   /*[{time: 2, type: foodTypes.FRUIT, startRate: 2.1, endRate: 2.1, length: 20, from: 0}],
   [{time: 2, type: foodTypes.FRUIT, startRate: 2, endRate: 1.6, length: 40, from: 0}]*/
   
   // FOR DEMO:
   [{time: 2, type: foodTypes.ANY, startRate: 1, endRate: .5, length: 35, from: 0}],
   [{time: 2, type: foodTypes.ANY, startRate: .3, endRate: .3, length: 35, from: 0}]
];

var inProgress = [];

var style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 20,
    stroke: '#ffffff',
    strokeThickness: 30,
    });

var playericon;

var tutorial01 = new PIXI.Text("Health Bar - This will decrease as food is wasted.\nIt's Game Over when it hits zero!", style);
tutorial01.x = 80;
tutorial01.y = 123;
var tutorial02 = new PIXI.Text("Money - Use your savings to invest in towers to help save food.");
tutorial02.x = 30;
tutorial02.y = 90;
var tutorial03 = new PIXI.Text("Score - Gain points by preventing food waste with towers!");
tutorial03.x = 30;
tutorial03.y = 90;
var tutorial04 = new PIXI.Text("Experience Bar - Increase this by saving food to face new challenges.");
tutorial04.x = 30;
tutorial04.y = 90;
var tutorial05 = new PIXI.Text("Garbage Bin - If food on the conveyor belt reaches the bin, you will lose health!");
tutorial05.x = 30;
tutorial05.y = 90;
var tutorial06 = new PIXI.Text("Compost Tower - Inexpensive and accepts anything non-liquid, slow and not greatly profitable.");
tutorial06.x = 30;
tutorial06.y = 90;
var tutorial07 = new PIXI.Text("Animal Tower - Ravenously devours meats.");
tutorial07.x = 30;
tutorial07.y = 90;
var tutorial08 = new PIXI.Text("Factory Tower - Accepts everything except meats. Is not very profitable.");
tutorial08.x = 30;
tutorial08.y = 90;
var tutorial09 = new PIXI.Text("Donation Tower - Expensive and selective, yet quick and profitable.");
tutorial09.x = 30;
tutorial09.y = 90;
var tutorial10 = new PIXI.Text("Recyling Tower - Accepts food and water.");
tutorial10.x = 30;
tutorial10.y = 90;
var tutorial11 = new PIXI.Text("Purifier Tower - Effeciently processes water.");
tutorial11.x = 30;
tutorial11.y = 90;


const secondsPerFrame = 1 / 60;

function Init() {
	// Initialize game window
	app = new PIXI.Application(720, 720 + uiMargin * 2, {backgroundColor:0x000000, antialias:true});
	app.renderer.autoResize = true;
	document.getElementById("playframe").appendChild(app.view);

    var easterEggBG = new PIXI.particles.ParticleContainer(10000, {scale:true, position:true, rotation:true, uvs:false, alpha:false});

	hudStyle = new PIXI.TextStyle({fontFamily:'Arial', fontSize:11});

	// Import textures
	PIXI.loader.add("logo", "../Pixi/images/menu.png")
			   .add("playB", "../Pixi/images/PlayBut.png")
			   .add("lBoardsB", "../Pixi/images/LeaderboardButton.png")
			   .load(Init2);
}

function Init2(){
	let halfWidth = app.renderer.width / 2;
    
	mmLogo = GetObj(GetSprite("logo", .5, .5, 1, 1), halfWidth, 480, app.stage, relPos.IGNOREMARGIN);
	mmPlay = GetObj(GetSprite("playB", .5, .5, 1.5, 1.5), halfWidth, 665, app.stage, relPos.IGNOREMARGIN);
	mmLBoards = GetObj(GetSprite("lBoardsB", .5, .5, 1.5, 1.5), halfWidth, 785, app.stage, relPos.IGNOREMARGIN);

	mmPlay.interactive = true;
	mmPlay.buttonMode = true;
	mmPlay.on("pointerdown", StartGame);
	mmLBoards.interactive = true;
	mmLBoards.buttonMode = true;
	mmLBoards.on("pointerdown", ShowLBoards);

	scaleToWindow(app.view);

	// Prints render type (Khide's desktop uses WebGL & masking does not work)
	if(app instanceof PIXI.CanvasRenderer) {console.log("CANVAS");} else {console.log("WEBGL");}
}

function ShowLBoards(){
	// Show and animate the leaderboard. 
    Destroy(mmLogo);
	Destroy(mmPlay);
	Destroy(mmLBoards);
    var lBoardTitle = new PIXI.Text('Leaderboard!', {
			fontWeight: 'bold',
			fontSize: 60,
			fontFamily: 'Arial',
			fill: '#CD0000',
			align: 'center',
			stroke: '#FFFFFF',
			strokeThickness: 6
		});

		
   		lBoardTitle.anchor.set(0.5);
		lBoardTitle.x = app.screen.width / 2;
		lBoardTitle.y = app.screen.height / 7;
        
        app.stage.addChild(lBoardTitle);
        
       PIXI.loader.add("whiteBox", "../Pixi/images/WhiteBox.png")
			   .load(connect);
}

function connect() {
    //Connect to MS SQL server
    var Connection = require('tedious').Connection;
    var Request = require('tedious').Request;
    
    queryDatabase();
                   
// Create connection to database
    var config = 
   {
     userName: 'apollo78124', 
     password: 'bcitGroup4$', 
     server: 'disk1.database.windows.net', 
     options: 
        {
           database: 'disk1'
           , encrypt: true
        }
           }
        var connection = new Connection(config);

        // Attempt to connect and execute queries if connection goes through
        connection.on('connect', function(err) 
           {
             if (err) 
               {
                  console.log(err);
               }
            else
               {
                   console.log("success");
               }
           }
         );

}

function queryDatabase() { 
    
    console.log('Reading rows from the Table...');

       // Read all rows from table
     request = new Request(
          "SELECT TOP 30 s.score, s.userNo, u.userFirstName, u.userLastName,s.dateRecorded FROM ScoreRecord s JOIN userInfo u ON s.userNo = u.userNo ORDER BY s.score DESC;",
             function(err, rowCount, rows) 
                {
                    console.log(rowCount + ' row(s) returned');
                    process.exit();
                }
            );

     request.on('row', function(columns) {
        columns.forEach(function(column) {
            console.log("%s\t%s", column.metadata.colName, column.value);
         });
             });
     connection.execSql(request);
   }

function printRow() {
    //Print one row in the MS SQL Table 
}

function OpenPauseMenu(){
	//pm
}

function ClosePauseMenu(){
	//pm
}

const startLives = 10;
const startMoney = 10000;
//const startLives = 100;
//const startMoney = 250;
const sellRate = .25;

function StartGame(){
	Destroy(mmLogo);
	Destroy(mmPlay);
	Destroy(mmLBoards);

	// TODO: Loading bar

	wave = 0;
	wavePos = 0;
	elapsed = 0;

	gridSize = 18;
	unit = app.renderer.width / gridSize;
	foodScale = unit / 10 / 2;

	hudStyle = new PIXI.TextStyle({fontFamily:'Arial', fontSize:11});
	hudStyle = new PIXI.TextStyle({fontFamily:'Lucida Console', fontSize:18, fill:["#FFFFFF"]});
	towers = new Array();
	food = new Array();
	lives = startLives;
	score = 0;
	money = startMoney;
	xp = 0;
	targetXP = 1000;
	wave = 0;
	wantToPlace = "";
	popups = [];

    //Prepare Easter Egg 
	var password;
    password = 0;
    
    var easterEggActive;
    easterEggActive = false;
	
    document.addEventListener('keydown', checkKeyInput);
    
    var timer;
    var moneyContents;

	// Import textures
	PIXI.loader.add("whiteBox", "../Pixi/images/WhiteBox.png")
			   .add("compost", "../Pixi/images/towerCompost.png")
			   .add("donate", "../Pixi/images/towerDonate.png")
			   .add("animals", "../Pixi/images/towerFarm.png")
			   .add("factory", "../Pixi/images/towerFuel.png")
			   .add("recycle", "../Pixi/images/towerRecycle.png")
			   .add("purify", "../Pixi/images/towerWater.png")
			   .add("garbage", "../Pixi/images/garbageBin.png")
			   .add("selectUI", "../Pixi/images/towerSelection.png")
			   .add("stage0", "../Pixi/images/townBackground.png")
			   .add("hud", "../Pixi/images/Compost_HUD.png")
			   .add("fullHP", "../Pixi/images/HPBeaker.png")
               .add("fullXP", "../Pixi/images/XPBeaker.png")
			   .add("emptyBeaker", "../Pixi/images/EmptyBeaker.png")
			   .add("barMask", "../Pixi/images/BeakerMask.png")
			   .add("foodSheet", "../Pixi/images/Food.json")
			   .add("conveyorSheet", "../Pixi/images/conveyor.json")
               .add("dollar", "../pixi/images/DollarBill.png")
			   .add("faceNormal", "../pixi/images/face_normal.png")
               .add("faceGrin", "../pixi/images/face_grin.png")
               .add("faceFail", "../pixi/images/face_fail.png")
               .add("faceC1", "../pixi/images/face_chew1.png")
               .add("faceC2", "../pixi/images/face_chew2.png")
               .add("faceSad1", "../pixi/images/face_sad1.png")
               .add("faceSad2", "../pixi/images/face_sad2.png")
               .add("faceSad3", "../pixi/images/face_sad3.png")
               .add("faceHappy1", "../pixi/images/face_happy1.png")
               .add("faceHappy2", "../pixi/images/face_happy2.png")
               .add("faceHappy3", "../pixi/images/face_happy3.png")
               .add("nextWave", "../pixi/images/nextWave.png")
			   .load(StartGame2);
}

function StartGame2(){
	stageImg = GetObj(GetSprite("stage0", 0, 0, 1, 1));
	stageImg.interactive = true;
	stageImg.buttonMode = false;
	stageImg.on('pointerdown', function(){Destroy(toPlaceIcon); toPlaceIcon = false; TogglePlacemat(false);});
	BuildPlacemat();
	//stageImg.on('touchstart', function(e){mousePos.x = e.pageX; mousePosY = e.pageY; console.log("touch! (" + mousePos.x + " " + mousePos.y + ")")}, true);

	hudBarScale = 720 / 420;

	hud = GetObj(GetSprite("hud", 0, 0, 1, 1), 0, 0, app.stage, relPos.IGNOREMARGIN);
	hudContainer = new PIXI.Container();
	app.stage.addChild(hudContainer);
    
    //Test tutorial bubble - commented out for demo
    //app.stage.addChild(tutorial01);
	
	livesText = new PIXI.Text(lives, hudStyle);
	livesText.anchor.set(.5, .5);
	livesText = GetObj(livesText, 425.5, 52.5, app.stage, relPos.IGNOREMARGIN);
	hpBar = GetObj(GetSprite("fullHP", 0, 0, hudBarScale, hudBarScale), 80 * hudBarScale, 13 * hudBarScale + 20, hudContainer, relPos.IGNOREMARGIN);
	hpMask = GetObj(GetSprite("barMask", 0, 0, hudBarScale, hudBarScale), 81 * hudBarScale, 13 * hudBarScale + 20, hudContainer, relPos.IGNOREMARGIN);
	hpBar.mask = hpMask;

	xpBar = GetObj(GetSprite("fullXP", 0, 0, hudBarScale, hudBarScale), 110 * hudBarScale, 38 * hudBarScale + 20, hudContainer, relPos.IGNOREMARGIN);
	xpMask = GetObj(GetSprite("barMask", 0, 0, 0, hudBarScale), 111 * hudBarScale, 38 * hudBarScale + 20, hudContainer, relPos.IGNOREMARGIN);
	xpBar.mask = xpMask;
    
    //Boy Genius face icon
    playerIcon = GetObj(GetSprite("faceNormal", 0, 0, hudBarScale, hudBarScale), 6 * hudBarScale, 6 * hudBarScale + 20, app.stage, relPos.IGNOREMARGIN); 

	// Assuming one level
	track = [{x:9, y:4}, {x:8, y:4}, {x:7, y:4}, {x:6, y:4}, {x:5, y:4}, {x:5, y:5}, {x:4, y:5}, {x:3, y:5}, {x:3, y:6}, {x:3, y:7}, {x:4, y:7}, {x:10, y:4}, {x:11, y:4}, {x:12, y:4}, {x:13, y:4}, {x:14, y:4}, {x:14, y:3}, {x:14, y:2}, {x:15, y:2}, {x:16, y:2}, {x:16, y:8}, {x:15, y:8}, {x:14, y:8}, {x:13, y:8}, {x:13, y:9}, {x:5, y:7}, {x:6, y:7}, {x:7, y:7}, {x:8, y:6}, {x:8, y:7}, {x:9, y:6}, {x:10, y:6}, {x:10, y:7}, {x:10, y:8}, {x:10, y:9}, {x:10, y:10}, {x:11, y:10}, {x:12, y:10}, {x:13, y:10}, {x:13, y:11}, {x:13, y:12}, {x:13, y:13}, {x:12, y:13}, {x:11, y:13}, {x:10, y:13}, {x:9, y:13}, {x:8, y:13}, {x:8, y:12}, {x:7, y:12}, {x:6, y:12}, {x:6, y:11}, {x:6, y:10}, {x:6, y:9}, {x:5, y:9}, {x:4, y:9}, {x:4, y:10}, {x:4, y:11}, {x:4, y:12}, {x:3, y:13}, {x:2, y:13}, {x:4, y:13}, {x:4, y:14}, {x:4, y:15}, {x:4, y:16}, {x:5, y:16}, {x:6, y:16}, {x:6, y:15}, {x:7, y:15}, {x:8, y:15}, {x:9, y:15}, {x:10, y:15}, {x:10, y:16}, {x:10, y:17}, {x:10, y:18}, {x:9, y:18}, {x:8, y:18}, {x:7, y:18}, {x:6, y:18}, {x:5, y:18}, {x:4, y:18}, {x:3, y:18}, {x:12, y:14}, {x:12, y:15}, {x:12, y:16}, {x:213, y:16}, {x:14, y:16}, {x:15, y:16}, {x:15, y:15}, {x:15, y:14}, {x:15, y:13}, {x:616, y:13}, {x:17, y:13}, {x:17, y:8}, {x:17, y:2}, {x:2, y:2}, {x:3, y:2}, {x:4, y:2}, {x:5, y:2}, {x:6, y:2}, {x:7, y:2}, {x:8, y:2}, {x:8, y:3}, {x:13, y:16}, {x:16, y:13}/*, {x:2, y:18}*/];
	let trackV = [{x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:0, y:1.5}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:0, y:1.5}, {x:0, y:1.5}, {x:1.5, y:0}, {x:1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:0, y:1.5}, {x:0, y:1.5}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:0, y:1.5}, {x:0, y:1.5}, {x:1.5, y:0}, {x:1.5, y:0}, {x:1.5, y:0}, {x:1.5, y:0}, {x:0, y:-1.5}, {x:1.5, y:0}, {x:0, y:1.5}, {x:0, y:1.5}, {x:0, y:1.5}, {x:0, y:1.5}, {x:1.5, y:0}, {x:1.5, y:0}, {x:1.5, y:0}, {x:0, y:1.5}, {x:0, y:1.5}, {x:0, y:1.5}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:0, y:-1.5}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:0, y:-1.5}, {x:0, y:-1.5}, {x:0, y:-1.5}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:0, y:1.5}, {x:0, y:1.5}, {x:0, y:1.5}, {x:0, y:1.5}, {x:1.5, y:0}, {x:1.5, y:0}, {x:0, y:1.5}, {x:0, y:1.5}, {x:0, y:1.5}, {x:1.5, y:0}, {x:1.5, y:0}, {x:0, y:-1.5}, {x:1.5, y:0}, {x:1.5, y:0}, {x:1.5, y:0}, {x:1.5, y:0}, {x:0, y:1.5}, {x:0, y:1.5}, {x:0, y:1.5}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:0, y:-1.5}, {x:0, y:-1.5}, {x:0, y:-1.5}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:0, y:1.5}, {x:0, y:1.5}, {x:-1.5, y:0}, {x:0, y:1.5}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:-1.5, y:0}, {x:1.5, y:0}, {x:1.5, y:0}, {x:1.5, y:0}, {x:1.5, y:0}, {x:1.5, y:0}, {x:1.5, y:0}, {x:0, y:1.5}, {x:0, y:1.5}, {x:-1.5, y:0}, {x:-1.5, y:0}, /*{x:-1.5, y:0}*/];
	
	let trackAnim = [];

	for(let i = 0; i < 27; i++){
		trackAnim.push(PIXI.Texture.fromFrame(i + ".png"));
	}

	waitingForNextWave = false;

	for(let i = 0; i < track.length; i++){
		let x = track[i].x;
		let y = track[i].y;
		track[i] = new PIXI.extras.AnimatedSprite(trackAnim);
		//track[i] = GetObj(GetSprite("whiteBox", 0, 0, unit, unit, 0x999999), (track[i].x - 1) * unit, (track[i].y - 1) * unit);
		track[i].anchor.set(.5, .5);
		track[i].scale.set(unit / 16, unit / 16);
		track[i] = GetObj(track[i], (x - .5) * unit, (y - .5) * unit);
		track[i].type = "track";
		track[i].interactive = true;
		track[i].animationSpeed = .33;
		track[i].play();
		
		if(i < trackV.length){
			track[i].vx = trackV[i].x;
			track[i].vy = trackV[i].y;

			track[i].rotation = track[i].vx > 0 ? 0 : track[i].vx < 0 ? Math.PI : track[i].vy > 0 ? Math.PI / 2 : -Math.PI / 2;
		}
	}

	garbage = GetObj(GetSprite("garbage", .5, .5, 1.25, 1.25, 0x555555), 1.5 * unit, 17.5 * unit);

	/* Proto */ fpsText = GetObj(new PIXI.Text("", hudStyle), 10, 10, app.stage, relPos.IGNOREMARGIN);
	//livesText = GetObj(new PIXI.Text("Lives: " + lives, hudStyle), 10, 25, app.stage, relPos.IGNOREMARGIN);
	moneyText = GetObj(new PIXI.Text(money, hudStyle), 535, 88, app.stage, relPos.IGNOREMARGIN);
	moneyText.anchor.set(.5, .5);
	scoreText = GetObj(new PIXI.Text(score, hudStyle), 659, 88, app.stage, relPos.IGNOREMARGIN);
	scoreText.anchor.set(.5, .5);
	
	sidebarUnit = 720 / 8;

	sidebarUI = GetObj(GetSprite("selectUI", .5, .5, 1, 1), app.renderer.width / 2, uiMargin / 2, app.stage, relPos.SIDEBAR);
	sidebarUI.rotation = Math.PI / 2;

	compostB = GetObj(GetSprite("compost", .5, .5, 1.25, 1.25), sidebarUnit * 1.05, uiMargin / 2, app.stage, relPos.SIDEBAR);
	compostB.interactive = true;
	compostB.buttonMode = true;
	compostB.on('pointerdown', function(){wantToPlace = towerTypes.COMPOST; GetPlaceIcon();})
			.on('pointerover', function(){compostB.scale.x *= 1.2; compostB.scale.y *= 1.2;})
			.on('pointerout', function(){compostB.scale.x /= 1.2; compostB.scale.y /= 1.2;});
	
	compostText = GetObj(new PIXI.Text("Compost: $250", hudStyle), compostB.x, compostB.y + unit, app.stage, relPos.IGNOREMARGIN);
	compostText.anchor.set(.5, .5);

	donateB = GetObj(GetSprite("donate", .5, .5, 1.25, 1.25), sidebarUnit * 2.23, uiMargin / 2, app.stage, relPos.SIDEBAR);
	donateB.interactive = true;
	donateB.buttonMode = true;
	donateB.on('pointerdown', function(){wantToPlace = towerTypes.DONATION; GetPlaceIcon();})
			.on('pointerover', function(){donateB.scale.x *= 1.2; donateB.scale.y *= 1.2;})
			.on('pointerout', function(){donateB.scale.x /= 1.2; donateB.scale.y /= 1.2;});
	
	donateText = GetObj(new PIXI.Text("Donate: $400", hudStyle), donateB.x, donateB.y - unit, app.stage, relPos.IGNOREMARGIN);
	donateText.anchor.set(.5, .5);

	recycleB = GetObj(GetSprite("recycle", .5, .5, 1.25, 1.25), sidebarUnit * 3.41, uiMargin / 2, app.stage, relPos.SIDEBAR);
	recycleB.interactive = true;
	recycleB.buttonMode = true;
	recycleB.on('pointerdown', function(){wantToPlace = towerTypes.RECYCLE; GetPlaceIcon();})
			.on('pointerover', function(){recycleB.scale.x *= 1.2; recycleB.scale.y *= 1.2;})
			.on('pointerout', function(){recycleB.scale.x /= 1.2; recycleB.scale.y /= 1.2;});
	
	recycleText = GetObj(new PIXI.Text("Recycle: $650", hudStyle), recycleB.x, recycleB.y + unit, app.stage, relPos.IGNOREMARGIN);
	recycleText.anchor.set(.5, .5);

	animalsB = GetObj(GetSprite("animals", .5, .5, 1.25, 1.25), sidebarUnit * 4.59, uiMargin / 2, app.stage, relPos.SIDEBAR);
	animalsB.interactive = true;
	animalsB.buttonMode = true;
	animalsB.on('pointerdown', function(){wantToPlace = towerTypes.ANIMALS; GetPlaceIcon();})
			.on('pointerover', function(){animalsB.scale.x *= 1.2; animalsB.scale.y *= 1.2;})
			.on('pointerout', function(){animalsB.scale.x /= 1.2; animalsB.scale.y /= 1.2;});
	
	animalsText = GetObj(new PIXI.Text("Feed: $770", hudStyle), animalsB.x, animalsB.y - unit, app.stage, relPos.IGNOREMARGIN);
	animalsText.anchor.set(.5, .5);

	purifierB = GetObj(GetSprite("purify", .5, .5, 1.25, 1.25), sidebarUnit * 5.77, uiMargin / 2, app.stage, relPos.SIDEBAR);
	purifierB.interactive = true;
	purifierB.buttonMode = true;
	purifierB.on('pointerdown', function(){wantToPlace = towerTypes.PURIFIER; GetPlaceIcon();})
			 .on('pointerover', function(){purifierB.scale.x *= 1.2; purifierB.scale.y *= 1.2;})
			 .on('pointerout', function(){purifierB.scale.x /= 1.2; purifierB.scale.y /= 1.2;});
	
	purifierText = GetObj(new PIXI.Text("Purify: $900", hudStyle), purifierB.x, purifierB.y + unit, app.stage, relPos.IGNOREMARGIN);
	purifierText.anchor.set(.5, .5);

	factoryB = GetObj(GetSprite("factory", .5, .5, .9, .9), sidebarUnit * 6.95, uiMargin / 2, app.stage, relPos.SIDEBAR);
	factoryB.interactive = true;
	factoryB.buttonMode = true;
	factoryB.on('pointerdown', function(){wantToPlace = towerTypes.FACTORY; GetPlaceIcon();})
			.on('pointerover', function(){factoryB.scale.x *= 1.2; factoryB.scale.y *= 1.2;})
			.on('pointerout', function(){factoryB.scale.x /= 1.2; factoryB.scale.y /= 1.2;});
	
	factoryText = GetObj(new PIXI.Text("Process: $1200", hudStyle), factoryB.x, factoryB.y - unit, app.stage, relPos.IGNOREMARGIN);
	factoryText.anchor.set(.5, .5);

	wantToPlace = "";
	toPlaceIcon = false;

	foodContainer = new PIXI.particles.ParticleContainer(10000, {scale:true, position:true, rotation:true, uvs:false, alpha:false});
	app.stage.addChild(foodContainer);

	app.ticker.add(delta => Update(delta)); // Defines the function that gets called every frame
}

function GetPlaceIcon(){
	Destroy(toPlaceIcon);
	toPlaceIcon = false;

	if(wantToPlace == towerTypes.COMPOST){ // Cheap & takes in anything but liquids, but is slow & doesn't make much
		toPlaceIcon = GetObj(GetSprite("compost", .5, .5, 1.25, 1.25), mousePos.x, mousePos.y, app.stage, relPos.IGNOREMARGIN);
	}else if(wantToPlace == towerTypes.ANIMALS){ // Ravenously devours meat
		toPlaceIcon = GetObj(GetSprite("animals", .5, .5, 1.25, 1.25), mousePos.x, mousePos.y, app.stage, relPos.IGNOREMARGIN);
	}else if(wantToPlace == towerTypes.FACTORY){ // A mass-processing machine that accepts anything but meat, only processing a few at a time. Isn't very profitable
		toPlaceIcon = GetObj(GetSprite("factory", .55, .55, .9, .9), mousePos.x, mousePos.y, app.stage, relPos.IGNOREMARGIN);
	}else if(wantToPlace == towerTypes.DONATION){ // More expensive & picky than composting, but is faster & worth more
		toPlaceIcon = GetObj(GetSprite("donate", .5, .5, 1.25, 1.25), mousePos.x, mousePos.y, app.stage, relPos.IGNOREMARGIN);
	}else if(wantToPlace == towerTypes.RECYCLE){
		toPlaceIcon = GetObj(GetSprite("recycle", .5, .5, 1.25, 1.25), mousePos.x, mousePos.y, app.stage, relPos.IGNOREMARGIN);
	}else if(wantToPlace == towerTypes.PURIFIER){
		toPlaceIcon = GetObj(GetSprite("purify", .5, .5, 1.25, 1.25), mousePos.x, mousePos.y, app.stage, relPos.IGNOREMARGIN);
	}

	toPlaceIcon.alpha = .75;
	TogglePlacemat(true);
}

const foodProcessDist = 4 * 4;
const foodTransferSpeed = 2.5;

const popupSpeed = -1;
const popupDuration = .4;

function Update(delta){ // Note: Runs at/up to 60fps. Any real-world changes across multiple frames (ie: movement / rotation) should be multiplied by delta to scale properly w/ low FPS
	elapsed += secondsPerFrame * delta;
    mousePos = app.renderer.plugins.interaction.mouse.global;

	for(let i = popups.length - 1; i >= 0; i--){
		if(popups[i].elapsed >= popupDuration){
			Destroy(popups[i]);
			popups.splice(i, 1);
		}else{
			popups[i].elapsed += secondsPerFrame * delta;
			popups[i].y += popupSpeed * delta;
		}
	}

	if(toPlaceIcon != false){
		toPlaceIcon.x = mousePos.x;
		toPlaceIcon.y = mousePos.y;
	}
	
	if(lives > 0){ // time:0, type:foodTypes.FRUIT, startRate:80, endRate:60, length:60
		for(let i = inProgress.length - 1; i >= 0; i--){
			if(inProgress[i].time + inProgress[i].length < elapsed){
				inProgress.splice(i, 1);

				waitingForNextWave = true;

				nextWaveB = GetObj(GetSprite("nextWave", 1, 1, 1, 1), unit * 18, unit * 18, app.stage, relPos.USEMARGIN);
				nextWaveB.interactive = true;
				nextWaveB.buttonMode = true;
				nextWaveB.on('pointerdown', function(){
							waitingForNextWave = false;
							Destroy(this);
						})
					 .on('pointerover', function(){this.scale.set(1.1, 1.1);})
					 .on('pointerout', function(){this.scale.set(1 / 1.1, 1 / 1.1);});
			}else{
				if(inProgress[i].next < elapsed){
					GetFood(inProgress[i].type, 16.5 * unit, (1.3 + Math.random() * .6) * unit); // TODO: Implement different "from"'s
	
					inProgress[i].next = elapsed + Lerp(inProgress[i].startRate, inProgress[i].endRate, (elapsed - inProgress[i].time) / inProgress[i].length);
				}
			}
		}

		if(wave < waves.length){
			if(wavePos < waves[wave].length){
				if(waves[wave][wavePos].time <= elapsed){
					inProgress.push(waves[wave][wavePos]);
					inProgress[inProgress.length - 1].next = 0;

					wavePos++;
					elapsed = 0;
				}
			}else if(inProgress.length == 0 && !waitingForNextWave){
				//Player happy when new wave starts
				playerIcon = GetObj(GetSprite("faceHappy3", 0, 0, hudBarScale, hudBarScale), 6 * hudBarScale, 6 * hudBarScale + 20, app.stage, relPos.IGNOREMARGIN);
				
				wave++;
				wavePos = 0;
			}
		}else{
			// TODO: Infinite waves
		}
		
		// TODO: Properly centre food along tracks
		for(let i = 0, j = 0, maxDistSqrd = unit * unit / 1.75; i < food.length; i++){
			if(food[i].towerTarget === false){
				if(Math.pow(garbage.x - food[i].x, 2) + Math.pow(garbage.y - food[i].y, 2) <= maxDistSqrd){ // Destroy if near garbage can
					Destroy(food[i]);
					food.splice(i, 1);
					AdjustLives(-1);
					GetPopup("-1", garbage.x, garbage.y - unit * 3 / 4, 1, 1, 0xFF0000);
				}else{
					for(j = 0; j < track.length; j++){
						if(Math.pow(track[j].x - food[i].x, 2) + Math.pow(track[j].y - food[i].y, 2) <= maxDistSqrd){ // Move if near track
							food[i].x += track[j].vx * delta * 2;
							food[i].y += track[j].vy * delta * 2;
						}
					}
				}	
			}else if(Math.pow(food[i].towerTarget.x - food[i].x, 2) + Math.pow(food[i].towerTarget.y - food[i].y, 2) <= foodProcessDist){
				Destroy(food[i]);
				food.splice(i, 1);
			}else{
				food[i].x += (food[i].towerTarget.x - food[i].x > 0 ? 1 : -1) * foodTransferSpeed * delta;
				food[i].y += (food[i].towerTarget.y - food[i].y > 0 ? 1 : -1) * foodTransferSpeed * delta;
			}
		}
		
		let total;
		let currProgress;

		for(let j = 0, i = 0, l = 0, maxDistSqrd = unit * unit * 2.5; j < towers.length; j++){
			total = 0;
			currProgress = 0;
	
			for(i = 0; i < towers[j].curr.length; i++){ // Increments counters of currently-being-processed food
				for(l = towers[j].curr[i].length - 1; l >= 0; l--){
					towers[j].curr[i][l] += delta;
	
					if(towers[j].curr[i][l] > towers[j].processTime){ // Removes finished food
						towers[j].curr[i].splice(l, 1);
						towers[j].finished[i]++;
						towers[j].currCount--;
					}else{
						currProgress += towers[j].curr[i][l];
					}
				}
	
				if(towers[j].finished[i] == towers[j].max[i]){
					total++;
					towers[j].curr[i] = [];
				}
			}
			
			if(total == towers[j].max.length){ // Increases score if tower is finished, and clears it
				for(i = 0; i < towers[j].max.length; i++){
					towers[j].curr[i] = [];
					towers[j].finished[i] = 0;
				}
				
				AdjustScore(towers[j].value);
				GetPopup("+" + towers[j].value, towers[j].x, towers[j].y - unit * 3 / 4, 1, 1, 0x00FF00);
			}

			towers[j].finish.scale.x = (towers[j].finished.reduce(function(total, num){return total + num;}) * towers[j].processTime) / towers[j].totalProcess * unit;
			towers[j].progress.scale.x = currProgress / towers[j].totalProcess * unit;
			towers[j].progress.x = towers[j].finish.x + towers[j].finish.scale.x;
			
			// TODO: Display currently-being-processed foods
			
			if(towers[j].ready < 3){
				towers[j].ready++;
			}else{ // Checks if any applicable foods are in range, and if so, begins processing them
				for(i = 0; i < food.length && towers[j].ready == 3; i++){
					if(food[i].towerTarget === false){
						let l = towers[j].allow.findIndex(function(element){
							return element == foodTypes.ANY || food[i].type == element || food[i].subType == element;
						});
		
						if(towers[j].ignore.includes(food[i].type) || towers[j].ignore.includes(food[i].subType)){
							l = -1;
						}else{
							l = Math.min(l, towers[j].max.length - 1);
						}
	
						if(l != -1 && towers[j].finished[l] + towers[j].curr[l].length < towers[j].max[l] && towers[j].currCount < towers[j].atOnce && Math.pow(towers[j].x - food[i].x, 2) + Math.pow(towers[j].y - food[i].y, 2) <= maxDistSqrd){
							towers[j].curr[l].push(0);
							food[i].towerTarget = {x:towers[j].x, y:towers[j].y};
							towers[j].currCount++;
							towers[j].ready = 0;
						}
					}
				}
			}
		}
	}
    
    
    
    if(typeof timer == 'number'){
            
    		if(timer >= 0){
			timer--; 
               			    for (var x = 0; x <= 100; x++) {
         for (var y = 0; y <= 30; y++) {            
              moneyContents[x][y].rotation += 0.05 * delta;
              moneyContents[x][y].y += 3.2;

                }
    } 
		}
				if(timer <= 0){

			    for (var x = 0; x <= 100; x++) {
                //moneyContents[x] =  new Array();
        for (var y = 0; y <= 30; y++) {
            Destroy(moneyContents[x][y]);          
	          
    }
    } 
            timer = "Done";
            //delete moneyContents;
		}
    }
}

function PlaceTower(){
	Destroy(toPlaceIcon);
	toPlaceIcon = false;
	TogglePlacemat();

	if(lives > 0){
		var tower = false;
		let x = this.x;
		let y = this.y;

		if(wantToPlace == towerTypes.COMPOST){ // Cheap & takes in anything but liquids, but is slow & doesn't make much
			if(Buy(250)){
				tower = GetObj(GetSprite("compost", .5, .5, 1.25, 1.25), x, y, app.stage, relPos.IGNOREMARGIN);
				tower.allow = [foodTypes.ANY];
				tower.ignore = [foodTypes.LIQUID];
				tower.max = [5]; // If just one entry, then all entries in .allow will contribute towards the same max count, otherwise, individual maxes will be used
				tower.finished = [0]; // MUST contain a 0 for every entry in .max[]
				tower.curr = [[]]; // MUST contain an empty array for every entry in .max[]
				tower.atOnce = 5; // Amount of concurrent users
				tower.processTime = 360; // Frames required to process one food item
				tower.value = 80; // Amount of score and money gained when all maxes have been met
				tower.cost = 250;
			}
		}else if(wantToPlace == towerTypes.ANIMALS){ // Consume meat & bread at a high rate
			if(Buy(770)){
				tower = GetObj(GetSprite("animals", .5, .5, 1.25, 1.25), x, y, app.stage, relPos.IGNOREMARGIN);
				tower.allow = [foodTypes.MEAT, foodTypes.BREAD];
				tower.ignore = [];
				tower.max = [4]; // If just one entry, then all entries in .allow will contribute towards the same max count, otherwise, individual maxes will be used
				tower.finished = [0]; // MUST contain a 0 for every entry in .max[]
				tower.curr = [[]]; // MUST contain an empty array for every entry in .max[]
				tower.atOnce = 4; // Amount of concurrent users
				tower.processTime = 80; // Frames required to process one food item
				tower.value = 100; // Amount of score and money gained when all maxes have been met
				tower.cost = 770;
			}
		}else if(wantToPlace == towerTypes.FACTORY){ // A mass-processing machine that accepts anything but meat, only processing a few at a time. Isn't very profitable
			if(Buy(1200)){
				tower = GetObj(GetSprite("factory", .55, .55, .9, .9), x, y, app.stage, relPos.IGNOREMARGIN);
				tower.allow = [foodTypes.FRUIT, foodTypes.VEGETABLE, foodTypes.BONE, foodTypes.OIL];
				tower.ignore = [];
				tower.max = [30]; // If just one entry, then all entries in .allow will contribute towards the same max count, otherwise, individual maxes will be used
				tower.finished = [0]; // MUST contain a 0 for every entry in .max[]
				tower.curr = [[]]; // MUST contain an empty array for every entry in .max[]
				tower.atOnce = 2; // Amount of concurrent users
				tower.processTime = 30; // Frames required to process one food item
				tower.value = 250; // Amount of score and money gained when all maxes have been met
				tower.cost = 1200;
			}
		}else if(wantToPlace == towerTypes.DONATION){ // More expensive & picky than composting, but is faster & worth more
			if(Buy(400)){
				tower = GetObj(GetSprite("donate", .5, .5, 1.25, 1.25), x, y, app.stage, relPos.IGNOREMARGIN);
				tower.allow = [foodTypes.FRUIT, foodTypes.VEGETABLE];
				tower.ignore = [];
				tower.max = [2]; // If just one entry, then all entries in .allow will contribute towards the same max count, otherwise, individual maxes will be used
				tower.finished = [0]; // MUST contain a 0 for every entry in .max[]
				tower.curr = [[]]; // MUST contain an empty array for every entry in .max[]
				tower.atOnce = 1; // Amount of concurrent users
				tower.processTime = 45; // Frames required to process one food item
				tower.value = 60; // Amount of score and money gained when all maxes have been met
				tower.cost = 400;
			}
		}else if(wantToPlace == towerTypes.RECYCLE){
			if(Buy(650)){
				tower = GetObj(GetSprite("recycle", .5, .5, 1.25, 1.25), x, y, app.stage, relPos.IGNOREMARGIN);
				tower.allow = [foodTypes.FRUIT, foodTypes.VEGETABLE, foodTypes.BREAD, foodTypes.WATER];
				tower.ignore = [];
				tower.max = [5]; // If just one entry, then all entries in .allow will contribute towards the same max count, otherwise, individual maxes will be used
				tower.finished = [0]; // MUST contain a 0 for every entry in .max[]
				tower.curr = [[]]; // MUST contain an empty array for every entry in .max[]
				tower.atOnce = 1; // Amount of concurrent users
				tower.processTime = 60; // Frames required to process one food item
				tower.value = 175; // Amount of score and money gained when all maxes have been met
				tower.cost = 650;
			}
		}else if(wantToPlace == towerTypes.PURIFIER){
			if(Buy(900)){
				tower = GetObj(GetSprite("purify", .5, .5, 1.25, 1.25), x, y, app.stage, relPos.IGNOREMARGIN);
				tower.allow = [foodTypes.WATER];
				tower.ignore = [];
				tower.max = [20]; // If just one entry, then all entries in .allow will contribute towards the same max count, otherwise, individual maxes will be used
				tower.finished = [0]; // MUST contain a 0 for every entry in .max[]
				tower.curr = [[]]; // MUST contain an empty array for every entry in .max[]
				tower.atOnce = 1; // Amount of concurrent users
				tower.processTime = 20; // Frames required to process one food item
				tower.value = 225; // Amount of score and money gained when all maxes have been met
				tower.cost = 900;
			}
		}

		if(tower != false){
			GetPopup("-" + tower.cost, tower.x, tower.y - unit * 3 / 4, 1, 1, 0xFF0000);

			tower.type = wantToPlace;
			tower.currCount = 0;
			console.log("Tower placed at " + tower.x + " " + tower.y);
			tower.totalProcess = tower.max.reduce(function(total, num){return total + num;}) * tower.processTime;
			tower.finish = GetObj(GetSprite("whiteBox", 0, 1, unit, 5, 0x00FF00), tower.x - unit / 2, tower.y + unit / 2 - 1, app.stage, relPos.IGNOREMARGIN);
			tower.progress = GetObj(GetSprite("whiteBox", 0, 1, unit, 5, 0xFF0000), tower.x - unit / 2, tower.y + unit / 2 - 1, app.stage, relPos.IGNOREMARGIN);
			tower.ready = 3;
			tower.interactive = true;
			tower.buttonMode = true;
			tower.on('pointerdown', function(){
						towers.splice(towers.indexOf(this), 1);
						AdjustMoney(Math.ceil(this.cost * sellRate));
						GetPopup("+" + Math.ceil(this.cost * sellRate), this.x, this.y - unit * 3 / 4, 1, 1, 0x00FF00);

						Destroy(this.finish);
						Destroy(this.progress);
						Destroy(this);
					})
				 .on('pointerover', function(){tower.tint = 0xFF9999})
				 .on('pointerout', function(){tower.tint = 0xFFFFFF});

			towers.push(tower);
		}
	}
}

function Buy(cost){
	if(money < cost){
		console.log("PLAYER CANNOT AFFORD $" + cost);

		return false;
	}else{
		money -= cost;
		moneyText.text = money;

		return true;
	}
}

function BuildPlacemat(){ // Helps laying spaces
	const pos = [{x:460, y:220}, {x:420, y:220}, {x:380, y:220}, {x:500, y:220}, {x:500, y:180}, {x:540, y:140}, {x:580, y:140}, {x:620, y:140}, {x:620, y:220}, {x:580, y:220}, {x:500, y:140}, {x:580, y:260}, {x:580, y:300}, {x:540, y:300}, {x:500, y:300}, {x:460, y:300}, {x:420, y:300}, {x:380, y:300}, {x:340, y:300}, {x:340, y:220}, {x:340, y:180}, {x:340, y:140}, {x:300, y:140}, {x:220, y:140}, {x:260, y:140}, {x:100, y:140}, {x:140, y:140}, {x:180, y:140}, {x:100, y:220}, {x:140, y:220}, {x:180, y:220}, {x:220, y:220}, {x:260, y:220}, {x:300, y:300}, {x:260, y:300}, {x:220, y:300}, {x:220, y:340}, {x:260, y:340}, {x:180, y:340}, {x:140, y:340}, {x:140, y:260}, {x:100, y:260}, {x:60, y:260}, {x:60, y:300}, {x:60, y:340}, {x:60, y:380}, {x:60, y:420}, {x:100, y:420}, {x:140, y:420}, {x:180, y:420}, {x:220, y:420}, {x:260, y:420}, {x:300, y:420}, {x:340, y:420}, {x:340, y:380}, {x:420, y:340}, {x:420, y:380}, {x:420, y:420}, {x:420, y:460}, {x:460, y:460}, {x:460, y:420}, {x:460, y:380}, {x:500, y:380}, {x:540, y:380}, {x:580, y:380}, {x:620, y:380}, {x:620, y:460}, {x:580, y:460}, {x:540, y:460}, {x:540, y:500}, {x:540, y:540}, {x:540, y:580}, {x:540, y:620}, {x:540, y:660}, {x:580, y:580}, {x:620, y:580}, {x:620, y:660}, {x:620, y:700}, {x:620, y:740}, {x:580, y:780}, {x:540, y:780}, {x:500, y:780}, {x:460, y:780}, {x:500, y:700}, {x:540, y:700}, {x:500, y:660}, {x:460, y:540}, {x:420, y:540}, {x:380, y:540}, {x:340, y:540}, {x:340, y:500}, {x:340, y:460}, {x:260, y:460}, {x:260, y:500}, {x:260, y:540}, {x:300, y:540}, {x:180, y:500}, {x:180, y:540}, {x:180, y:580}, {x:180, y:620}, {x:220, y:620}, {x:260, y:620}, {x:180, y:660}, {x:220, y:660}, {x:260, y:660}, {x:180, y:700}, {x:300, y:660}, {x:340, y:660}, {x:380, y:660}, {x:420, y:660}, {x:420, y:580}, {x:380, y:580}, {x:340, y:580}, {x:420, y:700}, {x:420, y:740}, {x:420, y:780}, {x:420, y:820}, {x:340, y:780}, {x:340, y:740}, {x:300, y:740}, {x:260, y:740}, {x:260, y:780}, {x:300, y:780}, {x:220, y:780}, {x:180, y:780}, {x:140, y:780}, {x:100, y:780}, {x:100, y:740}, {x:100, y:700}, {x:100, y:660}, {x:100, y:580}, {x:100, y:500}, {x:100, y:540}, {x:100, y:460}];

	placemat = [];

	for(let i = 0; i < pos.length; i++){
		let space = GetObj(GetSprite("whiteBox", .5, .5, unit * .8, unit * .8, 0xFF0000), pos[i].x, pos[i].y, app.stage, relPos.IGNOREMARGIN);
		space.alpha = .666 / 2;
		space.interactive = true;
		space.buttonMode = true;
		space.on("pointerdown", PlaceTower);
		placemat.push(space);
	}

	TogglePlacemat();
}

function TogglePlacemat(){
	if(placemat[0].alpha < .2 || forceOn){
		for(let i = 0; i < placemat.length; i++){
			placemat[i].alpha = .666 / 2;
			placemat[i].interactive = true;
			placemat[i].buttonMode = true;
		}
	}else{
		for(let i = 0; i < placemat.length; i++){
			placemat[i].alpha = 0;
			placemat[i].interactive = false;
			placemat[i].buttonMode = false;
		}
	}
}

function TogglePlacemat(forceTo){
	if(forceTo){
		for(let i = 0; i < placemat.length; i++){
			placemat[i].alpha = .666 / 2;
			placemat[i].interactive = true;
			placemat[i].buttonMode = true;
		}
	}else{
		for(let i = 0; i < placemat.length; i++){
			placemat[i].alpha = 0;
			placemat[i].interactive = false;
			placemat[i].buttonMode = false;
		}
	}
}

function AdjustScore(increaseBy){
	
        playerIcon = GetObj(GetSprite("faceHappy1", 0, 0, hudBarScale, hudBarScale), 6 * hudBarScale, 6 * hudBarScale + 20, app.stage, relPos.IGNOREMARGIN);
    
    score += increaseBy;
	scoreText.text = score;
	money += increaseBy;
	moneyText.text = money;

	xp += increaseBy;
    
    //Show chewing face when XP increases to certain values.
    
    if(xp >= targetXP / 2) {
        
        playerIcon = GetObj(GetSprite("faceC1", 0, 0, hudBarScale, hudBarScale), 6 * hudBarScale, 6 * hudBarScale + 20, app.stage, relPos.IGNOREMARGIN);
        
    }

	if(xp >= targetXP){
		
                playerIcon = GetObj(GetSprite("faceHappy2", 0, 0, hudBarScale, hudBarScale), 6 * hudBarScale, 6 * hudBarScale + 20, app.stage, relPos.IGNOREMARGIN);
        
        xp = 0;

		switch(targetXP){
			case(1000):
				targetXP = 4000;
			break;
		}
	}else{
		xpMask.scale.x = Math.max(0, hudBarScale * (xp / targetXP));
	}
}

function AdjustLives(increaseBy){
	lives += increaseBy;
	livesText.text = lives;

	hpMask.scale.x = Math.max(0, hudBarScale * (lives / startLives));

    if (lives >= 4) {
        playerIcon = GetObj(GetSprite("faceSad1", 0, 0, hudBarScale, hudBarScale), 6 * hudBarScale, 6 * hudBarScale + 20, app.stage, relPos.IGNOREMARGIN);
    }
        if (lives < 4) {
        playerIcon = GetObj(GetSprite("faceSad2", 0, 0, hudBarScale, hudBarScale), 6 * hudBarScale, 6 * hudBarScale + 20, app.stage, relPos.IGNOREMARGIN);
    }
        if (lives < 2) {
        playerIcon = GetObj(GetSprite("faceSad3", 0, 0, hudBarScale, hudBarScale), 6 * hudBarScale, 6 * hudBarScale + 20, app.stage, relPos.IGNOREMARGIN);
    }
    
	if (lives <= 0) {
        
        playerIcon = GetObj(GetSprite("faceFail", 0, 0, hudBarScale, hudBarScale), 6 * hudBarScale, 6 * hudBarScale + 20, app.stage, relPos.IGNOREMARGIN); 
        
        var gameOverText = new PIXI.Text('Game Over!', {
			fontWeight: 'bold',
			fontSize: 60,
			fontFamily: 'Arial',
			fill: '#CD0000',
			align: 'center',
			stroke: '#FFFFFF',
			strokeThickness: 6
		});
    
        var scored = new PIXI.Text('You Scored: ' + score + '!\n Share Your Record On Facebook!', {
			fontWeight: 'bold',
			fontSize: 30,
			fontFamily: 'Arial',
			fill: '#CD0000',
			align: 'center',
			stroke: '#FFFFFF',
			strokeThickness: 6
		});
        
        var textureButton = PIXI.Texture.fromImage("./images/face.png");
        
        var shareButton = new PIXI.Sprite(textureButton);
        shareButton.buttonMode = true;
        shareButton.anchor.set(0.5);
        shareButton.x = app.screen.width / 2 -100;
        shareButton.y = app.screen.height / 2 + 250;
        shareButton.interactive = true;
        shareButton.buttonMode = true;

		
   		gameOverText.anchor.set(0.5);
		gameOverText.x = app.screen.width / 2;
		gameOverText.y = app.screen.height / 2;
		scored.anchor.set(0.5);
		scored.x = app.screen.width / 2;
		scored.y = app.screen.height / 2 + 100;
        
        app.stage.addChild(shareButton);
		app.stage.addChild(gameOverText);
		app.stage.addChild(scored);
		app.ticker.remove(Update);
    }
}

function onButtonDown() {
    this.isdown = true;
}

function onButtonUp() {
    this.isdown = false;
    if (this.isOver) {
        //this.texture = textureButtonOver;
    }
    else {
        //this.texture = textureButton;
    }
}

function onButtonOver() {
    this.isOver = true;
    if (this.isdown) {
        return;
    }
    //this.texture = textureButtonOver;
}

function onButtonOut() {
    this.isOver = false;
    if (this.isdown) {
        //return;
    }
   // this.texture = textureButton;
}


function GetSprite(name, anchorX = 0, anchorY = 0, scaleX = 1, scaleY = 1, tint = 0xFFFFFF){
	let sprite = new PIXI.Sprite(PIXI.loader.resources[name].texture);
	sprite.anchor.set(anchorX, anchorY);
	sprite.scale.set(scaleX, scaleY);
	sprite.tint = tint;
	sprite.interactiveChildren = false;
	
	return sprite;
}

function GetObj(obj, posX = 0, posY = 0, parent = app.stage, ignoreUIMargin = relPos.USEMARGIN){
	obj.x = posX;
	obj.y = ignoreUIMargin == relPos.IGNOREMARGIN ? posY : ignoreUIMargin == relPos.SIDEBAR ? app.renderer.height - uiMargin + posY : posY + uiMargin;
	parent.addChild(obj);
	
	return obj;
}

function GetPopup(text, posX, posY, scaleX = 1, scaleY = 1, tint = 0xFFFFFF){
	let popup = GetObj(new PIXI.Text(text, hudStyle), posX, posY, app.stage, relPos.IGNOREMARGIN);
	popup.scale.set(scaleX, scaleY);
	popup.elapsed = 0;
	popup.anchor.set(.5, .5);
	popup.tint = tint;

	popups.push(popup);
}

var foodAnchor = .5;

function setScore() {
	document.getElementById("scoreForm1").value = getScore();
	document.getElementById("scoreForm2").value = getScore();
}

function GetFood(subType, posX, posY){
	let obj;
	let type;
	//let obj = GetObj(GetSprite(foodNames[subType], .5, .5, foodScale, foodScale), posX, posY, foodContainer);

	const majorTypes = [foodTypes.ANY, foodTypes.FRUIT, foodTypes.VEGETABLE, foodTypes.MEAT, foodTypes.LIQUID];

	if(subType == foodTypes.BREAD){
		type = subType;
	}else if(majorTypes.includes(subType)){
		switch(subType){
			case(foodTypes.ANY):
				let val = Math.floor(Math.random() * 12);

				switch(val){
					case(0):
						subType = foodTypes.APPLE;
						type = foodTypes.FRUIT;
						break;
					case(1):
						subType = foodTypes.BANANA;
						type = foodTypes.FRUIT;
						break;
					case(2):
						subType = foodTypes.OIL;
						type = foodTypes.LIQUID;
						break;
					case(3):
						subType = foodTypes.BONE;
						type = foodTypes.MEAT;
						break;
					case(4):
						subType = foodTypes.BREAD;
						type = foodTypes.BREAD;
						break;
					case(5):
						subType = foodTypes.CABBAGE;
						type = foodTypes.VEGETABLE;
						break;
					case(6):
						subType = foodTypes.CARROT;
						type = foodTypes.VEGETABLE;
						break;
					case(7):
						subType = foodTypes.EGGPLANT;
						type = foodTypes.VEGETABLE;
						break;
					case(8):
						subType = foodTypes.ORANGE;
						type = foodTypes.FRUIT;
						break;
					case(9):
						subType = foodTypes.PORK;
						type = foodTypes.MEAT;
						break;
					case(10):
						subType = foodTypes.STEAK;
						type = foodTypes.MEAT;
						break;
					case(11):
						subType = foodTypes.WATER;
						type = foodTypes.LIQUID;
						break;
				};
			break;
			case(foodTypes.FRUIT):
				type = subType;
				subType = fruits[Math.floor(Math.random() * fruits.length)];
			break;
			case(foodTypes.VEGETABLE):
				type = subType;
				subType = vegetables[Math.floor(Math.random() * vegetables.length)];	
			break;
			case(foodTypes.MEAT):
				type = subType;
				subType = meats[Math.floor(Math.random() * meats.length)];
			break;
			case(foodTypes.LIQUID):
				type = subType;
				subType = liquids[Math.floor(Math.random() * liquids.length)];
			break;
		};
	}else{
		type = vegetables.includes(subType) ? foodTypes.VEGETABLE : fruits.includes(subType) ? foodTypes.FRUIT : meats.includes(subType) ? foodTypes.MEAT : liquids.includes(subType) ? foodTypes.LIQUID : foodTypes.BREAD;
	}

	obj = new PIXI.Sprite(PIXI.Texture.fromFrame(foodNames[subType]));
	obj.towerTarget = false;
	obj.type = type;
	obj.subType = subType;

	//obj.pivot.set(5, 5);
	obj.anchor.set(foodAnchor, foodAnchor);
	obj.rotation = Math.random() * Math.PI - Math.PI / 2;
	obj.scale.set(foodScale, foodScale);
	obj.interactiveChildren = false;

	obj.x = posX;
	obj.y = posY + uiMargin;

	foodContainer.addChild(obj);
	food.push(obj);

	return obj;
}

function Lerp(a, b, t){
	return a + t * (b - a);
}

function Destroy(obj){
	if(obj.parent != undefined) obj.parent.removeChild(obj);
}

function checkKeyInput(key) {
        if (key.keyCode === 89 && password == 4)    {
            password = 0;
            startEasterEgg();
        }
        if (key.keyCode === 69 && password == 3)    {
            password = 4;
        }
        if (key.keyCode === 78 && password == 2)    {
            password = 3;
        }
        if (key.keyCode === 79 && password == 1)    {
			password = 2;
        }
        if (key.keyCode === 77)    {
			password = 1;
        }
}

function AdjustMoney(adjustBy){
	money += adjustBy;
	moneyText.text = money;
}

function getWave(){
	return wave;
}

function getScore(){
	return score;
}

function getMoney(){
	return money;
}

function startEasterEgg() {       
	
    playerIcon = GetObj(GetSprite("faceGrin", 0, 0, hudBarScale, hudBarScale), 6 * hudBarScale, 6 * hudBarScale + 20, app.stage, relPos.IGNOREMARGIN); 
    
    moneyContents = new Array();
    
    AdjustMoney(10000);
    for (var x = 0; x <= 100; x++) {
        moneyContents[x] =  new Array();
        for (var y = 0; y <= 30; y++) {
	moneyContents[x][y] = GetObj(new PIXI.Sprite(PIXI.Texture.fromFrame("dollar")), sidebarUnit * x, y * 50 - 900, app.stage, relPos.SIDEBAR);  
	moneyContents[x][y].anchor.set(.5, .5);
	moneyContents[x][y].scale.set(1.25, 1.25);        
	//moneyContents[x][y].interactive = true; Not needed, since you don't do anything when the money is clicked
    }
    } 
    
    easterEggActive = true;
    timer = 325;
}