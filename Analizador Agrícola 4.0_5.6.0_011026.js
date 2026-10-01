// Analizador Agrícola 4.0 — Versión 5.6.0 (VRA EDITION Compensatorio y Proporcional)
// ====================================================================================
// NOVEDADES v5.5 sobre v5.4.3:
//   [VRA-1] CROP_PARAMS: tabla de calibración agronómica por cultivo e insumo
//           (Trigo, Maíz, Raps, Cebada, Avena, Papa) con enfoque Sufficiency Index.
//   [VRA-2] runVRAPrescription(): motor de prescripción que traduce zonas K-Means
//           a dosis variables usando NDRE (N), Kcb (agua) o NDMI (fungicida).
//   [VRA-3] Exportación triple: Shapefile (.shp) compatible JD Operations Center y
//           AFS Connect, GeoTIFF EPSG:32719 y CSV logístico por zona.
//   [VRA-4] Panel "8. Prescripción Variable (VRA)" en UI con tabla de SI y dosis.
//   [VRA-5] runZonalAnalysis() modificado: guarda lastResult.clusteredImage para
//           que el motor VRA acceda a las zonas generadas.
//   [VRA-6] Visualización automática del mapa de dosis sobre el lote.
// CONSERVADO: toda la funcionalidad v5.4.3 (índices, GDD, bitácora, exportaciones).
// ====================================================================================

// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 1 · PARAM_SETS — VISUALIZACIÓN DE 17 ÍNDICES (sin cambios v5.4.3)
// ═══════════════════════════════════════════════════════════════════════════════
var PARAM_SETS = {
  'Estandar': {
    'NDVI':   { vis: { min:-0.2, max:1,    palette:['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'] }, classification:{ thresholds:[0.2,0.4,0.7], labels:['Suelo','Baja','Media','Alta'], colors:['#a52a2a','#e9d52d','#72b043','#006400'] } },
    'GNDVI':  { vis: { min:-0.2, max:1,    palette:['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'] }, classification:{ thresholds:[0.2,0.4,0.6], labels:['Bajo','Medio','Alto','Muy Alto'], colors:['#a52a2a','#e9d52d','#72b043','#006400'] } },
    'EVI':    { vis: { min:0,    max:1,    palette:['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'] }, classification:{ thresholds:[0.2,0.4,0.6], labels:['Baja','Media','Alta','Muy Alta'], colors:['#a52a2a','#e9d52d','#72b043','#006400'] } },
    'SAVI':   { vis: { min:0,    max:1,    palette:['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'] }, classification:{ thresholds:[0.2,0.4,0.6], labels:['Baja','Media','Alta','Muy Alta'], colors:['#a52a2a','#e9d52d','#72b043','#006400'] } },
    'OSAVI':  { vis: { min:0,    max:1,    palette:['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'] }, classification:{ thresholds:[0.2,0.4,0.6], labels:['Baja','Media','Alta','Muy Alta'], colors:['#a52a2a','#e9d52d','#72b043','#006400'] } },
    'NDRE':   { vis: { min:0.1,  max:0.6,  palette:['#ffffcc','#c2e699','#78c679','#31a354','#006837'] }, classification:{ thresholds:[0.15,0.25,0.35], labels:['Bajo','Medio','Alto','Muy Alto'], colors:['#ffcc99','#f28c28','#c9513e','#bf0000'] } },
    'GCL':    { vis: { min:0,    max:10,   palette:['#ffffe5','#f7fcb9','#d9f0a3','#addd8e','#78c679','#41ab5d','#238443','#005a32'] }, classification:{ thresholds:[2,5,8], labels:['Bajo','Medio','Alto','Muy Alto'], colors:['#d7c29e','#f2e860','#3b802e','#1a4314'] } },
    'ReCL':   { vis: { min:1,    max:4,    palette:['#ffffe5','#f7fcb9','#d9f0a3','#addd8e','#78c679','#41ab5d','#238443','#005a32'] }, classification:{ thresholds:[1,2.5,4], labels:['Bajo','Medio','Alto','Muy Alto'], colors:['#d9d9d9','#f2d1a3','#e68a00','#734500'] } },
    'ARVI':   { vis: { min:-0.2, max:1,    palette:['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'] }, classification:{ thresholds:[0.2,0.4,0.6], labels:['Baja','Media','Alta','Muy Alta'], colors:['#a52a2a','#e9d52d','#72b043','#006400'] } },
    'MSAVI2': { vis: { min:-0.2, max:1,    palette:['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'] }, classification:{ thresholds:[0.2,0.4,0.6], labels:['Baja','Media','Alta','Muy Alta'], colors:['#a52a2a','#e9d52d','#72b043','#006400'] } },
    'S2_PRI': { vis: { min:-0.15,max:0.05, palette:['#006837','#a6d96a','#ffffbf','#fdae61','#d73027','#a50026'] }, classification:{ thresholds:[-0.1,-0.05,0], labels:['Muy Sano','Sano','Estrés','Crítico'], colors:['#006837','#a6d96a','#fdae61','#a50026'] } },
    'NDMI':   { vis: { min:-0.2, max:0.6,  palette:['#8c510a','#d8b365','#f6e8c3','#c7eae5','#5ab4ac','#01665e'] }, classification:{ thresholds:[0,0.3,0.6], labels:['Seco','Bajo','Medio','Alto'], colors:['#cd853f','#90ee90','#87ceeb','#0000ff'] } },
    'NDWI':   { vis: { min:-1,   max:1,    palette:['#f7f7f7','#969696','#1f78b4'] }, classification:{ thresholds:[0,0.2], labels:['No Agua','Humedad','Agua'], colors:['#d7c29e','#80dfff','#004c70'] } },
    'DEM':    { vis: { min:0,    max:2000, palette:['006633','E5FFCC','662A00','D8D8D8','FFFFFF'] }, color:'gray' },
    'Slope':  { vis: { min:0,    max:20,   palette:['#31a354','#ffffbf','#bf0303'] }, color:'brown' },
    'Kcb':    { vis: { min:0,    max:1.2,  palette:['#a52a2a','yellow','green','#004d00'] }, color:'#4682B4' },
    'N_Indicator': { vis:{ min:0.2, max:0.8, palette:['#006400','#abdda4','#ffffbf','#fdae61','#d7191c'] }, classification:{ thresholds:[0.4,0.9,0.91], labels:['Óptimo','Bueno','Alerta','Malo'], colors:['#006400','#abdda4','#fdae61','#d7191c'] } }
  },
  'Arido': {
    'NDVI':   { vis:{ min:0, max:0.6, palette:['#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'] }, classification:{ thresholds:[0.2,0.35,0.5], labels:['Suelo','Vigor Bajo','Vigor Medio','Vigor Alto'], colors:['#a52a2a','#e9d52d','#72b043','#006400'] } },
    'NDRE':   { vis:{ min:0.05,max:0.4,  palette:['#ffffcc','#c2e699','#78c679','#31a354','#006837'] } },
    'GCL':    { vis:{ min:0,   max:6,    palette:['#ffffe5','#f7fcb9','#d9f0a3','#addd8e','#78c679','#41ab5d','#238443','#005a32'] } },
    'Kcb':    { vis:{ min:0,   max:1.2,  palette:['#a52a2a','yellow','green','#004d00'] } },
    'NDMI':   { vis:{ min:-0.2,max:0.6,  palette:['#8c510a','#d8b365','#f6e8c3','#c7eae5','#5ab4ac','#01665e'] } }
  }
};

var INDEX_PARAMS = {};
for (var key in PARAM_SETS['Estandar']) { INDEX_PARAMS[key] = PARAM_SETS['Estandar'][key]; }
var ACTIVE_INDEX_PARAMS = JSON.parse(JSON.stringify(INDEX_PARAMS));


// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 1b · CROP_PARAMS — CALIBRACIÓN AGRONÓMICA VRA  ← NUEVO EN v5.5
// ═══════════════════════════════════════════════════════════════════════════════
// Enfoque: Sufficiency Index (SI) de Holland & Schepers adaptado a Chile central.
//   SI = valor_índice_zona / valor_referencia_lote (percentil 95)
//   SI ≥ umbral  → zona suficiente → dosis mínima
//   SI < umbral  → zona deficiente → interpolación lineal hasta dosis máxima
//
// invert:true → índice inverso al estrés (ej. NDMI alto = humedad = más fungicida)
// Unidades y dosis calibradas para cultivares comerciales de Chile central.
// ─────────────────────────────────────────────────────────────────────────────
var CROP_PARAMS = {
  'Trigo': {
    insumos: {
      'Nitrógeno':    { indice:'NDRE', si_umbral:0.95, dosis_max:160, dosis_min:20,  unidad:'kg N/ha',  invert:false, desc:'NDRE: clorofila foliar. Aplicar en macollaje y encañado.' },
      'Agua (Kcb)':   { indice:'Kcb',  si_umbral:0.85, dosis_max:60,  dosis_min:10,  unidad:'mm/riego', invert:false, desc:'Kcb: demanda evapotranspirativa. Déficit en espigazón crítico.' },
      'Fungicida':    { indice:'NDMI', si_umbral:0.40, dosis_max:1.5, dosis_min:0.5, unidad:'L/ha',     invert:true,  desc:'NDMI alto = mayor humedad foliar = mayor riesgo de roya/septoria.' }
    }, tBase:0
  },
  'Maíz': {
    insumos: {
      'Nitrógeno':    { indice:'NDRE', si_umbral:0.95, dosis_max:220, dosis_min:30,  unidad:'kg N/ha',  invert:false, desc:'NDRE: aplicación entre V6-V10 según diagnóstico foliar.' },
      'Agua (Kcb)':   { indice:'Kcb',  si_umbral:0.80, dosis_max:90,  dosis_min:15,  unidad:'mm/riego', invert:false, desc:'Kcb: crítico en floración y llenado de grano (VT-R3).' },
      'Fungicida':    { indice:'NDMI', si_umbral:0.40, dosis_max:1.2, dosis_min:0.0, unidad:'L/ha',     invert:true,  desc:'NDMI alto = microclima húmedo = riesgo de roya y helminthosporium.' }
    }, tBase:10
  },
  'Raps': {
    insumos: {
      'Nitrógeno':    { indice:'NDRE', si_umbral:0.95, dosis_max:140, dosis_min:20,  unidad:'kg N/ha',  invert:false, desc:'NDRE: aplicar en roseta (BBCH 30) y botón floral (BBCH 50).' },
      'Agua (Kcb)':   { indice:'Kcb',  si_umbral:0.85, dosis_max:50,  dosis_min:10,  unidad:'mm/riego', invert:false, desc:'Kcb: mayor demanda en floración para cuajado.' },
      'Boro (foliar)':{ indice:'NDRE', si_umbral:0.90, dosis_max:2.0, dosis_min:0.5, unidad:'kg B/ha',  invert:false, desc:'NDRE bajo correlaciona con deficiencia B en zonas arenosas.' }
    }, tBase:5
  },
  'Cebada': {
    insumos: {
      'Nitrógeno':    { indice:'NDRE', si_umbral:0.95, dosis_max:130, dosis_min:15,  unidad:'kg N/ha',  invert:false, desc:'NDRE: control de proteína para calidad maltera (máx 11.5% proteína).' },
      'Agua (Kcb)':   { indice:'Kcb',  si_umbral:0.85, dosis_max:55,  dosis_min:10,  unidad:'mm/riego', invert:false, desc:'Kcb: riego diferenciado crítico en espigazón.' }
    }, tBase:0
  },
  'Avena': {
    insumos: {
      'Nitrógeno':    { indice:'NDRE', si_umbral:0.95, dosis_max:120, dosis_min:15,  unidad:'kg N/ha',  invert:false, desc:'NDRE: diagnóstico en macollaje pleno (BBCH 25).' },
      'Agua (Kcb)':   { indice:'Kcb',  si_umbral:0.85, dosis_max:50,  dosis_min:10,  unidad:'mm/riego', invert:false, desc:'Kcb: baja tolerancia al déficit hídrico en panoja.' }
    }, tBase:0
  },
  'Papa': {
    insumos: {
      'Nitrógeno':    { indice:'NDRE', si_umbral:0.95, dosis_max:180, dosis_min:25,  unidad:'kg N/ha',  invert:false, desc:'NDRE: alta demanda en tuberización (BBCH 40-49).' },
      'Agua (Kcb)':   { indice:'Kcb',  si_umbral:0.80, dosis_max:70,  dosis_min:15,  unidad:'mm/riego', invert:false, desc:'Kcb: déficit en tuberización reduce rendimiento y calibre.' },
      'Fungicida':    { indice:'NDMI', si_umbral:0.40, dosis_max:2.5, dosis_min:0.5, unidad:'L/ha',     invert:true,  desc:'NDMI: mayor humedad foliar = mayor riesgo tizón tardío (P. infestans).' }
    }, tBase:7
  }
};

// Paleta VRA: de azul (dosis baja) a rojo (dosis alta)
var VRA_PALETTE = ['#2b83ba','#abdda4','#ffffbf','#fdae61','#d7191c'];
var ZONE_PALETTE = ['#d7191c','#fdae61','#ffffbf','#a6d96a','#2b83ba','#800080','#ffc0cb','#a52a2a','#000000','#bdbdbd'];


// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 2 · VARIABLES GLOBALES
// ═══════════════════════════════════════════════════════════════════════════════
var lastResult = {
  roi: null, image: null, s2_processed: null, gdd: null, zonal_stats: null,
  // ── Nuevas en v5.5 ──────────────────────────────────────────────────────────
  clusteredImage:     null,  // ee.Image de zonas K-Means (guardada por runZonalAnalysis)
  primaryZoneIndex:   null,  // índice primario con que se zonificó (ej. 'NDRE')
  secondaryZoneIndex: null,  // índice secundario de zonificación (ej. 'Kcb')
  numZones:           null,  // número de zonas generadas
  prescriptionFC:     null,  // ee.FeatureCollection con geometrías y dosis (para export)
  prescriptionImage:  null   // ee.Image de dosis continua (para raster export)
};

var loteNamesGlobal = []; var bitacoraData = []; var bitacoraCounter = 1;

// UI GLOBAL WIDGETS
var drawingTools, geometrySelector, assetIdTextBox, loteSelector, statusLabel, calibrationSelector;
var chartPanel, distributionChartPanel, zonalResultsPanel, topographyResultsPanel, mapLegendPanel;
var chartOptionsPanel, spatialPanel, zonalPanel, topographyPanel, vraPanel, expPanel;
var pointInspectionPanel, pointTablePanel, capturePointsCheckbox, clearPointsButton, exportPointsButton;
var gddLabel, imagesCountLabel, startDateBox, endDateBox, fechaSiembraTextbox, tBaseTextbox, estacionAssetTextbox;
var gddChartCheckbox, indexCheckboxes = {};
var runClassificationButton, spatialIndexSelect, zonalIndexSelect, secondaryIndexSelect;
var numZonesTextbox, expFolderPathTextBox, expRoiNameTextBox, expAssetNameTextBox;
var dynamicStretchCheck, smoothMapCheckbox;
// ── Widgets VRA (nuevos v5.5) ──────────────────────────────────────────────────
var vraCropSelect, vraInputSelect, vraStrategySelect, vraDescLabel, vraResultPanel, vraExportPanel;

var INDEX_COLORS = {};
(function initColors() {
  for (var k in PARAM_SETS['Estandar']) {
    var p = PARAM_SETS['Estandar'][k];
    if (p.color) { INDEX_COLORS[k] = p.color; }
    else if (p.vis && p.vis.palette) { var pal = p.vis.palette; INDEX_COLORS[k] = pal[pal.length-1]; }
    else { INDEX_COLORS[k] = '#000000'; }
  }
})();


// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 3 · FUNCIONES DE CÁLCULO SATELITAL (sin cambios v5.4.3)
// ═══════════════════════════════════════════════════════════════════════════════

function safeRemoveLayer(kw) {
  var layers = Map.layers(), n = layers.length();
  for (var i = n-1; i >= 0; i--) { var l = layers.get(i); if (l.getName() === kw || l.getName().indexOf(kw) > -1) Map.remove(l); }
}

function setStatus(msg, color) {
  try { if (statusLabel) { statusLabel.setValue(msg); statusLabel.style().set({color: color, fontWeight:'bold'}); } } catch(e) {}
}

function updateActiveParams() {
  var mode = calibrationSelector.getValue();
  ACTIVE_INDEX_PARAMS = (mode === 'Árido/Frutales (Norte/Perú)') ? PARAM_SETS['Arido'] : PARAM_SETS['Estandar'];
}

function calculateIndices(image) {
  var srtm = ee.Image('USGS/SRTMGL1_003');
  var dem = srtm.select('elevation').rename('DEM');
  var slope = ee.Terrain.slope(dem).rename('Slope');
  var img = image.addBands([dem, slope]);
  var base = img.addBands([
    img.normalizedDifference(['B8','B4']).rename('NDVI'),
    img.expression('2.5*((NIR-RED)/(NIR+6*RED-7.5*BLUE+1))',{'NIR':img.select('B8'),'RED':img.select('B4'),'BLUE':img.select('B2')}).rename('EVI'),
    img.expression('((NIR-RED)/(NIR+RED+0.5))*1.5',{'NIR':img.select('B8'),'RED':img.select('B4')}).rename('SAVI'),
    img.expression('(NIR-RED)/(NIR+RED+0.16)',{'NIR':img.select('B8'),'RED':img.select('B4')}).rename('OSAVI'),
    img.expression('(NIR-(2*RED-BLUE))/(NIR+(2*RED-BLUE))',{'NIR':img.select('B8'),'RED':img.select('B4'),'BLUE':img.select('B2')}).rename('ARVI'),
    img.expression('(1/2)*(2*NIR+1-sqrt(pow((2*NIR+1),2)-8*(NIR-RED)))',{'NIR':img.select('B8'),'RED':img.select('B4')}).rename('MSAVI2'),
    img.normalizedDifference(['B8','B3']).rename('GNDVI'),
    img.normalizedDifference(['B8','B5']).rename('NDRE'),
    img.expression('(NIR/GREEN)-1',{'NIR':img.select('B8'),'GREEN':img.select('B3')}).clamp(0,10).rename('GCL'),
    img.expression('NIR/RED_EDGE_1',{'NIR':img.select('B8'),'RED_EDGE_1':img.select('B5')}).rename('ReCL'),
    img.normalizedDifference(['B5','B6']).rename('S2_PRI'),
    img.normalizedDifference(['B8','B11']).rename('NDMI'),
    img.normalizedDifference(['B3','B8']).rename('NDWI')
  ]);
  var kcb  = base.select('NDVI').multiply(1.44).subtract(0.1).rename('Kcb');
  var nInd = base.expression('NDRE/NDVI',{'NDVI':base.select('NDVI'),'NDRE':base.select('NDRE')}).rename('N_Indicator').updateMask(base.select('NDVI').gt(0.45));
  return base.addBands(kcb).addBands(nInd,null,true).toFloat().copyProperties(image,['system:time_start']);
}

function calculateGDD(roi, siembraDate, endDate, tBase, estacionAssetId, callback) {
  if (!estacionAssetId) {
    var col = ee.ImageCollection('ECMWF/ERA5_LAND/DAILY_AGGR').filterBounds(roi).filterDate(siembraDate, endDate).select(['temperature_2m_max','temperature_2m_min']);
    var gddCol = col.map(function(img) { var tMax = img.select('temperature_2m_max').subtract(273.15); var tMin = img.select('temperature_2m_min').subtract(273.15); return tMax.add(tMin).divide(2).subtract(tBase).max(0).rename('gdd').copyProperties(img,['system:time_start']); });
    gddCol.select('gdd').sum().reduceRegion({reducer:ee.Reducer.mean(),geometry:roi,scale:10000,maxPixels:1e9}).get('gdd').evaluate(callback);
  } else {
    try {
      var est = ee.FeatureCollection(estacionAssetId).filter(ee.Filter.date(siembraDate, endDate));
      est.map(function(f){ var tA=ee.Number(f.get('tmax')).add(ee.Number(f.get('tmin'))).divide(2); return f.set('gdd',tA.subtract(tBase).max(0)); }).aggregate_sum('gdd').evaluate(callback);
    } catch(e) { setStatus('Error estación: '+e.message,'red'); callback(null); }
  }
}

function createDailyComposites(collection) {
  var tagged = collection.map(function(im) { return im.set('date', im.date().format('YYYY-MM-dd')); });
  var joined = ee.ImageCollection(ee.Join.saveAll('matches').apply({ primary:tagged, secondary:tagged, condition:ee.Filter.equals({leftField:'date',rightField:'date'}) }));
  return ee.ImageCollection(joined.map(function(img){ return ee.ImageCollection.fromImages(img.get('matches')).mean().copyProperties(img,['system:time_start']); }).distinct('system:time_start'));
}

function generateGddChart(roi, siembraDate, endDate, tBase, estacionAssetId) {
  if (!estacionAssetId) {
    var gddCol = ee.ImageCollection('ECMWF/ERA5_LAND/DAILY_AGGR').filterBounds(roi).filterDate(siembraDate,endDate).map(function(img){
      var tMax=img.select('temperature_2m_max').subtract(273.15); var tMin=img.select('temperature_2m_min').subtract(273.15);
      return tMax.add(tMin).divide(2).subtract(tBase).max(0).rename('gdd').copyProperties(img,['system:time_start']);
    });
    var feats = gddCol.map(function(img){
      return ee.Feature(null,{'gdd':img.reduceRegion({reducer:ee.Reducer.mean(),geometry:roi,scale:1000,maxPixels:1e9}).get('gdd'),'system:time_start':img.get('system:time_start')});
    });
    print(ui.Chart.feature.byFeature({features:feats,xProperty:'system:time_start',yProperties:['gdd']}).setOptions({title:'GDD Diarios',vAxis:{title:'GDD (°C-día)'},hAxis:{title:'Fecha'},lineWidth:0,pointSize:4,series:{0:{color:'blue'}},interpolateNulls:true}));
  }
}

function generateCVChart(roi, collection, indexName) {
  var cvCol = collection.map(function(img) {
    var reducer = ee.Reducer.stdDev().combine({reducer2:ee.Reducer.mean(),sharedInputs:true});
    var stats = img.select(indexName).reduceRegion({reducer:reducer,geometry:roi,scale:10,bestEffort:true,maxPixels:1e9});
    var mean = stats.get(indexName+'_mean'); var std = stats.get(indexName+'_stdDev');
    var cv = ee.Algorithms.If(ee.Algorithms.IsEqual(mean,null),null,ee.Algorithms.If(ee.Algorithms.IsEqual(std,null),null,ee.Number(std).divide(ee.Number(mean)).multiply(100)));
    return ee.Feature(null,{'system:time_start':img.get('system:time_start'),'CV':cv});
  }).filter(ee.Filter.notNull(['CV']));
  var meanCV = cvCol.aggregate_mean('CV');
  cvCol = cvCol.map(function(f){ return f.set('CV_Promedio',meanCV); });
  print(ui.Chart.feature.byFeature(cvCol,'system:time_start',['CV','CV_Promedio']).setOptions({title:'Coeficiente de Variación (CV%) — '+indexName,vAxis:{title:'CV (%)'},hAxis:{title:'Fecha'},series:{0:{color:'#d73027',lineWidth:2,pointSize:4},1:{color:'black',lineWidth:1.5,pointSize:0,lineDashStyle:[4,4]}},legend:{position:'top'},interpolateNulls:true}));
}


// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 4 · VISUALIZACIÓN (sin cambios v5.4.3)
// ═══════════════════════════════════════════════════════════════════════════════

function createColorBar(visParams) {
  var img = ee.Image.pixelLonLat().select('longitude');
  var bar = ui.Thumbnail({image:img.visualize({min:0,max:1,palette:visParams.palette}),params:{bbox:'0,0,1,0.1',dimensions:'100x10'},style:{stretch:'horizontal',margin:'0px 8px'}});
  var labels = ui.Panel([ui.Label(visParams.min.toFixed(2),{margin:'4px 8px'}),ui.Label(((visParams.min+visParams.max)/2).toFixed(2),{margin:'4px 8px',textAlign:'center',stretch:'horizontal'}),ui.Label(visParams.max.toFixed(2),{margin:'4px 8px'})],ui.Panel.Layout.flow('horizontal'));
  return ui.Panel([labels,bar]);
}

function createLegend(params) {
  var legend = ui.Panel({style:{padding:'8px 15px'}});
  legend.add(ui.Label({value:params.title,style:{fontWeight:'bold',fontSize:'14px',margin:'0 0 4px 0'}}));
  params.classification.labels.forEach(function(lbl,i){
    legend.add(ui.Panel([ui.Label({style:{backgroundColor:params.classification.colors[i],padding:'8px',margin:'0 0 4px 0'}}),ui.Label({value:lbl,style:{margin:'0 0 4px 6px'}})],ui.Panel.Layout.Flow('horizontal')));
  });
  return legend;
}

function bringPointsToFront() {
  var layers = Map.layers(), n = layers.length(), points = [];
  for (var i=0;i<n;i++){var l=layers.get(i);if(l.getName()==='Punto Inspector')points.push(l);}
  points.forEach(function(l){layers.remove(l);layers.add(l);});
}

function generateHistogram(image, indexName, region) {
  var params = ACTIVE_INDEX_PARAMS[indexName]; if(!params) return;
  distributionChartPanel.clear().add(ui.Label('Calculando histograma...'));
  image.select(indexName).reduceRegion({reducer:ee.Reducer.histogram({maxBuckets:30,minBucketWidth:(params.vis.max-params.vis.min)/30}),geometry:region,scale:10,maxPixels:1e9}).evaluate(function(result){
    distributionChartPanel.clear();
    var d=result[indexName]; if(!d) return;
    var areaCounts=d.histogram.map(function(c){return c*0.01;}), total=areaCounts.reduce(function(a,b){return a+b;},0);
    var chartData=[['Valor','Hectáreas']]; for(var i=0;i<d.bucketMeans.length;i++) chartData.push([d.bucketMeans[i],areaCounts[i]]);
    distributionChartPanel.add(new ui.Chart(chartData,'ColumnChart',{title:'Distribución ('+indexName+')',hAxis:{title:'Valor'},vAxis:{title:'Superficie (ha)'},legend:{position:'none'},colors:['#1f77b4']}));
    distributionChartPanel.add(ui.Label('Total: '+total.toFixed(2)+' ha',{fontSize:'11px',margin:'5px 0'}));
  });
}

function displayLayer(image, indexName, isVisible) {
  var vis = ACTIVE_INDEX_PARAMS[indexName].vis; safeRemoveLayer(indexName);
  var imgToShow = image.select(indexName);
  if(smoothMapCheckbox&&smoothMapCheckbox.getValue()) imgToShow=imgToShow.focalMedian({radius:20,kernelType:'circle',units:'meters'});
  if(dynamicStretchCheck.getValue()){
    image.select(indexName).reduceRegion({reducer:ee.Reducer.percentile([2,98]),geometry:lastResult.roi,scale:30,maxPixels:1e9}).evaluate(function(s){
      if(s){
        var mn=s[indexName+'_p2'],mx=s[indexName+'_p98'];
        if(mn===null||mx===null||mn>=mx){mn=vis.min;mx=vis.max;}
        var dv={min:mn,max:mx,palette:vis.palette}; safeRemoveLayer(indexName); Map.addLayer(imgToShow,dv,indexName,isVisible);
        if(isVisible){mapLegendPanel.clear().add(ui.Label('Leyenda: '+indexName,{fontWeight:'bold'})).add(createColorBar(dv)); generateHistogram(imgToShow,indexName,lastResult.roi);}
        bringPointsToFront();
      }
    });
  } else {
    safeRemoveLayer(indexName); Map.addLayer(imgToShow,vis,indexName,isVisible);
    if(isVisible){mapLegendPanel.clear().add(ui.Label('Leyenda: '+indexName,{fontWeight:'bold'})).add(createColorBar(vis)); generateHistogram(imgToShow,indexName,lastResult.roi);}
    bringPointsToFront();
  }
}

function updateMapIndexLayer(indexName) {
  if(!lastResult.image) return;
  safeRemoveLayer(indexName); safeRemoveLayer('Clasificación');
  Map.layers().forEach(function(l){var n=l.getName();if(n!=='DATA_TOTAL_INSPECTOR'&&n!=='Lote Seleccionado'&&n!=='Punto Inspector'&&n!==indexName)l.setShown(false);});
  displayLayer(lastResult.image,indexName,true); addColumnToBitacora();
}


// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 5 · UI MANAGEMENT (sin cambios v5.4.3)
// ═══════════════════════════════════════════════════════════════════════════════

function updateLoteSelector() {
  if(!drawingTools) return; var layer=drawingTools.layers().get(0); if(!layer) return;
  var geoms=layer.geometries(),items=[];
  for(var i=0;i<geoms.length();i++) items.push(i<loteNamesGlobal.length?loteNamesGlobal[i]:'Lote Dibujado '+(i+1));
  loteSelector.items().reset(items); if(items.length>0) loteSelector.setValue(items[items.length-1],false);
}

function clearDrawings() {
  if(drawingTools&&drawingTools.layers().length()>0) drawingTools.layers().get(0).geometries().reset();
  if(loteSelector){loteSelector.items().reset([]);loteSelector.setValue(null,false);}
  loteNamesGlobal=[];
}

function clearResults() {
  Map.layers().reset(); if(pointTablePanel)pointTablePanel.clear(); bitacoraData=[]; bitacoraCounter=1;
  if(chartPanel)chartPanel.clear(); if(distributionChartPanel)distributionChartPanel.clear();
  if(zonalResultsPanel)zonalResultsPanel.clear(); if(topographyResultsPanel)topographyResultsPanel.clear(); if(mapLegendPanel)mapLegendPanel.clear();
  if(vraResultPanel)vraResultPanel.clear(); if(vraExportPanel)vraExportPanel.style().set('shown',false);
  [chartOptionsPanel,spatialPanel,zonalPanel,topographyPanel,vraPanel,expPanel,pointInspectionPanel]
    .forEach(function(p){if(p)p.style().set('shown',false);});
  if(gddLabel)gddLabel.setValue(''); if(imagesCountLabel)imagesCountLabel.setValue('');
  clearDrawings(); geometrySelector.setValue('Dibujar en el mapa',true);
  setStatus('Listo.','black');
  lastResult={roi:null,image:null,s2_processed:null,gdd:null,zonal_stats:null,clusteredImage:null,primaryZoneIndex:null,numZones:null,prescriptionFC:null,prescriptionImage:null};
}

function loadAssetsToMap() {
  var id=assetIdTextBox.getValue(); if(!id) return setStatus('Error: Ingrese ID de Asset.','red');
  setStatus('Cargando lotes...','gray');
  var col; if(id.indexOf(',')>-1){var ids=id.split(',').map(function(x){return x.trim();}); col=ee.FeatureCollection(ids.map(function(x){return ee.FeatureCollection(x);})).flatten();} else{col=ee.FeatureCollection(id);}
  col.size().evaluate(function(size){
    if(!size) return setStatus('No se encontraron polígonos.','red');
    col.toList(size).evaluate(function(features){
      clearDrawings(); loteNamesGlobal=[]; var gLayer=drawingTools.layers().get(0);
      features.forEach(function(feat,i){
        gLayer.geometries().add(ee.Geometry(feat.geometry));
        var p=feat.properties||{}; var name=p.Name||p.name||p.Nombre||p.Lote||p.id;
        if(!name){for(var k in p){if(typeof p[k]==='string'&&k!=='system:index'){name=p[k];break;}}}
        loteNamesGlobal.push(name?(i+1)+'. '+name:'Lote '+(i+1));
      });
      updateLoteSelector(); Map.centerObject(col.geometry()); setStatus('Lotes cargados.','blue');
    });
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 6 · BITÁCORA DE CAMPO (sin cambios v5.4.3)
// ═══════════════════════════════════════════════════════════════════════════════

function renderBitacoraTable() {
  if(!pointTablePanel) return; pointTablePanel.clear();
  if(bitacoraData.length===0){pointTablePanel.add(ui.Label('Sin puntos marcados.'));return;}
  var keys=Object.keys(bitacoraData[0]).filter(function(k){return k!=='id'&&k!=='lat'&&k!=='lon';});
  var hdr=[ui.Label('ID',{fontWeight:'bold',width:'20px'}),ui.Label('Lat/Lon',{fontWeight:'bold',width:'100px'})];
  keys.forEach(function(k){hdr.push(ui.Label(k,{fontWeight:'bold',width:'50px',color:'blue'}));});
  pointTablePanel.add(ui.Panel(hdr,ui.Panel.Layout.flow('horizontal')));
  bitacoraData.forEach(function(row){
    var w=[ui.Label(row.id.toString(),{width:'20px'}),ui.Label(row.lat.toFixed(4)+','+row.lon.toFixed(4),{width:'100px',fontSize:'10px',color:'gray'})];
    keys.forEach(function(k){var v=row[k];w.push(ui.Label(v!==null&&v!==undefined?v.toFixed(3):'-',{width:'50px',fontSize:'11px'}));});
    pointTablePanel.add(ui.Panel(w,ui.Panel.Layout.flow('horizontal')));
  });
}

function addColumnToBitacora() {
  if(bitacoraData.length===0||!lastResult.image) return;
  var idx=spatialIndexSelect.getValue()||'NDVI';
  bitacoraData.forEach(function(pt,i){
    lastResult.image.select(idx).reduceRegion({reducer:ee.Reducer.first(),geometry:ee.Geometry.Point([pt.lon,pt.lat]),scale:10}).get(idx).evaluate(function(v){bitacoraData[i][idx]=v;if(i===bitacoraData.length-1)renderBitacoraTable();});
  });
}

function handleMapClick(coords) {
  if(capturePointsCheckbox&&pointTablePanel&&lastResult.image){
    if(!capturePointsCheckbox.getValue()) return;
    var idx=spatialIndexSelect.getValue()||'NDVI', pt=ee.Geometry.Point([coords.lon,coords.lat]);
    lastResult.image.select(idx).reduceRegion({reducer:ee.Reducer.first(),geometry:pt,scale:10}).get(idx).evaluate(function(val){
      var np={id:bitacoraCounter++,lat:coords.lat,lon:coords.lon}; np[idx]=val; bitacoraData.push(np);
      Map.addLayer(pt,{color:'red'},'Punto Inspector',true); bringPointsToFront(); renderBitacoraTable();
    });
  }
}

function exportBitacora() {
  if(bitacoraData.length===0){print('No hay datos.');return;}
  Export.table.toDrive({collection:ee.FeatureCollection(bitacoraData.map(function(d){return ee.Feature(ee.Geometry.Point([d.lon,d.lat]),d);})),description:'Bitacora_Puntos',fileFormat:'CSV'});
}


// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 7 · ANÁLISIS PRINCIPAL — runZonalAnalysis modificado para guardar
//             lastResult.clusteredImage (requerido por motor VRA)
// ═══════════════════════════════════════════════════════════════════════════════

function updateChart() {
  if(!lastResult.s2_processed||!lastResult.roi) return;
  var temporal=[], series={}, n=0;
  var colorMap={'NDVI':'#008000','GNDVI':'#32CD32','EVI':'#006400','SAVI':'#808000','OSAVI':'#556B2F','NDRE':'#FF4500','GCL':'#ADFF2F','ReCL':'#DAA520','ARVI':'#008080','MSAVI2':'#8FBC8F','S2_PRI':'#8B4513','NDMI':'#0000FF','NDWI':'#00FFFF','Kcb':'#4682B4','N_Indicator':'#800080'};
  Object.keys(indexCheckboxes).forEach(function(idx){if(indexCheckboxes[idx].getValue()&&['DEM','Slope'].indexOf(idx)===-1){temporal.push(idx);series[n]={color:colorMap[idx]||'black',lineWidth:2,pointSize:3};n++;}});
  chartPanel.clear();
  if(temporal.length>0) chartPanel.add(ui.Chart.image.series({imageCollection:lastResult.s2_processed.select(temporal),region:lastResult.roi,reducer:ee.Reducer.mean(),scale:30,xProperty:'system:time_start'}).setOptions({title:'Evolución Temporal',vAxis:{title:'Valor'},hAxis:{title:'Fecha'},series:series,interpolateNulls:true}));
}

// ── runZonalAnalysis: MODIFICADO para guardar clusteredImage en lastResult ────
function runZonalAnalysis() {
  if(!lastResult.roi||!lastResult.image) return;
  var primaryIndex=zonalIndexSelect.getValue(), secondaryIndex=secondaryIndexSelect.getValue();
  var numZones=parseInt(numZonesTextbox.getValue(),10);
  if(isNaN(numZones)||numZones<2||numZones>10) return setStatus('N° zonas: 2-10.','red');
  zonalResultsPanel.clear().add(ui.Label('Generando '+numZones+' zonas...'));
  safeRemoveLayer('Zonas');

  var imgToCluster = lastResult.image.select(primaryIndex);
  var training = imgToCluster.sample({region:lastResult.roi,scale:30,numPixels:5000});
  var clusterer = ee.Clusterer.wekaKMeans(numZones).train(training);
  var rawCluster = imgToCluster.cluster(clusterer);
  var clusteredImage = rawCluster.focalMode({radius:25,kernelType:'circle',units:'meters',iterations:1});

  var areaStats = ee.Image.pixelArea().divide(10000).addBands(clusteredImage).reduceRegion({reducer:ee.Reducer.sum().group({groupField:1,groupName:'zone'}),geometry:lastResult.roi,scale:30,maxPixels:1e10});
  var primaryStats = lastResult.image.select(primaryIndex).addBands(clusteredImage).reduceRegion({reducer:ee.Reducer.mean().group({groupField:1,groupName:'zone'}),geometry:lastResult.roi,scale:30,maxPixels:1e10});
  var secondaryStats = lastResult.image.select(secondaryIndex).addBands(clusteredImage).reduceRegion({reducer:ee.Reducer.mean().group({groupField:1,groupName:'zone'}),geometry:lastResult.roi,scale:30,maxPixels:1e10});

  ee.List([areaStats,primaryStats,secondaryStats]).evaluate(function(results){
    zonalResultsPanel.clear();
    var aR=results[0],pR=results[1],sR=results[2];
    if(!aR||!pR||!sR||!aR.groups){zonalResultsPanel.add(ui.Label('Error en estadísticas.'));return;}

    var combined={};
    if(aR.groups) aR.groups.forEach(function(g){if(!combined[g.zone])combined[g.zone]={zone:g.zone};combined[g.zone].area=g.sum;});
    if(pR.groups) pR.groups.forEach(function(g){if(!combined[g.zone])combined[g.zone]={zone:g.zone};combined[g.zone].primaryMean=g.mean;});
    if(sR.groups) sR.groups.forEach(function(g){if(!combined[g.zone])combined[g.zone]={zone:g.zone};combined[g.zone].secondaryMean=g.mean;});

    var finalData=Object.keys(combined).map(function(k){return combined[k];}).filter(function(d){return d.area&&d.primaryMean!==undefined;});
    finalData.sort(function(a,b){return a.primaryMean-b.primaryMean;});

    var fromIds=finalData.map(function(d){return d.zone;});
    var toIds=ee.List.sequence(0,fromIds.length-1).getInfo();
    var remappedImage=clusteredImage.remap(fromIds,toIds);

    safeRemoveLayer('Zonas');
    Map.addLayer(remappedImage.clip(lastResult.roi),{min:0,max:numZones-1,palette:ZONE_PALETTE.slice(0,numZones)},'Zonas ('+primaryIndex+')');

    // ── NUEVO v5.5: guardar en lastResult para uso del motor VRA ──────────────
    // zonal_stats[i] = {zone: origId, area: ha, primaryMean: X, secondaryMean: Y}
    // Tras el remap, la zona i en clusteredImage corresponde a zonal_stats[i].
    // VRA reutiliza estos datos directamente evitando recomputación server-side.
    lastResult.clusteredImage     = remappedImage;
    lastResult.primaryZoneIndex   = primaryIndex;
    lastResult.secondaryZoneIndex = secondaryIndex;  // ← guardado en v5.5.1
    lastResult.numZones           = numZones;
    lastResult.zonal_stats        = finalData;
    // Activar panel VRA una vez que hay zonas disponibles
    if(vraPanel) vraPanel.style().set('shown',true);
    // ──────────────────────────────────────────────────────────────────────────

    var total=finalData.reduce(function(acc,d){return acc+d.area;},0);
    zonalResultsPanel.add(ui.Panel([ui.Label('Zona',{fontWeight:'bold',width:'40px'}),ui.Label('Área (ha)',{fontWeight:'bold',width:'60px'}),ui.Label('% Total',{fontWeight:'bold',width:'50px'}),ui.Label('Prom. '+primaryIndex,{fontWeight:'bold',width:'70px'}),ui.Label('Prom. '+secondaryIndex,{fontWeight:'bold',width:'70px'})],ui.Panel.Layout.flow('horizontal')));
    finalData.forEach(function(d,i){
      zonalResultsPanel.add(ui.Panel([
        ui.Label((i+1).toString(),{width:'40px',backgroundColor:ZONE_PALETTE[i],color:'black',padding:'2px',textAlign:'center'}),
        ui.Label(d.area.toFixed(2),{width:'60px'}),
        ui.Label(((d.area/total)*100).toFixed(1)+'%',{width:'50px'}),
        ui.Label(d.primaryMean.toFixed(3),{width:'70px'}),
        ui.Label(d.secondaryMean.toFixed(3),{width:'70px'})
      ],ui.Panel.Layout.flow('horizontal')));
    });
  });
}

function runSpatialAnalysis() {
  if(!lastResult.roi||!lastResult.image) return;
  var idxName=spatialIndexSelect.getValue(); var params=ACTIVE_INDEX_PARAMS[idxName];
  if(!params||!params.classification){distributionChartPanel.clear().add(ui.Label('Sin clasificación disponible.'));return;}
  var img=lastResult.image; distributionChartPanel.clear().add(ui.Label('Calculando...'));
  safeRemoveLayer('Clasificación');
  var classified=ee.Image(0).byte().rename('classification');
  classified=classified.where(img.select(idxName).lt(params.classification.thresholds[0]),0);
  for(var i=0;i<params.classification.thresholds.length-1;i++) classified=classified.where(img.select(idxName).gte(params.classification.thresholds[i]).and(img.select(idxName).lt(params.classification.thresholds[i+1])),i+1);
  classified=classified.where(img.select(idxName).gte(params.classification.thresholds[params.classification.thresholds.length-1]),params.classification.thresholds.length);
  if(smoothMapCheckbox&&smoothMapCheckbox.getValue()) classified=classified.focalMode({radius:20,kernelType:'circle',units:'meters'});
  Map.addLayer(classified.clip(lastResult.roi),{min:0,max:params.classification.labels.length-1,palette:params.classification.colors},'Clasificación '+idxName,true);
  mapLegendPanel.clear().add(createLegend({title:'Clasif. '+idxName,classification:params.classification}));
  ee.Image.pixelArea().divide(10000).addBands(classified).reduceRegion({reducer:ee.Reducer.sum().group({groupField:1,groupName:'class'}),geometry:lastResult.roi,scale:10,maxPixels:1e10}).evaluate(function(result){
    distributionChartPanel.clear();
    if(!result||!result.groups){distributionChartPanel.add(ui.Label('Sin datos.'));return;}
    var total=result.groups.reduce(function(a,b){return a+b.sum;},0);
    var chartData=[['Clase','Porcentaje',{role:'style'},{role:'annotation'}]];
    result.groups.sort(function(a,b){return a.class-b.class;}).forEach(function(d){
      var lbl=params.classification.labels[d.class],col=params.classification.colors[d.class],pct=((d.sum/total)*100).toFixed(1);
      chartData.push([lbl,parseFloat(pct),col,d.sum.toFixed(1)+' ha']);
    });
    distributionChartPanel.add(new ui.Chart(chartData,'BarChart',{title:'Distribución (%)',legend:{position:'none'}})).add(ui.Label('Total: '+total.toFixed(2)+' ha'));
  });
}

function runTopographicAnalysis() {
  if(!lastResult.roi) return setStatus('Ejecute análisis primero.','red');
  topographyResultsPanel.clear().add(ui.Label('Calculando...'));
  var dem=ee.Image('USGS/SRTMGL1_003').select('elevation');
  dem.reduceRegion({reducer:ee.Reducer.percentile([30,70]),geometry:lastResult.roi,scale:30,maxPixels:1e9}).evaluate(function(q){
    if(!q||q.elevation_p30===null){topographyResultsPanel.clear().add(ui.Label('Error.'));return;}
    var zones=ee.Image(0).where(dem.lt(q.elevation_p30),1).where(dem.gte(q.elevation_p30).and(dem.lt(q.elevation_p70)),2).where(dem.gte(q.elevation_p70),3).rename('zone');
    safeRemoveLayer('Zonas Altitud'); Map.addLayer(zones.clip(lastResult.roi),{min:1,max:3,palette:['#2166AC','#FDDBC7','#B2182B']},'Zonas Altitud',true);
    ee.Image.pixelArea().divide(10000).addBands(zones).reduceRegion({reducer:ee.Reducer.sum().group({groupField:1,groupName:'zone'}),geometry:lastResult.roi,scale:30,maxPixels:1e9}).evaluate(function(result){
      if(!result||!result.groups) return;
      var chartData=[['Zona','Hectáreas']],cols=[],labels={1:'Baja',2:'Media',3:'Alta'},colorMap={1:'#2166AC',2:'#FDDBC7',3:'#B2182B'};
      result.groups.sort(function(a,b){return a.zone-b.zone;}).forEach(function(g){chartData.push([labels[g.zone],g.sum]);cols.push(colorMap[g.zone]);});
      topographyResultsPanel.clear().add(new ui.Chart(chartData,'PieChart',{title:'Distribución Altitud',colors:cols}));
    });
  });
}

function addSlopeLayer(){ if(!lastResult.roi) return; var slope=ee.Terrain.slope(ee.Image('USGS/SRTMGL1_003').select('elevation')); safeRemoveLayer('Pendiente'); Map.addLayer(slope.clip(lastResult.roi),{min:0,max:20,palette:['#31a354','#ffffbf','#bf0303']},'Pendiente',true); }
function addHillshadeLayer(){ if(!lastResult.roi) return; var hs=ee.Terrain.hillshade(ee.Image('USGS/SRTMGL1_003').select('elevation')); safeRemoveLayer('Sombreado'); Map.addLayer(hs.clip(lastResult.roi),{min:150,max:255},'Sombreado',true); }

function expRoiToAsset(){ if(!lastResult.roi) return; Export.table.toDrive({collection:ee.FeatureCollection([ee.Feature(lastResult.roi)]),description:'ROI',fileFormat:'KML'}); }
function expMultiRoiToAsset(){ var g=drawingTools.layers().get(0).geometries(),f=[]; for(var i=0;i<g.length();i++) f.push(ee.Feature(g.get(i))); Export.table.toDrive({collection:ee.FeatureCollection(f),description:'Multi_ROI',fileFormat:'KML'}); }
function expImageToAsset(){ if(!lastResult.image) return; Export.image.toDrive({image:lastResult.image.toFloat(),description:'Image_Indices',scale:10,region:lastResult.roi}); }

function exportHistoricalCSV() {
  if(!lastResult.s2_processed||!lastResult.roi) return setStatus('Ejecute análisis primero.','red');
  var indicesToExport=Object.keys(PARAM_SETS['Estandar']);
  var bands=ee.Image(lastResult.s2_processed.first()).bandNames().filter(ee.Filter.inList('item',indicesToExport));
  var table=lastResult.s2_processed.select(bands).map(function(img){
    var stats=img.reduceRegion({reducer:ee.Reducer.mean(),geometry:lastResult.roi,scale:30,maxPixels:1e9});
    return ee.Feature(null,stats).set('system:time_start',img.date().format('YYYY-MM-dd'));
  });
  bands.evaluate(function(bandList){
    var sel=ee.List(['system:time_start']).cat(bandList);
    sel.evaluate(function(sList){
      Export.table.toDrive({collection:table,description:'Historial_'+(loteSelector.getValue()||'Lote').replace(/[^a-zA-Z0-9]/g,'_'),fileFormat:'CSV',selectors:sList});
      setStatus('CSV histórico enviado a Tasks.','blue');
    });
  });
}

function runAnalysis() {
  setStatus('Obteniendo geometría...','gray');
  var loteSeleccionado=loteSelector.getValue(); if(!loteSeleccionado) return setStatus('Seleccione un lote.','red');
  updateActiveParams();
  var parts=loteSeleccionado.match(/^(\d+)[. ]/);
  var loteIndex=parts?parseInt(parts[1],10)-1:0;
  var geoms=drawingTools.layers().get(0).geometries();
  if(geoms.length()===0||loteIndex>=geoms.length()) return setStatus('Error al obtener lote.','red');
  var roi=geoms.get(loteIndex);
  Map.layers().reset(); Map.addLayer(roi,{color:'yellow',fillColor:'00000000'},'Lote Seleccionado',true);
  if(chartPanel)chartPanel.clear(); if(distributionChartPanel)distributionChartPanel.clear();
  if(zonalResultsPanel)zonalResultsPanel.clear(); if(topographyResultsPanel)topographyResultsPanel.clear();
  if(mapLegendPanel)mapLegendPanel.clear(); if(pointTablePanel)pointTablePanel.clear();
  if(vraResultPanel)vraResultPanel.clear(); if(vraExportPanel)vraExportPanel.style().set('shown',false);
  bitacoraData=[]; bitacoraCounter=1;

  var start=startDateBox.getValue(), end=endDateBox.getValue();
  var fechaSiembra=fechaSiembraTextbox.getValue(), tBase=parseFloat(tBaseTextbox.getValue());
  lastResult.roi=roi; lastResult.clusteredImage=null; lastResult.prescriptionFC=null; lastResult.prescriptionImage=null;
  Map.centerObject(roi,15);
  setStatus('Calculando GDD...','gray');
  calculateGDD(roi,fechaSiembra,end,tBase,estacionAssetTextbox.getValue(),function(gdd){
    lastResult.gdd=gdd; gddLabel.setValue('GDD Acumulado: '+(gdd?gdd.toFixed(0)+' °C·día':'Error'));
  });
  if(gddChartCheckbox.getValue()) generateGddChart(roi,fechaSiembra,end,tBase,estacionAssetTextbox.getValue());

  var s2=ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED').filterBounds(roi).filterDate(start,end).filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
    .map(function(img){
      var qa=img.select('QA60'); var maskQA=qa.bitwiseAnd(1<<10).eq(0).and(qa.bitwiseAnd(1<<11).eq(0));
      var scl=img.select('SCL'); var maskSCL=scl.neq(3).and(scl.neq(8)).and(scl.neq(9)).and(scl.neq(10)).and(scl.neq(11));
      return img.updateMask(maskQA.and(maskSCL)).select('B.*').divide(10000).copyProperties(img,['system:time_start']);
    });

  var s2_daily=createDailyComposites(s2.map(calculateIndices));
  s2_daily.size().evaluate(function(size){
    if(!size) return setStatus('Sin imágenes S2 en el período.','red');
    setStatus('Analizando '+size+' imágenes...','darkgreen');
    var composite=s2_daily.mean().clip(roi);
    lastResult.image=composite; lastResult.s2_processed=s2_daily;
    safeRemoveLayer('DEM'); Map.addLayer(ee.Image('USGS/SRTMGL1_003').select('elevation'),{min:0,max:4000,palette:['006633','FFFFFF']},'DEM',false);
    safeRemoveLayer('DATA_TOTAL_INSPECTOR'); Map.addLayer(composite,{},'DATA_TOTAL_INSPECTOR',true,0);
    composite.bandNames().evaluate(function(names){
      var avail=Object.keys(ACTIVE_INDEX_PARAMS).filter(function(n){return names.indexOf(n)>-1;});
      spatialIndexSelect.items().reset(avail); spatialIndexSelect.setValue('NDVI');
      [chartOptionsPanel,spatialPanel,zonalPanel,topographyPanel,expPanel,pointInspectionPanel]
        .forEach(function(p){if(p)p.style().set('shown',true);});
      // VRA panel se muestra solo después de zonificación (ver runZonalAnalysis)
      updateChart(); runClassificationButton.onClick(runSpatialAnalysis);
      generateCVChart(roi,s2_daily,'NDVI'); setStatus('Listo. Ejecute la Zonificación para acceder al módulo VRA.','green');
      imagesCountLabel.setValue('Imágenes: '+size);
    });
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 8 · MOTOR VRA — PRESCRIPCIÓN VARIABLE   ← COMPLETAMENTE NUEVO v5.5
// ═══════════════════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────────────────────
// runVRAPrescription(): traduce zonas K-Means a dosis variables usando SI.
//
// Flujo:
//   1. Verificar que existan zonas (lastResult.clusteredImage) e imagen.
//   2. Obtener parámetros del cultivo e insumo seleccionados (CROP_PARAMS).
//   3. Calcular valor de referencia del lote: percentil 95 del índice de referencia
//      (refleja la "zona más sana" del lote = 100% suficiente).
//   4. Calcular media del índice por zona (grouped reduceRegion).
//   5. Para cada zona, calcular SI = media_zona / referencia_lote.
//   6. Asignar dosis según SI y parámetros del insumo (interpolación lineal).
//   7. Crear imagen de prescripción mediante remap(zonaIds → dosis).
//   8. Vectorizar zones para exportación Shapefile.
//   9. Mostrar mapa de dosis y tabla de resultados en UI.
// ──────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────
// buildPrescriptionFromGroups(): construye el mapa, la tabla y el FC de export
// a partir de un array de grupos {zone, val} y un valor de referencia p95Val.
// Separado de runVRAPrescription para que ambas rutas (fast/fallback) lo llamen.
// ──────────────────────────────────────────────────────────────────────────────


// ──────────────────────────────────────────────────────────────────────────────
// runVRAPrescription(): punto de entrada del motor VRA.
//
// ARQUITECTURA DE 3 RUTAS — elimina el grouped reduceRegion problemático:
//
//   Ruta 1 (FAST) — índice VRA = índice primario de zonificación
//     → zonal_stats[i].primaryMean ya tiene el dato; 0 llamadas server-side.
//     Ej: zonificó con NDRE, prescribe Nitrógeno (usa NDRE) → RUTA 1.
//
//   Ruta 2 (FAST) — índice VRA = índice secundario de zonificación
//     → zonal_stats[i].secondaryMean ya tiene el dato; 0 llamadas server-side.
//     Ej: zonificó con NDRE+Kcb, prescribe Agua (usa Kcb) → RUTA 2.
//
//   Ruta 3 (FALLBACK) — índice VRA diferente a ambos índices de zonificación
//     → un solo reduceRegion con mean().group(); sin la consulta P95 separada.
//     P95 se aproxima con max(medias zonales), suficientemente preciso.
//     Ej: zonificó con NDVI, prescribe Fungicida (usa NDMI) → RUTA 3.
//
// CAUSA RAÍZ DEL BUG "NDRE no encontrado":
//   El grouped reduceRegion sobre refImage+zoneImage falla silenciosamente
//   cuando zoneImage tiene tipo Float (del remap) y el P95 de la consulta
//   paralela devuelve null. La evaluación de ee.List trae results no nulos
//   pero results[0]['NDRE_p95'] = null → trigger del error falso.
//   Solución: evitar toda recomputación server-side cuando los datos ya existen.
// ──────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 8 · CONSTRUCTOR DE PRESCRIPCIÓN VRA CON ESTRATEGIA DINÁMICA (FIX)
// ═══════════════════════════════════════════════════════════════════════════════

function buildPrescriptionFromGroups(zGroups, p95Val, idxRef, insumoP, cropType, inputType) {
  try {
    var zoneIds = [], dosisVals = [], prescData = [];
    var zoneImage = lastResult.clusteredImage.clip(lastResult.roi).toInt();
    
    // Lectura de la estrategia seleccionada en la UI
    var estrategia = vraStrategySelect.getValue();

    zGroups.forEach(function(zg) {
      var idxMean = (zg['val'] !== undefined && zg['val'] !== null) ? zg['val'] : 0;
      
      // 1. CÁLCULO DEL SUFFICIENCY INDEX (DECLARACIÓN GLOBAL AL BUCLE)
      // Evita el error 'si is not defined'
      var si = Math.min(idxMean / p95Val, 1.0);
      var dose;

      // 2. APLICACIÓN DE ESTRATEGIA AGRONÓMICA
      if(insumoP.invert) {
        // Para índices inversos (ej. NDMI en Fungicida: a mayor humedad, mayor dosis)
        dose = insumoP.dosis_min + si * (insumoP.dosis_max - insumoP.dosis_min);
      } else {
        if (estrategia === 'Proporcional (Potencial productivo)') {
          // Mayor vigor/potencial (mayor SI) -> Mayor dosis aplicada
          dose = insumoP.dosis_min + si * (insumoP.dosis_max - insumoP.dosis_min);
        } else {
          // Estrategia Compensatoria (Holland & Schepers: corregir déficit)
          if (si >= insumoP.si_umbral) {
            dose = insumoP.dosis_min;
          } else {
            var deficit = (insumoP.si_umbral - si) / insumoP.si_umbral;
            dose = insumoP.dosis_min + deficit * (insumoP.dosis_max - insumoP.dosis_min);
          }
        }
      }
      
      // Ajuste de límites y redondeo
      dose = Math.max(insumoP.dosis_min, Math.min(insumoP.dosis_max, Math.round(dose * 10) / 10));

      var manejo = si >= insumoP.si_umbral        ? 'Suficiente'       :
                   si >= insumoP.si_umbral * 0.80 ? 'Leve déficit'     :
                   si >= insumoP.si_umbral * 0.60 ? 'Déficit moderado' : 'Déficit alto';

      zoneIds.push(parseInt(zg.zone, 10));
      dosisVals.push(parseFloat(dose));
      prescData.push({zona: parseInt(zg.zone, 10) + 1, si: si, idx_mean: idxMean, dosis: dose, manejo: manejo});
    });

    // Remap con casteo explícito a ee.List
    var prescImage = zoneImage.remap({
      from: ee.List(zoneIds),
      to: ee.List(dosisVals)
    }).rename('dosis').toFloat();
    
    lastResult.prescriptionImage = prescImage;

    var minD = Math.min.apply(null, dosisVals);
    var maxD = Math.max.apply(null, dosisVals);
    safeRemoveLayer('Prescripción');
    
    Map.addLayer(
      prescImage.clip(lastResult.roi),
      {min: minD, max: maxD, palette: VRA_PALETTE},
      'Prescripción VRA — ' + inputType + ' (' + insumoP.unidad + ')'
    );

    mapLegendPanel.clear()
      .add(ui.Label('VRA: ' + inputType + ' (' + estrategia.split(' ')[0] + ')', {fontWeight:'bold', color:'#7d1a1a'}))
      .add(createColorBar({min: minD, max: maxD, palette: VRA_PALETTE}))
      .add(ui.Label(minD + ' → ' + maxD + ' ' + insumoP.unidad, {fontSize:'10px', color:'gray'}));

    // Vectorización optimizada para exportación
    var todayStr = new Date().toISOString().split('T')[0];
    var doseDict = ee.Dictionary.fromLists(
      zoneIds.map(function(z){ return ee.Number(z).toInt().format('%d'); }),
      dosisVals
    );

    var zoneVectors = zoneImage.reduceToVectors({
      geometry: lastResult.roi,
      crs: 'EPSG:32719',
      scale: 10,
      geometryType: 'polygon',
      eightConnected: false,
      labelProperty: 'zone_id',
      reducer: ee.Reducer.countEvery(),
      maxPixels: 1e9,
      bestEffort: true
    });

   // ASIGNACIÓN LIMPIA DE ESTRATEGIA (Máximo 10 caracteres para .DBF)
var codEstrategia = (estrategia.indexOf('Proporcional') > -1) ? 'PROPORC' : 'COMPENS';

lastResult.prescriptionFC = zoneVectors.map(function(feat) {
  var zId = ee.Number(feat.get('zone_id')).toInt();
  var areaHa = ee.Number(feat.geometry().area(1)).divide(10000); 

  return feat.set({
    'zona_id':   zId.add(1),
    'cultivo':   cropType.substring(0, 10),
    'insumo':    inputType.substring(0, 10),
    'unidad':    insumoP.unidad.substring(0, 10),
    'dosis':     ee.Number(doseDict.get(zId.format('%d'))),
    'idx_ref':   idxRef,
    'fecha':     todayStr,
    'estrateg':  codEstrategia, // Escribe estrictamente 'COMPENS' o 'PROPORC'
    'area_ha':   areaHa
  });
});

    // Renderizado en la interfaz de usuario
    vraResultPanel.clear();
    vraResultPanel.add(ui.Label(
      '▌ Prescripción ' + cropType + ' — ' + inputType,
      {fontWeight:'bold', color:'#7d1a1a', fontSize:'13px'}
    ));
    vraResultPanel.add(ui.Label(
      'Estrategia: ' + estrategia,
      {fontSize:'10px', color:'#7d1a1a', fontWeight:'bold'}
    ));
    vraResultPanel.add(ui.Label(
      'Índice: ' + idxRef + '  |  Ref. P95≈max: ' + p95Val.toFixed(3) + '  |  SI umbral: ' + insumoP.si_umbral,
      {fontSize:'10px', color:'gray', margin:'0 0 4px 0'}
    ));
    
    vraResultPanel.add(ui.Panel([
      ui.Label('Zona', {fontWeight:'bold', width:'38px'}),
      ui.Label('SI',   {fontWeight:'bold', width:'48px'}),
      ui.Label(idxRef, {fontWeight:'bold', width:'52px'}),
      ui.Label('Dosis',{fontWeight:'bold', width:'70px', color:'#7d1a1a'}),
      ui.Label('Estado',{fontWeight:'bold',width:'90px'})
    ], ui.Panel.Layout.flow('horizontal')));

    prescData.sort(function(a,b){ return a.zona - b.zona; }).forEach(function(d, i) {
      vraResultPanel.add(ui.Panel([
        ui.Label(d.zona.toString(),
          {backgroundColor:ZONE_PALETTE[i%ZONE_PALETTE.length], color:'white',
           width:'38px', textAlign:'center', padding:'2px'}),
        ui.Label(d.si.toFixed(3),       {width:'48px'}),
        ui.Label(d.idx_mean.toFixed(3), {width:'52px'}),
        ui.Label(d.dosis + ' ' + insumoP.unidad,
          {width:'70px', fontWeight:'bold', color:'#7d1a1a'}),
        ui.Label(d.manejo, {width:'90px', fontSize:'10px', color:'gray'})
      ], ui.Panel.Layout.flow('horizontal')));
    });

    var prom = (dosisVals.reduce(function(a,b){return a+b;},0)/dosisVals.length).toFixed(1);
    vraResultPanel.add(ui.Label(
      'Promedio: ' + prom + ' ' + insumoP.unidad + '/ha  |  Rango: ' + minD + '–' + maxD,
      {fontSize:'10px', color:'#555', margin:'4px 0 0 0'}
    ));

    vraExportPanel.style().set('shown', true);
    setStatus('✓ Prescripción ' + estrategia.split(' ')[0] + ' calculada correctamente.', 'green');

  } catch(e) {
    vraResultPanel.clear().add(ui.Label('⚠ Error: ' + e.message, {color:'red'}));
    setStatus('Error VRA: ' + e.message, 'red');
  }
}

function runVRAPrescription() {
  if(!lastResult.roi || !lastResult.image || !lastResult.clusteredImage) {
    vraResultPanel.clear().add(ui.Label(
      '⚠ Primero ejecute la Zonificación (Paso 6).', {color:'#7d1a1a', fontWeight:'bold'}
    ));
    return setStatus('VRA: ejecute Zonificación antes.', 'red');
  }

  var cropType  = vraCropSelect.getValue();
  var inputType = vraInputSelect.getValue();
  var cropP     = CROP_PARAMS[cropType];
  if(!cropP || !cropP.insumos[inputType]) return setStatus('Combinación no calibrada.','red');

  var insumoP  = cropP.insumos[inputType];
  var idxRef   = insumoP.indice;
  var existing = lastResult.zonal_stats;
  var priIdx   = lastResult.primaryZoneIndex;
  var secIdx   = lastResult.secondaryZoneIndex;

  vraResultPanel.clear().add(ui.Label('⏳ Preparando...', {color:'blue'}));
  vraExportPanel.style().set('shown', false);

  // ════════════════════════════════════════════════════════════════════════════
  // RUTA 1 — índice VRA coincide con el índice PRIMARIO de zonificación
  // ════════════════════════════════════════════════════════════════════════════
  if(existing && existing.length > 0 && priIdx === idxRef) {
    setStatus('Prescripción VRA con ' + idxRef + ' (ruta directa desde Zonificación).', 'blue');

    var zGroups1 = existing.map(function(d, i) {
      return {zone: i, val: d.primaryMean};
    });
    // P95 ≈ máximo de medias zonales (la "zona más sana" del lote)
    var p95_1 = Math.max.apply(null, existing.map(function(d){ return d.primaryMean || 0; }));
    buildPrescriptionFromGroups(zGroups1, p95_1, idxRef, insumoP, cropType, inputType);

  // ════════════════════════════════════════════════════════════════════════════
  // RUTA 2 — índice VRA coincide con el índice SECUNDARIO de zonificación
  // ════════════════════════════════════════════════════════════════════════════
  } else if(existing && existing.length > 0 && secIdx === idxRef) {
    setStatus('Prescripción VRA con ' + idxRef + ' (ruta directa desde índice secundario).', 'blue');

    var zGroups2 = existing.map(function(d, i) {
      return {zone: i, val: d.secondaryMean};
    });
    var p95_2 = Math.max.apply(null, existing.map(function(d){ return d.secondaryMean || 0; }));
    buildPrescriptionFromGroups(zGroups2, p95_2, idxRef, insumoP, cropType, inputType);

  // ════════════════════════════════════════════════════════════════════════════
  // RUTA 3 — índice diferente: un solo reduceRegion, sin P95 separado
  // ════════════════════════════════════════════════════════════════════════════
  } else {
    setStatus('Calculando estadísticas de ' + idxRef + ' por zona (15-30 seg)...', 'blue');
    vraResultPanel.clear().add(ui.Label(
      '⏳ Calculando por zona — índice "' + idxRef +
      '" no estaba en la Zonificación. Espere...', {color:'blue'}
    ));

    var zoneImage3 = lastResult.clusteredImage.toInt();
    // Una sola consulta: mean por zona (sin P95 separado para evitar doble fallo)
    lastResult.image.select(idxRef).rename('val')
      .addBands(zoneImage3.rename('zone'))
      .reduceRegion({
        reducer:    ee.Reducer.mean().group({groupField: 1, groupName: 'zone'}),
        geometry:   lastResult.roi,
        scale:      30,
        maxPixels:  1e10,
        bestEffort: true,
        tileScale:  4
      })
      .evaluate(function(result, error) {
        try {
          if(error) throw new Error(error);
          if(!result || !result.groups || !result.groups.length) {
            throw new Error('Sin grupos. Verifique que "' + idxRef + '" existe en la imagen.');
          }
          var groups3 = result.groups.map(function(g) {
            return {zone: g.zone, val: g['val'] !== undefined ? g['val'] : (g['mean'] || 0)};
          });
          // P95 ≈ max de medias zonales
          var p95_3 = Math.max.apply(null, groups3.map(function(g){ return g.val; }));
          buildPrescriptionFromGroups(groups3, p95_3, idxRef, insumoP, cropType, inputType);
        } catch(e) {
          vraResultPanel.clear().add(ui.Label('⚠ Error: ' + e.message, {color:'red'}));
          setStatus('Error VRA (Ruta 3): ' + e.message, 'red');
        }
      });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// EXPORTACIÓN DE PRESCRIPCIÓN — 3 FORMATOS
// Compatible: John Deere Operations Center, AGCO AFS Connect, CNH iXDrive
// ──────────────────────────────────────────────────────────────────────────────

function exportPrescriptionSHP() {
  if(!lastResult.prescriptionFC) return setStatus('Genere primero la prescripción VRA.','red');
  var cropType  = vraCropSelect.getValue().replace(/[^a-zA-Z0-9]/g,'_');
  var inputType = vraInputSelect.getValue().replace(/[^a-zA-Z0-9]/g,'_');
  
  // Repara topologías inválidas mediante buffer(0) y filtra nulos
  var cleanFC = lastResult.prescriptionFC.map(function(f) {
    return f.setGeometry(f.geometry().buffer(0, 1));
  }).filter(ee.Filter.notNull(['dosis']));

  Export.table.toDrive({
    collection:  cleanFC,
    description: 'PRESC_SHP_' + cropType + '_' + inputType,
    fileFormat:  'SHP'
  });
  setStatus('SHP enviado a Tasks. Recuerde descomprimir el ZIP completo.', 'green');
}

function exportPrescriptionGeoTIFF() {
  if(!lastResult.prescriptionImage||!lastResult.roi) return setStatus('Genere primero la prescripción VRA.','red');
  var cropType  = vraCropSelect.getValue().replace(/[^a-zA-Z0-9]/g,'_');
  var inputType = vraInputSelect.getValue().replace(/[^a-zA-Z0-9]/g,'_');
  Export.image.toDrive({
    image:       lastResult.prescriptionImage.clip(lastResult.roi),
    description: 'PRESC_RASTER_' + cropType + '_' + inputType,
    scale:       10,
    region:      lastResult.roi,
    crs:         'EPSG:32719',   // UTM zona 19S — Chile central
    maxPixels:   1e10
  });
  setStatus('GeoTIFF EPSG:32719 enviado a Tasks. 1 banda = dosis en ' + CROP_PARAMS[vraCropSelect.getValue()].insumos[vraInputSelect.getValue()].unidad + '.', 'green');
}

function exportPrescriptionCSV() {
  if(!lastResult.prescriptionFC) return setStatus('Genere primero la prescripción VRA.','red');
  var cropType  = vraCropSelect.getValue().replace(/[^a-zA-Z0-9]/g,'_');
  var inputType = vraInputSelect.getValue().replace(/[^a-zA-Z0-9]/g,'_');
  Export.table.toDrive({
    collection:  lastResult.prescriptionFC,
    description: 'PRESC_CSV_' + cropType + '_' + inputType,
    fileFormat:  'CSV',
    selectors:   ['zona_id','cultivo','insumo','unidad','dosis_recom','idx_ref','fecha_presc','metodo','area_ha']
  });
  setStatus('CSV logístico enviado a Tasks. Incluye zona, dosis y área por zona.', 'green');
}

// Actualiza la lista de insumos según el cultivo seleccionado
function updateVRAInputs() {
  var cropType = vraCropSelect.getValue();
  var cropP    = CROP_PARAMS[cropType];
  if(!cropP) return;
  var insumos  = Object.keys(cropP.insumos);
  vraInputSelect.items().reset(insumos);
  vraInputSelect.setValue(insumos[0]);
  updateVRADesc();
}

function updateVRADesc() {
  var cropType  = vraCropSelect.getValue();
  var inputType = vraInputSelect.getValue();
  var cropP     = CROP_PARAMS[cropType];
  if(!cropP||!cropP.insumos[inputType]) return;
  var p = cropP.insumos[inputType];
  vraDescLabel.setValue('Índice: ' + p.indice + '  |  SI umbral: ' + p.si_umbral + '  |  Dosis: ' + p.dosis_min + '–' + p.dosis_max + ' ' + p.unidad + '\n' + p.desc);
}



// ═══════════════════════════════════════════════════════════════════════════════
// SECCIÓN 9 · INTERFAZ DE USUARIO — CORRECCIÓN DEFINITIVA DE UI (VRA FIX)
// ═══════════════════════════════════════════════════════════════════════════════

function initializeApp() {
  var mainPanel = ui.Panel({style:{width:'410px',padding:'10px'}}); 
  ui.root.insert(0, mainPanel);

  mapLegendPanel = ui.Panel({style:{position:'bottom-right',padding:'8px 15px',border:'1px solid black'}}); 
  Map.add(mapLegendPanel); 
  Map.onClick(handleMapClick);

  // ── Encabezado ──────────────────────────────────────────────────────────────
  mainPanel.add(ui.Label('Analizador Agrícola 4.0 · v5.6.0 VRA', {fontWeight:'bold',fontSize:'20px'}));
  mainPanel.add(ui.Label('VRA Edition — Prescripción Variable + Sufficiency Index', {fontSize:'11px',color:'gray'}));
  statusLabel = ui.Label('Listo.'); 
  mainPanel.add(statusLabel);

  // ── 0. Calibración ──────────────────────────────────────────────────────────
  calibrationSelector = ui.Select({
    items:['Estándar (Sur/Centro Chile)','Árido/Frutales (Norte/Perú)'],
    value:'Estándar (Sur/Centro Chile)',
    style:{stretch:'horizontal',margin:'10px 0'}
  });
  mainPanel.add(ui.Label('0. Configuración Regional',{fontWeight:'bold'})).add(calibrationSelector);

  // ── 1. Selección de Lote ────────────────────────────────────────────────────
  mainPanel.add(ui.Label('1. Selección de Lote',{fontWeight:'bold'}));
  assetIdTextBox = ui.Textbox({placeholder:'Asset ID',style:{stretch:'horizontal',shown:false}});
  loteSelector   = ui.Select({placeholder:'Lotes',style:{stretch:'horizontal'}});
  drawingTools   = Map.drawingTools(); 
  drawingTools.setShown(true);
  while(drawingTools.layers().length()>0) drawingTools.layers().remove(drawingTools.layers().get(0));
  drawingTools.layers().add(ui.Map.GeometryLayer({geometries:null,name:'ROI_dibujado',color:'yellow'}));
  drawingTools.onDraw(updateLoteSelector); 
  drawingTools.onEdit(updateLoteSelector); 
  drawingTools.onErase(updateLoteSelector);
  
  var loadBtn = ui.Button({label:'Cargar Lotes',onClick:loadAssetsToMap,style:{stretch:'horizontal',shown:false}});
  geometrySelector = ui.Select({
    items:['Dibujar en el mapa','Importar desde Asset'], value:'Dibujar en el mapa',
    onChange:function(v){
      var d=v==='Dibujar en el mapa';
      assetIdTextBox.style().set('shown',!d);
      loadBtn.style().set('shown',!d);
      drawingTools.setShape(d?'polygon':null);
    },
    style:{stretch:'horizontal'}
  });
  mainPanel.add(geometrySelector)
           .add(ui.Panel([assetIdTextBox,loadBtn],ui.Panel.Layout.flow('horizontal')))
           .add(ui.Panel([ui.Label('Lote:'),loteSelector],ui.Panel.Layout.flow('horizontal')));

  // ── 2. Parámetros GDD ───────────────────────────────────────────────────────
  mainPanel.add(ui.Label('2. Parámetros GDD y Fechas',{fontWeight:'bold'}));
  fechaSiembraTextbox = ui.Textbox({value:'2023-09-01',style:{stretch:'horizontal'}});
  tBaseTextbox        = ui.Textbox({value:'10',style:{width:'50px'}});
  estacionAssetTextbox= ui.Textbox({placeholder:'Asset Estación (Opcional)',style:{stretch:'horizontal'}});
  gddChartCheckbox    = ui.Checkbox('Gráfico GDD en Consola',false);
  gddLabel            = ui.Label('',{fontWeight:'bold',color:'darkblue'});
  startDateBox        = ui.Textbox({value:'2024-11-01',style:{stretch:'horizontal'}});
  endDateBox          = ui.Textbox({value:'2025-11-20',style:{stretch:'horizontal'}});
  
  mainPanel.add(ui.Panel([ui.Label('Siembra:'),fechaSiembraTextbox,ui.Label('T°Base:'),tBaseTextbox],ui.Panel.Layout.flow('horizontal')));
  mainPanel.add(estacionAssetTextbox).add(gddChartCheckbox).add(gddLabel);
  mainPanel.add(ui.Panel([ui.Label('Inicio:'),startDateBox,ui.Label('Fin:'),endDateBox],ui.Panel.Layout.flow('horizontal')));

  // ── 3. Ejecutar Análisis ────────────────────────────────────────────────────
  mainPanel.add(ui.Button({label:'▶ Ejecutar Análisis',onClick:runAnalysis,style:{stretch:'horizontal',backgroundColor:'#90EE90'}}));
  imagesCountLabel = ui.Label('',{fontWeight:'bold',color:'#0b5394'});
  mainPanel.add(imagesCountLabel);

  // ── 4. Gráficos ─────────────────────────────────────────────────────────────
  var cbPanel=ui.Panel({layout:ui.Panel.Layout.flow('horizontal',true)});
  Object.keys(PARAM_SETS['Estandar']).forEach(function(n){
    var cb=ui.Checkbox(n,false);
    indexCheckboxes[n]=cb;
    cbPanel.add(cb);
  });
  chartOptionsPanel=ui.Panel({widgets:[ui.Label('4. Gráfico Temporal',{fontWeight:'bold'}),cbPanel,ui.Button({label:'Actualizar Gráfico',onClick:updateChart})],style:{shown:false}});
  chartPanel=ui.Panel();

  // ── 5. Mapa y Clasificación ──────────────────────────────────────────────────
  spatialIndexSelect     = ui.Select({items:[],style:{stretch:'horizontal'}});
  runClassificationButton= ui.Button({label:'Clasificar',onClick:runSpatialAnalysis});
  distributionChartPanel = ui.Panel();
  dynamicStretchCheck    = ui.Checkbox('Estiramiento Dinámico',true);
  smoothMapCheckbox      = ui.Checkbox('Suavizar Mapa',false);
  spatialPanel=ui.Panel({widgets:[
    ui.Label('5. Mapa y Clasificación',{fontWeight:'bold'}),spatialIndexSelect,
    ui.Panel([dynamicStretchCheck,smoothMapCheckbox],ui.Panel.Layout.flow('horizontal')),
    ui.Panel([ui.Button({label:'Ver Mapa',onClick:function(){updateMapIndexLayer(spatialIndexSelect.getValue());}}),runClassificationButton],ui.Panel.Layout.flow('horizontal')),
    distributionChartPanel
  ],style:{shown:false}});

  // ── 6. Zonificación ─────────────────────────────────────────────────────────
  var checkKeys=Object.keys(PARAM_SETS['Estandar']);
  zonalIndexSelect    = ui.Select({items:checkKeys,value:'NDVI'});
  secondaryIndexSelect= ui.Select({items:checkKeys,value:'Kcb'});
  numZonesTextbox     = ui.Textbox({value:'3',style:{width:'50px'}});
  zonalResultsPanel   = ui.Panel();
  zonalPanel=ui.Panel({widgets:[
    ui.Label('6. Zonificación',{fontWeight:'bold'}),
    ui.Panel([ui.Label('Índice:'),zonalIndexSelect,ui.Label('Zonas:'),numZonesTextbox],ui.Panel.Layout.flow('horizontal')),
    ui.Panel([ui.Label('2do Índice:'),secondaryIndexSelect,ui.Button({label:'Zonificar',onClick:runZonalAnalysis})],ui.Panel.Layout.flow('horizontal')),
    zonalResultsPanel
  ],style:{shown:false}});

  // ── 7. Topografía ───────────────────────────────────────────────────────────
  topographyResultsPanel=ui.Panel();
  topographyPanel=ui.Panel({widgets:[
    ui.Label('7. Topografía',{fontWeight:'bold'}),
    ui.Panel([ui.Button('Altitud',runTopographicAnalysis),ui.Button('Pendiente',addSlopeLayer),ui.Button('Sombreado',addHillshadeLayer)],ui.Panel.Layout.flow('horizontal')),
    topographyResultsPanel
  ],style:{shown:false}});

  // ── 8. PRESCRIPCIÓN VARIABLE (VRA) — SECUENCIA DE INSTANCIACIÓN SEGURA ──────
  // Paso A: Crear etiquetas y paneles de resultados
  vraDescLabel   = ui.Label('', {fontSize:'10px', color:'#555', fontStyle:'italic'});
  vraResultPanel = ui.Panel();

  // Paso B: Crear panel de exportación
  vraExportPanel = ui.Panel({
    widgets: [
      ui.Label('Exportar Prescripción:', {fontWeight:'bold', fontSize:'11px'}),
      ui.Button({
        label: '📁 Shapefile (.shp) — JD Operations Center / AFS Connect',
        onClick: exportPrescriptionSHP,
        style: {stretch:'horizontal', backgroundColor:'#1a5276', color:'white'}
      }),
      ui.Button({
        label: '🗺 GeoTIFF (EPSG:32719) — Raster continuo de dosis',
        onClick: exportPrescriptionGeoTIFF,
        style: {stretch:'horizontal', backgroundColor:'#145a32', color:'white'}
      }),
      ui.Button({
        label: '📊 CSV logístico — Dosis por zona + área',
        onClick: exportPrescriptionCSV,
        style: {stretch:'horizontal', backgroundColor:'#7d6608', color:'white'}
      })
    ],
    style: {shown: false}
  });

  // Paso C: Instanciar los Selectores como ui.Widget válidos ANTES de usarlos en paneles
  vraCropSelect = ui.Select({
    items: Object.keys(CROP_PARAMS), 
    value: 'Trigo', 
    onChange: updateVRAInputs, 
    style: {stretch: 'horizontal'}
  });

  vraInputSelect = ui.Select({
    items: ['Nitrógeno', 'Agua (Kcb)', 'Fungicida'], 
    value: 'Nitrógeno', 
    onChange: updateVRADesc, 
    style: {stretch: 'horizontal'}
  });

  vraStrategySelect = ui.Select({
    items: ['Compensatoria (Corregir déficit)', 'Proporcional (Potencial productivo)'],
    value: 'Compensatoria (Corregir déficit)',
    style: {stretch: 'horizontal'}
  });

  // Paso D: Crear los contenedores de fila horizontales
  var cropRow     = ui.Panel([ui.Label('Cultivo:', {width:'65px'}), vraCropSelect], ui.Panel.Layout.flow('horizontal'));
  var inputRow    = ui.Panel([ui.Label('Insumo:', {width:'65px'}), vraInputSelect], ui.Panel.Layout.flow('horizontal'));
  var strategyRow = ui.Panel([ui.Label('Estrategia:', {width:'65px'}), vraStrategySelect], ui.Panel.Layout.flow('horizontal'));

  // Paso E: Ensamblar el panel VRA completo
  vraPanel = ui.Panel({
    widgets: [
      ui.Label('8. Prescripción Variable (VRA)', {fontWeight:'bold', color:'#7d1a1a', fontSize:'14px'}),
      ui.Panel([
        ui.Label('⚠ Requiere completar Zonificación (Paso 6)', {fontSize:'10px', color:'#7d1a1a'})
      ], null, {backgroundColor:'#fff5f5', padding:'3px', margin:'0 0 4px 0'}),
      cropRow,
      inputRow,
      strategyRow,
      vraDescLabel,
      ui.Button({
        label: '⚙ Generar Mapa de Prescripción VRA',
        onClick: runVRAPrescription,
        style: {stretch:'horizontal', backgroundColor:'#7d1a1a', color:'white', fontWeight:'bold', margin:'4px 0'}
      }),
      vraResultPanel,
      vraExportPanel
    ],
    style: {shown: false, border: '1px solid #7d1a1a', padding: '5px', margin: '5px 0'}
  });

  // ── 9. Exportar ─────────────────────────────────────────────────────────────
  expFolderPathTextBox = ui.Textbox({placeholder:'users/...',style:{stretch:'horizontal'}});
  expRoiNameTextBox    = ui.Textbox({placeholder:'nombre_lote',style:{stretch:'horizontal'}});
  expAssetNameTextBox  = ui.Textbox({placeholder:'nombre_imagen',style:{stretch:'horizontal'}});
  expPanel = ui.Panel({widgets:[
    ui.Label('9. Exportar (Índices)',{fontWeight:'bold'}),
    expFolderPathTextBox, expRoiNameTextBox,
    ui.Panel([ui.Button('Exp. Lote',expRoiToAsset),ui.Button('Exp. Todos',expMultiRoiToAsset)],ui.Panel.Layout.flow('horizontal')),
    expAssetNameTextBox, ui.Button('Exp. Imagen',expImageToAsset),
    ui.Button({label:'📊 Exportar Historial Completo (CSV)',onClick:exportHistoricalCSV,style:{stretch:'horizontal',backgroundColor:'#add8e6',fontWeight:'bold'}})
  ],style:{shown:false}});

  // ── 10. Bitácora ─────────────────────────────────────────────────────────────
  capturePointsCheckbox = ui.Checkbox({label:'Capturar Puntos',value:false});
  pointTablePanel       = ui.Panel({style:{border:'1px solid gray',padding:'5px'}});
  clearPointsButton     = ui.Button('Borrar Tabla',function(){
    pointTablePanel.clear();
    bitacoraData=[];
    bitacoraCounter=1;
    Map.layers().forEach(function(l){if(l.getName()==='Punto Inspector')Map.remove(l);});
  });
  exportPointsButton    = ui.Button('Exportar CSV',exportBitacora);
  pointInspectionPanel  = ui.Panel({widgets:[
    ui.Label('10. Bitácora',{fontWeight:'bold'}),capturePointsCheckbox,pointTablePanel,
    ui.Panel([clearPointsButton,exportPointsButton],ui.Panel.Layout.flow('horizontal'))
  ],style:{shown:false}});

  var clearButton = ui.Button({label:'🗑 Limpiar Todo',onClick:clearResults,style:{stretch:'horizontal',backgroundColor:'#FFDDDD'}});

  // ── Agregar subpaneles al panel principal ──────────────────────────────────
  mainPanel.add(chartOptionsPanel);
  mainPanel.add(chartPanel);
  mainPanel.add(spatialPanel);
  mainPanel.add(zonalPanel);
  mainPanel.add(topographyPanel);
  mainPanel.add(vraPanel);
  mainPanel.add(expPanel);
  mainPanel.add(pointInspectionPanel);
  mainPanel.add(clearButton);

  Map.setCenter(-71.0, -33.0, 9);
  geometrySelector.setValue('Dibujar en el mapa', true);

  updateVRADesc();

  print('✓ Analizador Agrícola 4.0 v5.5.0 VRA cargado.');
}

ee.Number(1).evaluate(initializeApp);
