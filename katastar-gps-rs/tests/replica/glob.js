import Map from 'ol/Map'; import View from 'ol/View'; import TileLayer from 'ol/layer/Tile'; import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector'; import XYZ from 'ol/source/XYZ'; import TileWMS from 'ol/source/TileWMS'; import Feature from 'ol/Feature';
import Point from 'ol/geom/Point'; import Circle from 'ol/geom/Circle'; import Polygon from 'ol/geom/Polygon';
import { Style, Fill, Stroke, Circle as CircleStyle, Icon, RegularShape } from 'ol/style';
import { transform, get } from 'ol/proj'; import { register } from 'ol/proj/proj4'; import proj4 from 'proj4';
window.proj4 = proj4;
proj4.defs('EPSG:31276', '+proj=tmerc +lat_0=0 +lon_0=18 +k=0.9999 +x_0=6500000 +y_0=0 +ellps=bessel +towgs84=550.499,164.116,475.142,5.80917,2.07682,-11.62386,0.99496 +units=m +no_defs');
register(proj4);
window.ol = { Map, View, layer: { Tile: TileLayer, Vector: VectorLayer }, source: { Vector: VectorSource, XYZ, TileWMS }, Feature, geom: { Point, Circle, Polygon },
  style: { Style, Fill, Stroke, Circle: CircleStyle, Icon, RegularShape }, proj: { transform, get } };
window.map = new Map({ target: 'm', layers: [], view: new View({ projection: 'EPSG:31276', center: [6508386, 4942511], zoom: 9 }) });
