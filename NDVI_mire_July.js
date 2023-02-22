/////////////////////////////////////////////////////////////////////////////////////////////
// In this script we extract mire level NDVI values for July 2017-2022 for all of the chronosequence mires
/////////////////////////////////////////////////////////////////////////////////////////////


 // First we define all variables that we can modify depending on interest
 
// Set max cloud cover
var MAX_CLOUD_PROBABILITY = 30; 
// Import mire polygons
var peat = ee.FeatureCollection('users/bettyehnvall/all_peat');
// Select images. We use harmonized atmospherically corrected Sentinel-2A images 
var Sentinel2_L2A = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');
// For cloud masking we apply the cloud probability function
var s2Clouds = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY');
// We define the time intervals of interest
var Y2017 = ee.Filter.date('2017-07-01','2017-07-31');
var Y2018 = ee.Filter.date('2018-07-01','2018-07-31');
var Y2019 = ee.Filter.date('2019-07-01','2019-07-31');
var Y2020 = ee.Filter.date('2020-07-01','2020-07-31');
var Y2021 = ee.Filter.date('2021-07-01','2021-07-31');
var Y2022 = ee.Filter.date('2022-07-01','2022-07-31');
var dateFilter = ee.Filter.or(Y2017,Y2018,Y2019,Y2020,Y2021,Y2022);


// Then we select map properties for the graphical interface

// For plotting, we select the entire area of interest
Map.setCenter(20.6,63.9,10);
// We add the mire polygons
Map.addLayer(peat,{},'all_peat');


// Now let's go!

// We apply the cloud mask probability function
 function maskClouds(img) {
  var clouds = ee.Image(img.get('cloud_mask')).select('probability');
  var isNotCloud = clouds.lt(MAX_CLOUD_PROBABILITY);
  return img.updateMask(isNotCloud);
}

// The masks for the 10m bands sometimes do not exclude bad data at
// scene edges, so we apply masks from the 20m and 60m bands as well.
// Example asset that needs this operation:
// COPERNICUS/S2_CLOUD_PROBABILITY/20190301T000239_20190301T000238_T55GDP
function maskEdges(s2_img) {
  return s2_img.updateMask(
      s2_img.select('B8A').mask().updateMask(s2_img.select('B9').mask()));
}



// We add NDVI using this function.
var add_NDVI = function(image) {
  // Return the image with the added bands.
  return image
  // Add an NDVI band.
  .addBands(image.normalizedDifference(['B8', 'B4']).rename('NDVI')).float()
};


// We filter the images we want to use. 
var Sentinel2_L2A = Sentinel2_L2A
 
// We want the following bands. In the end we do not need all of them, but let's keep them for now..
    .select(['B2', 'B3','B4','B8A', 'B8', 'B7', 'B6' ,'B5', 'B9', 'B11', 'B12','SCL'])
 
    // We want images from our time interval
    .filter(dateFilter)
 
    // We want images with less than xx % cloud cover defined in the metadata.
   // .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', MAX_CLOUD_PROBABILITY)
 
    // We want images in our mire polygons
    .filterBounds(peat)
    .map(maskEdges);

// We want to filter out clouds.
s2Clouds = s2Clouds

// We want images from our time interval
    .filter(dateFilter)
 
    // We want images with less than xx % cloud cover defined in the metadata.
   // .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', MAX_CLOUD_PROBABILITY)
 
    // We want images in our mire polygons
    .filterBounds(peat);

 
// Join selected Sentinel images with cloud probability dataset to add cloud mask.
var s2SrWithCloudMask = ee.Join.saveFirst('cloud_mask').apply({
  primary: Sentinel2_L2A,
  secondary: s2Clouds,
  condition:
      ee.Filter.equals({leftField: 'system:index', rightField: 'system:index'})
});

var collection = ee.ImageCollection(s2SrWithCloudMask).map(maskClouds);
//print(s2SrWithCloudMask.first())

var rgbVis = {min: 0, max: 3000, bands: ['B4', 'B3', 'B2']};

Map.addLayer(
    collection.median(), rgbVis, 'S2 SR masked at ' + MAX_CLOUD_PROBABILITY + '%',
    true);
    
Map.addLayer(peat,{},'all_peat');


///////////////////////////////////////////////
/////////////////////  NDVI  /////////////////////////

// We have masked out pixels with clouds in the previous part, but we also need to mast out snow etc
collection = collection.map(function(img) {
 
  // Select the band SCL, which contains info about clouds etc
  var classificaion = img.select('SCL');
 
  // Select which types of pixels will be masked out
  var mask = classificaion.eq(1).or(        // Saturated or defective
             //classificaion.eq(2).or(      // Dark Area Pixels
             classificaion.eq(3).or(        // Shadow
             //classificaion.eq(6).or(      // Water
             //classificaion.eq(7).or(      // Clouds Low Probability / Unclassified
             classificaion.eq(8).or(        // Clouds Medium Probability
             classificaion.eq(9).or(        // Clouds High Probability
             classificaion.eq(10).or(     // Cirrus
             classificaion.eq(11)         // Snow / Ice
              )))));                                                                                                                                        
 
 
    // Remove pixels with undesired codes.
    img = img.updateMask(mask.not());
    return img;
 
});

// Calculate NDVI 
var collection = collection.map(add_NDVI);
print('collection',collection);
 
var count = collection.size();
print('Count: ', count);





// Now we have a collection of images with desired properties. The result is shown in the console as collection. 
// We want to know how the images relate to each other over time. 
// Here we extract the standard deviation, mean and median values for each pixel.
// In addition, we want to know how many images were used to calculate the monthly mean/median. 
// For this we use count_over_tid

var sd_over_tid = ee.Image(collection.reduce(ee.Reducer.stdDev()));
var mean_over_tid = ee.Image(collection.reduce(ee.Reducer.mean()));
var median_over_tid = ee.Image(collection.reduce(ee.Reducer.median()));
var count_over_tid = ee.Image(collection.reduce(ee.Reducer.count()));
 
//ee.Reducer.count()

// We can overview the means etc by writing them to the console.
print('sd_over_tid',sd_over_tid);
print('mean_over_tid',mean_over_tid);
print('median_over_tid',median_over_tid);
print('count_over_tid',count_over_tid);
 
// We can also write them as layers in the map window.
Map.addLayer(sd_over_tid, {bands: ['NDVI_stdDev'], min:[0], max: [0.5]}, 'sd_over_tid');
Map.addLayer(mean_over_tid, {bands: ['NDVI_mean'], min:[0], max: [1]}, 'mean_over_tid');
Map.addLayer(median_over_tid, {bands: ['NDVI_median'], min:[0], max: [1]}, 'median_over_tid');
Map.addLayer(count_over_tid, {bands: ['NDVI_count'], min:[0], max: [1]}, 'count_over_tid');
 
Map.addLayer(peat,{},'all_peat');
 
// Now we want to extract mean, median and sd for our mire polygons.
var sd_over_tid_myrar = sd_over_tid.reduceRegions({
  collection: peat,
  reducer: ee.Reducer.stdDev(),
  scale: 10,
  tileScale: 2
});
 
print('sd_over_tid_myrar',sd_over_tid_myrar)
 
 
var mean_over_tid_myrar = mean_over_tid.reduceRegions({
  collection: peat,
  reducer: ee.Reducer.mean(),
  scale: 10,
  tileScale: 2
 
});
 
print('mean_over_tid_myrar',mean_over_tid_myrar)
 
var median_over_tid_myrar = median_over_tid.reduceRegions({
  collection: peat,
  reducer: ee.Reducer.median(),
  scale: 10,
  tileScale: 2
 
});
 
print('median_over_tid_myrar',median_over_tid_myrar)
 
 
//This is the min (in the polygon) of all pixel counts (over time)
var minCount_over_tid_myrar = count_over_tid.reduceRegions({
  collection: peat,
  reducer: ee.Reducer.min(),
  scale: 10,
  tileScale: 2
});
 
//This is the max (in the polygon) of all pixel counts (over time)
var maxCount_over_tid_myrar = count_over_tid.reduceRegions({
  collection: peat,
  reducer: ee.Reducer.max(),
  scale: 10,
  tileScale: 2
});
 
//This is the median (in the polygon) of all pixel counts (over time)
var medianCount_over_tid_myrar = count_over_tid.reduceRegions({
  collection: peat,
  reducer: ee.Reducer.median(),
  scale: 10,
  tileScale: 2
});
 
//This one now is the Count of the median image per polygon, which is the same as what we did before when we used count the wrong way...
var CountofCompositeMedian_over_tid_myrar = median_over_tid.reduceRegions({
  collection: peat,
  reducer: ee.Reducer.count(),
  scale: 10,
  tileScale: 2
});
 
 
// Finally, we want to export tables.
Export.table.toDrive({
    collection: sd_over_tid_myrar,
    description: 'all_sd_over_tid_myrar_july_30',
    folder: 'user/bettyehnvall/Mires',
    fileNamePrefix: 'all_sd_over_tid_myrar_july_30',
    fileFormat: 'CSV'
})
 
 
Export.table.toDrive({
    collection: mean_over_tid_myrar,
    description: 'all_mean_over_tid_myrar_july_30',
    folder: 'users/bettyehnvall/Mires',
    fileNamePrefix: 'all_mean_over_tid_myrar_july_30',
    fileFormat: 'CSV'
})


Export.table.toDrive({
    collection: median_over_tid_myrar,
    description: 'all_median_over_tid_myrar_july_30',
    folder: 'users/bettyehnvall/Mires',
    fileNamePrefix: 'all_median_over_tid_myrar_july_30',
    fileFormat: 'CSV'
})

 
Export.table.toDrive({
    collection: medianCount_over_tid_myrar,
    description: 'all_medianCount_over_tid_myrar_july30',
    folder: 'users/bettyehnvall/Mires',
    fileNamePrefix: 'all_medianCount_tid_myrar_july30',
    fileFormat: 'CSV'
})
 
Export.table.toDrive({
    collection: minCount_over_tid_myrar,
    description: 'all_minCount_over_tid_myrar_july30',
    folder: 'users/bettyehnvall/Mires',
    fileNamePrefix: 'all_minCount_over_tid_myrar_july30',
    fileFormat: 'CSV'
})
 
 
Export.table.toDrive({
    collection: maxCount_over_tid_myrar,
    description: 'all_maxCount_over_tid_myrar_july30',
    folder: 'users/bettyehnvall/Mires',
    fileNamePrefix: 'all_maxCount_over_tid_myrar_july30',
    fileFormat: 'CSV'
})
 
 
Export.table.toDrive({
    collection: CountofCompositeMedian_over_tid_myrar,
    description: 'all_CountofCompositeMedian_over_tid_myrar_july30',
    folder: 'users/bettyehnvall/Mires',
    fileNamePrefix: 'all_CountofCompositeMedian_over_tid_myrar_july30',
    fileFormat: 'CSV'
})
 
 

