RMS.LoadLibrary("rmgen");

//random terrain textures
var random_terrain = randomizeBiome();

const tMainTerrain = rBiomeT1();
const tForestFloor1 = rBiomeT2();
const tForestFloor2 = rBiomeT3();
const tCliff = rBiomeT4();
const tTier1Terrain = rBiomeT5();
const tTier2Terrain = rBiomeT6();
const tTier3Terrain = rBiomeT7();
const tHill = rBiomeT8();
const tDirt = rBiomeT9();
const tRoad = rBiomeT10();
const tRoadWild = rBiomeT11();
const tTier4Terrain = rBiomeT12();
const tShoreBlend = rBiomeT13();
const tShore = rBiomeT14();
const tWater = rBiomeT15();

// gaia entities
const oTree1 = rBiomeE1();
const oTree2 = rBiomeE2();
const oTree3 = rBiomeE3();
const oTree4 = rBiomeE4();
const oTree5 = rBiomeE5();
const oFruitBush = rBiomeE6();
const oSheep = rBiomeE7();
const oMainHuntableAnimal = rBiomeE8();
const oFish = rBiomeE9();
const oSecondaryHuntableAnimal = rBiomeE10();
const oThirdHuntableAnimal = rBiomeE11();
const oStoneSmall = rBiomeE12();
const oMetalSmall = rBiomeE13();

// decorative props
const aGrass = rBiomeA1();
const aGrassShort = rBiomeA2();
const aReeds = rBiomeA3();
const aLillies = rBiomeA4();
const aRockLarge = rBiomeA5();
const aRockMedium = rBiomeA6();
const aBushMedium = rBiomeA7();
const aBushSmall = rBiomeA8();

const pForest1 = [tForestFloor2 + TERRAIN_SEPARATOR + oTree1, tForestFloor2 + TERRAIN_SEPARATOR + oTree2, tForestFloor2];
const pForest2 = [tForestFloor1 + TERRAIN_SEPARATOR + oTree4, tForestFloor1 + TERRAIN_SEPARATOR + oTree5, tForestFloor1];
const BUILDING_ANGlE = -PI/4;

log("Initializing map...");

InitMap();

const numPlayers = getNumPlayers();
const mapSize = getMapSize();
const mapArea = mapSize*mapSize;

// create tile classes

var clPlayer = createTileClass();
var clHill = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clSettlement = createTileClass();

for (var ix = 0; ix < mapSize; ix++)
{
	for (var iz = 0; iz < mapSize; iz++)
	{
		var x = ix / (mapSize + 1.0);
		var z = iz / (mapSize + 1.0);
			placeTerrain(ix, iz, tMainTerrain);
	}
}

// randomize player order
var playerIDs = [];
for (var i = 0; i < numPlayers; i++)
{
	playerIDs.push(i+1);
}
playerIDs = sortPlayers(playerIDs);

// place players
var playerX = new Array(numPlayers);
var playerZ = new Array(numPlayers);
var playerAngle = new Array(numPlayers);

var startAngle = randFloat(0, TWO_PI);
for (var i = 0; i < numPlayers; i++)
{
	playerAngle[i] = startAngle + i*TWO_PI/numPlayers;
	playerX[i] = 0.5 + 0.27*cos(playerAngle[i]);
	playerZ[i] = 0.5 + 0.27*sin(playerAngle[i]);
}

for (var i = 0; i < numPlayers; i++)
{
	var id = playerIDs[i];
	log("Creating base for player " + id + "...");
	
	// some constants
	var radius = scaleByMapSize(15,25);
	var cliffRadius = 2;
	var elevation = 20;
	
	// get the x and z in tiles
	var fx = fractionToTiles(playerX[i]);
	var fz = fractionToTiles(playerZ[i]);
	var ix = floor(fx);
	var iz = floor(fz);
	addToClass(ix, iz, clPlayer);
		
	// create starting units
	placeCivDefaultEntities(fx, fz, id, BUILDING_ANGlE);
	
	// create the city patch
	var cityRadius = radius/3;
	var placer = new ClumpPlacer(PI*cityRadius*cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new LayeredPainter([tRoadWild, tRoad], [1]);
	createArea(placer, painter, null);
	
	// create herds
		var aAngle = randFloat(0, TWO_PI);
		var aDist = 8;
		var aX = round(fx + aDist * cos(aAngle));
		var aZ = round(fz + aDist * sin(aAngle));
		var group = new SimpleGroup(
			[new SimpleObject(oSheep, 5,5, 0,2)],
			true, clBaseResource, aX, aZ
		);
		createObjectGroup(group, 0);
	
	// create berry bushes
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 12;
	var bbX = round(fx + bbDist * cos(bbAngle));
	var bbZ = round(fz + bbDist * sin(bbAngle));
	group = new SimpleGroup(
		[new SimpleObject(oFruitBush, 8,8, 0,2)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);
	
	// create metal mine
	var mAngle = bbAngle;
	while(abs(mAngle - bbAngle) < PI/3)
	{
		mAngle = randFloat(0, TWO_PI);
	}
	var mDist = 22;
	var mX = round(fx + mDist * cos(mAngle));
	var mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oMetalSmall, 1,1, 0,0)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0, avoidClasses(clBaseResource,2));
		
	// create stone mines
	var mAngle = bbAngle;
	while(abs(mAngle - bbAngle) < PI/3)
	{
		mAngle = randFloat(0, TWO_PI);
	}
	var mDist = 22;
	var mX = round(fx + mDist * cos(mAngle));
	var mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oStoneSmall, 1,1, 0,0)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0, avoidClasses(clBaseResource,2));
	var hillSize = PI * radius * radius;
	
	// create starting trees
    {if (biomeID == 6)
	{		
        var num = 2;
	    var tAngle = randFloat(0, TWO_PI);
	    var tDist = randFloat(13, 14);
	    var tX = round(fx + tDist * cos(tAngle));
	    var tZ = round(fz + tDist * sin(tAngle));
	    group = new SimpleGroup(
		[new SimpleObject(oTree1, num, num, 1,3)],
		false, clBaseResource, tX, tZ	
	);
	createObjectGroup(group, 0, avoidClasses(clBaseResource,2));
    }	
	else 
	{   
        var num = 4;
	    var tAngle = randFloat(0, TWO_PI);
	    var tDist = randFloat(13, 14);
	    var tX = round(fx + tDist * cos(tAngle));
	    var tZ = round(fz + tDist * sin(tAngle));
	    group = new SimpleGroup(
		[new SimpleObject(oTree1, num, num, 1,3)],
		false, clBaseResource, tX, tZ	
	);
	createObjectGroup(group, 0, avoidClasses(clBaseResource,2));	
	}}	

	// create hunt

		var aAngle = randFloat(0, TWO_PI);
		var aDist = 30;
		var aX = round(fx + aDist * cos(aAngle));
		var aZ = round(fz + aDist * sin(aAngle));
		var group = new SimpleGroup(
			  [new SimpleObject(oMainHuntableAnimal, 5,5, 0,2)],
			true, clFood, aX, aZ
		);
		createObjectGroup(group, 0, avoidClasses(clBaseResource,2));
}	
	// create grass tufts
	var num = hillSize / 250;
	for (var j = 0; j < num; j++)
	{
		var gAngle = randFloat(0, TWO_PI);
		var gDist = radius - (5 + randInt(7));
		var gX = round(fx + gDist * cos(gAngle));
		var gZ = round(fz + gDist * sin(gAngle));
		group = new SimpleGroup(
			[new SimpleObject(aGrassShort, 2,5, 0,1, -PI/8,PI/8)],
			false, clBaseResource, gX, gZ
		);
		createObjectGroup(group, 0);
	}

RMS.SetProgress(20);
// create bumps
createBumps(avoidClasses(clWater, 2, clPlayer, 20));

//create the hill
var fx = fractionToTiles(0.5);
var fz = fractionToTiles(0.5);
ix = round(fx);
iz = round(fz);

const lSize = sqrt(sqrt(sqrt(scaleByMapSize(1, 6))));

var placer = new ChainPlacer(2, floor(scaleByMapSize(8, 15)), floor(scaleByMapSize(10, 17)), 1, ix, iz, 0, [floor(mapSize * 0.05 * lSize)]);
var terrainPainter = new LayeredPainter(
	[tMainTerrain, tHill, tHill, tHill],		// terrains
	[1, 4, 2]		// widths
);
var elevationPainter = new SmoothElevationPainter(
	ELEVATION_SET,			// type
	12,				// elevation
	4				// blend radius
);
createArea(placer, [terrainPainter, elevationPainter, paintClass(clHill)], avoidClasses(clPlayer, 25, clBaseResource, 6));

log("Creating metal mines...");
// create large metal quarries
createFood(
 [
  [new SimpleObject(oMetalSmall, 1,1, 0,0)]
 ],
 [
  80 * numPlayers
 ], 
 [avoidClasses(clMetal, 5, clRock, 5), stayClasses(clHill, 0)],
 clMetal
)

log("Creating stone mines...");
// create stone quarries
createFood(
 [
  [new SimpleObject(oStoneSmall, 1,1, 0,0)]
 ],
 [
  80 * numPlayers
 ],
 [avoidClasses(clMetal, 5, clRock, 5), stayClasses(clHill, 0)],
 clRock
)

// create animals
createFood
(
 [
  [new SimpleObject(oSheep, 3,4, 0,2)], 
  [new SimpleObject(oMainHuntableAnimal, 4,5, 0,2)],
  [new SimpleObject(oSecondaryHuntableAnimal, 3,4, 0,2)],
  [new SimpleObject(oThirdHuntableAnimal, 1,1, 0,2)]  
 ], 
 [
  10 * numPlayers, 
  10 * numPlayers,
  10 * numPlayers,
  5 * numPlayers
 ],
 avoidClasses(clForest, 2, clPlayer, 40, clWater, 2, clMetal, 5, clRock, 5, clFood, 25, clHill, 5, clBaseResource, 20) 
);

RMS.SetProgress(50);

// create forests
createForests(
 [tMainTerrain, tForestFloor1, tForestFloor2, pForest1, pForest2],
 avoidClasses(clPlayer, 15, clWater, 10, clForest, 25, clHill, 10, clBaseResource, 5, clMetal, 5, clRock, 5, clFood, 5), 
 clForest,
 1.0,
 random_terrain
);

RMS.SetProgress(65);

// create decoration
var planetm = 1;

if (random_terrain==7)
	planetm = 8;

createDecoration
(
 [[new SimpleObject(aRockMedium, 1,3, 0,1)], 
  [new SimpleObject(aRockLarge, 1,2, 0,1), new SimpleObject(aRockMedium, 1,3, 0,2)],
  [new SimpleObject(aGrassShort, 1,2, 0,1, -PI/8,PI/8)],
  [new SimpleObject(aGrass, 2,4, 0,1.8, -PI/8,PI/8), new SimpleObject(aGrassShort, 3,6, 1.2,2.5, -PI/8,PI/8)],
  [new SimpleObject(aBushMedium, 1,2, 0,2), new SimpleObject(aBushSmall, 2,4, 0,2)]
 ],
 [
  scaleByMapSize(16, 262),
  scaleByMapSize(8, 131),
  planetm * scaleByMapSize(13, 200),
  planetm * scaleByMapSize(13, 200),
  planetm * scaleByMapSize(13, 200)
 ],
 avoidClasses(clWater, 0, clForest, 0, clPlayer, 0)
);

RMS.SetProgress(85);

// create dirt patches
log("Creating dirt patches...");
createLayeredPatches(
 [scaleByMapSize(3, 6), scaleByMapSize(5, 10), scaleByMapSize(8, 21)],
 [[tMainTerrain,tTier1Terrain],[tTier1Terrain,tTier2Terrain], [tTier2Terrain,tTier3Terrain]],
 [1,1]
);

// create grass patches
log("Creating grass patches...");
createPatches(
 [scaleByMapSize(2, 4), scaleByMapSize(3, 7), scaleByMapSize(5, 15)],
 tTier4Terrain
);

// create straggler trees
if (biomeID == 6)
{	
    var types = [oTree1, oTree2, oTree4, oTree5];	// some variation
    createStragglerTrees(types, avoidClasses(clForest, 10, clWater, 5, clPlayer, 15, clMetal, 5, clRock, 5, clFood, 5, clHill, 5, clBaseResource, 5));
}

// Export map data
ExportMap();