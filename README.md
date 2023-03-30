# Sävar Rising Coastline Mire Chronosequence

## Publications

Title: Catchment controls on boreal mire nutrient status and vegetation patterns

Authors: Betty Ehnvall, Anneli Ågren, Mats B. Nilsson, Joshua L. Ratcliffe, Koffi Dodji Noumonvi, Matthias Peichl, William Lidberg, Reiner Giesler, Carl-Magnus Mörth, Mats G. Öquist

Affiliation: Department of Forest Ecology and Management, Swedish University of Agricultural Sciences, Skogsmarksgränd 17, 90183 Umeå, Sweden

Year: 2023


## NDVI scripts in Google Earth Engine

July point and mire level NDVI extraction in Google Earth Engine for the years 2017-2022. Point and polygon shapefiles used in the script are provided under the folder "Shapefiles".

## Catchment delineation in Whitebox tools

Delineation of total and unique mire catchments using codes from Whitebox tools. Mire polygons used in the script are provided under the folder "Shapefiles". The script can be run in Whitebox GAT. 
The flow-pointer map used in the catchment delineation was calculated in Whitebox GAT from a 2 x 2 m DEM prepreossesed as follows:

1. Agricultural streams that are defined in the Swedish property map were first burned 1 m into the DEM. 
2. Stream and road intersections were then carved into the DEM to allow water to flow through culverts. 
3. Sinks were removed from the DEM by applying a breaching algorithm. 

From the mire-corrected DEM, we calculated flow direction and flow accumulation using the deterministic eight-direction flow model. In Ehnvall et al. (2023) mires in Mires_landscape_level.shp were used, while in Ehnvall et al. (manuscript) mires in "Mires_Savar_chronosequence.shp" were used.
