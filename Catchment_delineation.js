
/////////////////////////////////////////////////////////////////////////////////////////////
// In this script we extract total and unique mire upslope catchment areas for all chronosequence mires
/////////////////////////////////////////////////////////////////////////////////////////////


import os

# data path
Pointer = "Insert path to original flow-pointer raster here"
Sinks = "Insert path to mire-corrected flow-pointer raster here"
Mire_all_shape = "Insert path to mire shapelfile containing all mires polygons here"
Mire_all_raster = "Insert path to mire raster containing all mires here"
Mire_shape = "Insert path to individual mire polygons here"
Mire_raster = "Insert path to individual mire rasters here"
Unique_catchment_mire_raster = "Insert path to unique catchment raster here, including the mire area"
Unique_catchment_mire_shape = "Insert path to unique catchment polygon here, including the mire area"
Unique_catchment_raster = "Insert path to unique catchment raster here, excluding the mire area"
Unique_catchment_shape = "Insert path to unique catchment polygon here, excluding the mire area"
Total_catchment_mire_raster = "Insert path to total catchment raster here, including the mire area"
Total_catchment_mire_shape = "Insert path to total catchment polygon here, including the mire area"
Total_catchment_raster = "Insert path to total catchment raster here, excluding the mire area"
Total_catchment_shape = "Insert path to total catchment polygon here, excluding the mire area"


def myfunction (map,file,rastermap,rasterfile,shapemap,namebase,rasterdonut,shapedonut):
# def = function (parameters, Note! Order important.)
# Call function from main (if-loop)
    # Extract unique +mire
    pointerFile = map + file
    outletsFile = Mire_raster + "Mire_raster.dep"
    outputFile = rastermap + rasterfile
    args4 = [pointerFile, outletsFile, outputFile]
    # Convert unique +mire raster to polygon
    inputFile = rastermap + rasterfile
    outputFile = shapemap + namebase + ".shp"
    args5 = [inputFile, outputFile]
    # Extract unique  from +mire raster
    inputFile1 = rastermap + rasterfile
    inputFile2 = Mire_raster + "Mire_raster.dep"
    outputFile = rasterdonut + rasterfile
    args6 = [inputFile1, inputFile2, outputFile]
    # Convert unique  raster to polygon
    inputFile = rasterdonut + rasterfile
    outputFile = shapedonut + namebase + ".shp"
    args7 = [inputFile, outputFile]

    try:
    # If error in plugins -> print error
        pluginHost.runPlugin("", args4, False)
        pluginHost.runPlugin("RasterToVectorPolygons", args5, False)
        pluginHost.runPlugin("Subtract", args6, False)
        pluginHost.runPlugin("RasterToVectorPolygons", args7, False)

    except Exception, e:
        print("An error occured while processing {0}".format(file))
        print(e)


# Making upslope mires sinks (do not need to repeat)
# Mire = 0, non-mire = 1
#inputFile = Mire_all_shape + "ms_get.shp"
#outputFile = Mire_all_raster + "myr_all.dep"
#fieldName = "Type"
#backgroundVal = "1"
#cellSize = "0"
#baseFile = Pointer + "DEM_burn1m_roads50.dep"
#args1 = [inputFile, outputFile, fieldName, backgroundVal, cellSize, baseFile]

# Mire * flowpointer = flowpointer with sinks
#inputFile1 = Mire_all_raster + "Mire_all.dep"
#inputFile2 = Pointer + "DEM_burn1m_roads50.dep"
#outputFile = Sinks + "Mire_sink.dep"
#args2 = [inputFile1, inputFile2, outputFile]

# Extracting unique s+mires
# Convert individual mire shapes to rasters, where the flowpointer file sets the dimensions
pluginHost.setWorkingDirectory(Mire_shape)
for file in os.listdir(Mire_shape):
    if file.endswith(".shp"):
        basename = os.path.basename(file).replace(".shp", "")
        inputFile = Mire_shape + basename + ".shp"
        outputFile = Mire_raster + "Myr_raster.dep"
        fieldName = "not specified"
        backgroundVal = "0"
        cellSize = "not specified"
        baseFile = Pointer + "DEM_burn1m_roads50.dep"
        args3 = [inputFile, outputFile, fieldName, backgroundVal, cellSize, baseFile]

        try:
            #pluginHost.runPlugin("VectorPolygonsToRaster", args1, False)
            #pluginHost.runPlugin("Multiply", args2, False)
            pluginHost.runPlugin("VectorPolygonsToRaster", args3, False)

        except Exception, e:
            print("An error occured while processing {0}".format(file))
            print(e)
        # Run total and unique
        myfunction(Sinks,"Myr_sink.dep",Unique_catchment_mire_raster,"Unique_.dep",Unique_catchment_mire_shape,basename,Unique_catchment_raster,Unique_catchment_shape)
        myfunction(Pointer,"DEM_burn1m_roads50.dep",Total_catchment_mire_raster,"Total_.dep",Total_catchment_mire_shape,basename,Total_catchment_raster,Total_catchment_shape)
