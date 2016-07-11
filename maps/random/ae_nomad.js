RMS.LoadLibrary("rmgen");

TILE_CENTERED_HEIGHT_MAP = true;
//random terrain textures
var rt = randomizeBiome();

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
const oWood = "gaia/special_treasure_wood";

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

// initialize map

log("Initializing map...");

InitMap();

var numPlayers = getNumPlayers();
var mapSize = getMapSize();
var mapArea = mapSize*mapSize;

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
var clLand = createTileClass();
var clShallow = createTileClass();

for (var ix = 0; ix < mapSize; ix++)
{
	for (var iz = 0; iz < mapSize; iz++)
	{
		var x = ix / (mapSize + 1.0);
		var z = iz / (mapSize + 1.0);
			placeTerrain(ix, iz, tWater);
	}
}

var startAngle = randFloat(0, TWO_PI);
var md = randInt(1,13);
var needsAdditionalWood = false;

{

	// randomize player order
	var playerIDs = [];
	for (var i = 0; i < numPlayers; i++)
	{
		playerIDs.push(i+1);
	}
	playerIDs = sortPlayers(playerIDs);

	var fx = fractionToTiles(0.5);
	var fz = fractionToTiles(0.5);
	ix = round(fx);
	iz = round(fz);

	var placer = new ClumpPlacer(mapArea * 0.45, 0.9, 0.09, 10, ix, iz);
	var terrainPainter = new LayeredPainter(
		[tWater, tShore, tMainTerrain],		// terrains
		[4, 2]		// widths
	);
	var elevationPainter = new SmoothElevationPainter(
		ELEVATION_SET,			// type
		3,				// elevation
		4				// blend radius
	);
	createArea(placer, [terrainPainter, elevationPainter, paintClass(clLand)], null);
	
	{
		var angle = randFloat(0, TWO_PI);
	
		var fx = fractionToTiles(0.5 + 0.25*cos(angle));
		var fz = fractionToTiles(0.5 + 0.25*sin(angle));
		ix = round(fx);
		iz = round(fz);

		var placer = new ClumpPlacer(mapArea * 0.45, 0.9, 0.09, 10, ix, iz);
		var terrainPainter = new LayeredPainter(
			[tWater, tShore, tMainTerrain],		// terrains
			[4, 2]		// widths
		);
		var elevationPainter = new SmoothElevationPainter(
			ELEVATION_SET,			// type
			3,				// elevation
			4				// blend radius
		);
		createArea(placer, [terrainPainter, elevationPainter, paintClass(clLand)], null);
	}
}

paintTerrainBasedOnHeight(3.12, 40, 1, tCliff);
paintTerrainBasedOnHeight(3, 3.12, 1, tMainTerrain);
paintTerrainBasedOnHeight(1, 3, 1, tShore);
paintTerrainBasedOnHeight(-8, 1, 2, tWater);
unPaintTileClassBasedOnHeight(0, 3.12, 1, clWater);
unPaintTileClassBasedOnHeight(-6, 0, 1, clLand);
paintTileClassBasedOnHeight(-6, 0, 1, clWater);
paintTileClassBasedOnHeight(0, 3.12, 1, clLand);
paintTileClassBasedOnHeight(3.12, 40, 1, clHill);

// place players

var playerX = new Array(numPlayers);
var playerZ = new Array(numPlayers);
var distmin = scaleByMapSize(60,240);
distmin *= distmin;

for (var i = 0; i < numPlayers; i++)
{
	var placableArea = [];
	for (var mx = 0; mx < mapSize; mx++)
	{
		for (var mz = 0; mz < mapSize; mz++)
		{
			if (!g_Map.validT(mx, mz, 6))
				continue;

			var placable = true;
			for (var c = 0; c < i; c++)
				if ((playerX[c] - mx)*(playerX[c] - mx) + (playerZ[c] - mz)*(playerZ[c] - mz) < distmin)
					placable = false;
			if (!placable)
				continue;

			if (g_Map.getHeight(mx, mz) >= 3 && g_Map.getHeight(mx, mz) <= 3.12)
				placableArea.push([mx, mz]);
		}
	}

	if (!placableArea.length)
	{
		for (var mx = 0; mx < mapSize; ++mx)
		{
			for (var mz = 0; mz < mapSize; mz++)
			{
				if (!g_Map.validT(mx, mz, 6))
					continue;

				var placable = true;
				for (var c = 0; c < i; c++)
					if ((playerX[c] - mx)*(playerX[c] - mx) + (playerZ[c] - mz)*(playerZ[c] - mz) < distmin/4)
						placable = false;
				if (!placable)
					continue;

				if (g_Map.getHeight(mx, mz) >= 3 && g_Map.getHeight(mx, mz) <= 3.12)
					placableArea.push([mx, mz]);
			}
		}
	}

	if (!placableArea.length)
	{
		for (var mx = 0; mx < mapSize; ++mx)
			for (var mz = 0; mz < mapSize; ++mz)
				if (g_Map.getHeight(mx, mz) >= 3 && g_Map.getHeight(mx, mz) <= 3.12)
					placableArea.push([mx, mz]);
	}
	var chosen = floor(Math.random()*placableArea.length);
	playerX[i] = placableArea[chosen][0];
	playerZ[i] = placableArea[chosen][1];
}


for (var i = 0; i < numPlayers; ++i)
{
	var id = playerIDs[i];
	log("Creating units for player " + id + "...");

	// get the x and z in tiles
	var ix = playerX[i];
	var iz = playerZ[i];
	var civEntities = getStartingEntities(id-1);
	var angle = randFloat(0, TWO_PI);
	for (var j = 0; j < civEntities.length; ++j)
	{
		// TODO: Make an rmlib function to get only non-structure starting entities and loop over those 
		if (!civEntities[j].Template.startsWith("units/"))
			continue;
		
		var count = civEntities[j].Count || 1;
		var jx = ix + 2 * cos(angle);
		var jz = iz + 2 * sin(angle);
		var kAngle = randFloat(0, TWO_PI);
		for (var k = 0; k < count; ++k)
			placeObject(jx + cos(kAngle + k*TWO_PI/count), jz + sin(kAngle + k*TWO_PI/count), civEntities[j].Template, id, randFloat(0, TWO_PI));
		angle += TWO_PI / 3;
	}
	if (g_MapSettings.StartingResources < 500)
	{
		var angle = randFloat(0, TWO_PI);
		var rad = randFloat(3, 5);
		var jx = ix + rad * cos(angle);
		var jz = iz + rad * sin(angle);
		placeObject(jx, jz, "gaia/special_treasure_wood", 0, randFloat(0, TWO_PI));
	}
}

// create dirt patches
log("Creating dirt patches...");
createLayeredPatches(
 [scaleByMapSize(3, 6), scaleByMapSize(5, 10), scaleByMapSize(8, 21)],
 [[tMainTerrain,tTier1Terrain],[tTier1Terrain,tTier2Terrain], [tTier2Terrain,tTier3Terrain]],
 [1,1],
 avoidClasses(clWater, 10) 
);

// create grass patches
log("Creating grass patches...");
createPatches(
 [scaleByMapSize(2, 4), scaleByMapSize(3, 7), scaleByMapSize(5, 15)],
 tTier4Terrain,
 avoidClasses(clWater, 10) 
);

RMS.SetProgress(20);

// create bumps
createBumps(avoidClasses(clWater, 2, clPlayer, 10));

// create hills

createMountains(tCliff, [avoidClasses(clPlayer, 30, clHill, 20, clBaseResource, 20, clWater, 15)], clHill, scaleByMapSize(2, 8) * numPlayers);

log("Creating metal mines...");
// create large metal quarries
createFood(
 [
  [new SimpleObject(oMetalSmall, 1,1, 0,0)]
 ],
 [
  30 * numPlayers
 ], 
 avoidClasses(clForest, 3, clPlayer, 20, clWater, 5, clMetal, 50, clRock, 20, clHill, 1, clBaseResource, 20),
 clMetal
)

log("Creating stone mines...");
// create stone quarries
createFood(
 [
  [new SimpleObject(oStoneSmall, 1,1, 0,0)]
 ],
 [
  20 * numPlayers
 ],
 avoidClasses(clForest, 3, clPlayer, 20, clWater, 4, clMetal, 20, clRock, 50, clHill, 1, clBaseResource, 20),
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
 avoidClasses(clForest, 1, clPlayer, 10, clWater, 10, clMetal, 5, clRock, 5, clFood, 25, clHill, 1, clBaseResource, 1), 
 clFood
);

// create fish
createFood
(
 [
  [new SimpleObject(oFish, 1,1, 0,2)]
 ], 
 [
  150 * numPlayers
 ],
 [avoidClasses(clFood, 10), stayClasses(clWater, 8)]
);

// create forests
createForests(
 [tMainTerrain, tForestFloor1, tForestFloor2, pForest1, pForest2],
 avoidClasses(clPlayer, 15, clWater, 10, clForest, 25, clHill, 0, clBaseResource, 5, clMetal, 5, clRock, 5, clFood, 5), 
 clForest,
 1.0,
 rt
);

RMS.SetProgress(65);

// create decoration
var planetm = 1;

if (rt==7)
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
 avoidClasses(clWater, 5, clForest, 0, clPlayer, 0, clHill, 0)
);

RMS.SetProgress(85);		

// create straggler trees
if (biomeID == 6)
{	
    var types = [oTree1, oTree2, oTree4, oTree5];	// some variation
    createStragglerTrees(types, avoidClasses(clForest, 8, clWater, 5, clPlayer, 15, clMetal, 5, clRock, 5, clFood, 5, clHill, 2));
}
	
// Export map data
ExportMap();
