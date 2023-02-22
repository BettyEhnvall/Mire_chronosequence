# Sävar Rising Coastline Mire Chronosequence

## NDVI scripts in GEE

July point and mire level NDVI extraction in Google Earth Engine for the years 2017-2022. Point and polygon shapefiles used in the script are provided under the folder "Shapefiles".

## Whitebox tools

Delineation of total and unique mire catchments using scripts from Whitebox tools. Mire polygons used in the script are provided under the folder "Shapefiles". The script can be run in Whitebox GAT. 
The flow-pointer map used in the catchment delineation was calculated in Whitebox GAT from a 2 x 2 m DEM prepreossesed as follows:

1. Agricultural streams that are defined in the Swedish property map were first burned 1 m into the DEM. 
2. Stream and road intersections were then carved into the DEM to allow water to flow through culverts. 
3. Sinks were removed from the DEM by applying a breaching algorithm. 

From the mire-corrected DEM, we calculated flow direction and flow accumulation using the deterministic eight-direction flow model. 