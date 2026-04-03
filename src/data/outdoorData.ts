import type { IslandId } from '../services/aemet'

// ── SURF ──────────────────────────────────────────────────────────────────

export type SurfLevel = 'principiante' | 'intermedio' | 'avanzado' | 'todos'
export type BreakType  = 'playa' | 'arrecife' | 'punta'

export interface SurfSpot {
  id: string
  name: string
  island: IslandId
  lat: number
  lon: number
  breakType: BreakType
  level: SurfLevel
  /** Dirección a la que mira la playa (grados). El viento offshore llega del lado opuesto. */
  facingDir: number
  /** Rango de dirección de swell óptimo [desde, hasta] en grados */
  swellWindow: [number, number]
  description: string
}

export const SURF_SPOTS: SurfSpot[] = [
  // ── TENERIFE ──
  {
    id: 'medano',
    name: 'El Médano',
    island: 'tenerife',
    lat: 28.046, lon: -16.533,
    breakType: 'playa', level: 'todos',
    facingDir: 180,   // mira al sur → viento offshore = Norte (0°)
    swellWindow: [150, 250],
    description: 'El spot más consistente de Tenerife. Funciona con vientos del norte y swell sur/suroeste. También zona top de windsurf y kite.',
  },
  {
    id: 'americas',
    name: 'Playa Honda (Las Américas)',
    island: 'tenerife',
    lat: 28.057, lon: -16.726,
    breakType: 'arrecife', level: 'intermedio',
    facingDir: 240,   // mira al suroeste → offshore = NE (60°)
    swellWindow: [200, 290],
    description: 'Arrecife urbano en el sur. Funciona bien con swell del oeste y viento noreste (alisio offshore).',
  },
  {
    id: 'bajamar',
    name: 'Bajamar',
    island: 'tenerife',
    lat: 28.558, lon: -16.344,
    breakType: 'arrecife', level: 'intermedio',
    facingDir: 350,   // mira al norte → offshore = Sur (170°)
    swellWindow: [280, 60],   // NW-NE
    description: 'Arrecife en la costa norte. Recibe el swell del Atlántico directamente. Agua más fría y potente. Offshore con vientos del sur.',
  },
  {
    id: 'pris',
    name: 'El Pris',
    island: 'tenerife',
    lat: 28.527, lon: -16.312,
    breakType: 'arrecife', level: 'avanzado',
    facingDir: 10,    // mira al norte-noreste → offshore = S-SSO (190°)
    swellWindow: [300, 50],
    description: 'Arrecife potente en el nordeste. Para surfistas experimentados. Las mejores condiciones con swell de NW y viento del sur.',
  },
  // ── GRAN CANARIA ──
  {
    id: 'lacicer',
    name: 'La Cicer / Las Palmas',
    island: 'granCanaria',
    lat: 28.113, lon: -15.434,
    breakType: 'playa', level: 'todos',
    facingDir: 340,   // mira al norte-noroeste → offshore = SE (160°)
    swellWindow: [270, 40],
    description: 'Playa urbana de Las Palmas. Ola accesible todo el año. En invierno recibe swell del norte de calidad.',
  },
  {
    id: 'confital',
    name: 'El Confital',
    island: 'granCanaria',
    lat: 28.148, lon: -15.448,
    breakType: 'arrecife', level: 'avanzado',
    facingDir: 310,   // mira al noroeste → offshore = SE-SSE
    swellWindow: [280, 360],
    description: 'Arrecife de clase mundial cuando hay swell grande del norte. Solo para surfistas avanzados. Puede llegar a 4-5m en invierno.',
  },
  {
    id: 'maspalomas-gc',
    name: 'Maspalomas',
    island: 'granCanaria',
    lat: 27.739, lon: -15.589,
    breakType: 'playa', level: 'principiante',
    facingDir: 200,   // mira al sur → offshore = Norte
    swellWindow: [160, 240],
    description: 'Playa grande del sur. Ola pequeña y suave, ideal para principiantes. Pocas veces hay swell significativo.',
  },
  // ── LANZAROTE ──
  {
    id: 'famara',
    name: 'Famara',
    island: 'lanzarote',
    lat: 29.108, lon: -13.547,
    breakType: 'playa', level: 'intermedio',
    facingDir: 280,   // mira al oeste → offshore = Este (90°)
    swellWindow: [250, 330],
    description: 'La playa más famosa para surf en Lanzarote. Swell del Atlántico directo, corriente y viento fuertes. Aguas frías en invierno.',
  },
  {
    id: 'lasanta-left',
    name: 'La Santa Left',
    island: 'lanzarote',
    lat: 29.058, lon: -13.621,
    breakType: 'arrecife', level: 'avanzado',
    facingDir: 290,   // mira al oeste-noroeste
    swellWindow: [270, 340],
    description: 'Izquierda tubular de clase mundial. Cuando funciona, es una de las mejores olas de las islas. Solo surfistas avanzados.',
  },
  // ── FUERTEVENTURA ──
  {
    id: 'cotillo',
    name: 'El Cotillo',
    island: 'fuerteventura',
    lat: 28.680, lon: -14.006,
    breakType: 'playa', level: 'intermedio',
    facingDir: 300,   // mira al noroeste → offshore = SE
    swellWindow: [260, 340],
    description: 'Costa norte de Fuerteventura. Consistente gracias al swell del Atlántico norte. La isla más expuesta a oleaje de Europa.',
  },
  {
    id: 'corralejo',
    name: 'Corralejo (Flag Beach)',
    island: 'fuerteventura',
    lat: 28.742, lon: -13.858,
    breakType: 'playa', level: 'todos',
    facingDir: 20,    // mira al norte-noreste → offshore = S-SW
    swellWindow: [340, 70],
    description: 'Playas de dunas al norte. Zona ideal para principiantes e intermedios con ola consistente y poco fondo.',
  },
  // ── LA PALMA ──
  {
    id: 'puertonaos',
    name: 'Puerto Naos',
    island: 'laPalma',
    lat: 28.598, lon: -17.859,
    breakType: 'playa', level: 'principiante',
    facingDir: 220,   // mira al suroeste → offshore = NE
    swellWindow: [180, 270],
    description: 'Playa de arena negra en la costa oeste de La Palma. Ola tranquila, buen sitio para aprender.',
  },
]

// ── GOLF ──────────────────────────────────────────────────────────────────

export type GolfZone = 'norte' | 'sur' | 'oeste'

export interface GolfCourse {
  id: string
  name: string
  island: IslandId
  holes: number
  zone: GolfZone
  altitudeM: number   // altitud del campo — afecta temperatura y viento
  notes: string
}

export const GOLF_COURSES: GolfCourse[] = [
  // ── TENERIFE ──
  { id: 'golf-del-sur',    name: 'Golf del Sur',         island: 'tenerife', holes: 27, zone: 'sur',   altitudeM: 140,  notes: 'Campos a orilla del mar. El viento del sur (calima) puede ser intenso.' },
  { id: 'costa-adeje',     name: 'Golf Costa Adeje',     island: 'tenerife', holes: 18, zone: 'sur',   altitudeM: 95,   notes: 'Diseño de Donald Steel junto al Barranco del Rey. Raramente llueve.' },
  { id: 'las-americas',    name: 'Golf Las Américas',    island: 'tenerife', holes: 18, zone: 'sur',   altitudeM: 80,   notes: 'Diseño de Pepe Gancedo. Campo muy expuesto al viento del norte/alisio.' },
  { id: 'abama',           name: 'Abama Golf',           island: 'tenerife', holes: 18, zone: 'oeste', altitudeM: 400,  notes: 'Campo de alta gama en acantilado sobre el Atlántico. Viento de poniente frecuente.' },
  { id: 'buenavista',      name: 'Buenavista Golf',      island: 'tenerife', holes: 18, zone: 'norte', altitudeM: 80,   notes: 'En el noroeste de la isla, más lluvia y nubes que el sur. Diseño de Seve Ballesteros.' },
  { id: 'real-tenerife',   name: 'Real Golf de Tenerife',island: 'tenerife', holes: 18, zone: 'norte', altitudeM: 600,  notes: 'El campo más antiguo de las Islas Canarias (1932). En La Laguna, con niebla ocasional.' },
  // ── GRAN CANARIA ──
  { id: 'real-gc',         name: 'Real Club de Golf de Las Palmas', island: 'granCanaria', holes: 18, zone: 'norte', altitudeM: 550, notes: 'El más antiguo de España (1891). En las montañas del norte, niebla y viento posible.' },
  { id: 'maspalomas-golf', name: 'Maspalomas Golf',      island: 'granCanaria', holes: 18, zone: 'sur', altitudeM: 20,  notes: 'En el sur, junto a las dunas. Sol garantizado casi todo el año.' },
  { id: 'anfi-tauro',      name: 'Anfi Tauro Golf',      island: 'granCanaria', holes: 18, zone: 'sur', altitudeM: 30,  notes: 'Campo espectacular junto al océano en la costa suroeste.' },
  // ── LANZAROTE ──
  { id: 'lanzarote-golf',  name: 'Lanzarote Golf',       island: 'lanzarote',  holes: 18, zone: 'sur', altitudeM: 20,  notes: 'La isla más ventosa de Canarias. El viento es el factor principal aquí.' },
  { id: 'costa-teguise',   name: 'Costa Teguise Golf',   island: 'lanzarote',  holes: 18, zone: 'norte', altitudeM: 100, notes: 'Campo junto al resort de Costa Teguise. Viento del norte frecuente.' },
  // ── FUERTEVENTURA ──
  { id: 'salinas-fut',     name: 'Salinas de Antigua',   island: 'fuerteventura', holes: 18, zone: 'sur', altitudeM: 50, notes: 'Campo interior. Fuerteventura es muy ventosa — el viento afecta siempre.' },
]

// ── SENDERISMO ────────────────────────────────────────────────────────────

export type TrailDifficulty = 'fácil' | 'moderada' | 'difícil' | 'muy difícil'
export type TrailExposure   = 'forestal' | 'costera' | 'alta montaña' | 'barranco' | 'mixta'

export interface HikingTrail {
  id: string
  name: string
  island: IslandId
  difficulty: TrailDifficulty
  exposure: TrailExposure
  altitudeMaxM: number    // cota máxima del recorrido
  altitudeMinM: number    // cota mínima del recorrido
  distanceKm: number
  /** Factores específicos que afectan a esta ruta */
  riskFactors: Array<'barranco' | 'cumbre' | 'calima' | 'niebla' | 'sol_directo' | 'sendero_estrecho'>
  description: string
}

export const HIKING_TRAILS: HikingTrail[] = [
  // ── TENERIFE ──
  {
    id: 'teide-pico',
    name: 'Cima del Teide (PR-TF 71)',
    island: 'tenerife',
    difficulty: 'muy difícil', exposure: 'alta montaña',
    altitudeMaxM: 3718, altitudeMinM: 3555,
    distanceKm: 9,
    riskFactors: ['cumbre', 'sol_directo', 'niebla'],
    description: 'El techo de España. El frío, el viento y el sol extremo son los factores críticos. Requiere permiso OAPN.',
  },
  {
    id: 'roques-garcia',
    name: 'Roques de García (Cañadas)',
    island: 'tenerife',
    difficulty: 'fácil', exposure: 'alta montaña',
    altitudeMaxM: 2200, altitudeMinM: 2100,
    distanceKm: 5,
    riskFactors: ['sol_directo', 'calima'],
    description: 'Circular fácil entre los Roques en el Parque Nacional. Exposición total al sol a 2.100m.',
  },
  {
    id: 'anaga-chinamada',
    name: 'Anaga — Chinamada a Punta del Hidalgo',
    island: 'tenerife',
    difficulty: 'moderada', exposure: 'forestal',
    altitudeMaxM: 900, altitudeMinM: 0,
    distanceKm: 12,
    riskFactors: ['niebla', 'sendero_estrecho'],
    description: 'Laurisilva densa en el macizo de Anaga. La niebla y la humedad son habituales. Barro en épocas de lluvia.',
  },
  {
    id: 'masca-barranco',
    name: 'Barranco de Masca',
    island: 'tenerife',
    difficulty: 'difícil', exposure: 'barranco',
    altitudeMaxM: 650, altitudeMinM: 0,
    distanceKm: 9,
    riskFactors: ['barranco', 'sol_directo'],
    description: 'El barranco más famoso de Tenerife. Riesgo de crecida con lluvia. Sol intenso en el descenso. Requiere barco de regreso.',
  },
  {
    id: 'corona-forestal',
    name: 'Corona Forestal (circular)',
    island: 'tenerife',
    difficulty: 'moderada', exposure: 'forestal',
    altitudeMaxM: 1500, altitudeMinM: 1000,
    distanceKm: 14,
    riskFactors: ['niebla', 'sendero_estrecho'],
    description: 'Por el pinar de altura. Puede haber niebla y frío inesperado. Poco expuesto al viento por la densa vegetación.',
  },
  // ── GRAN CANARIA ──
  {
    id: 'roque-nublo',
    name: 'Roque Nublo',
    island: 'granCanaria',
    difficulty: 'moderada', exposure: 'alta montaña',
    altitudeMaxM: 1813, altitudeMinM: 1700,
    distanceKm: 7,
    riskFactors: ['cumbre', 'sol_directo', 'niebla'],
    description: 'El monumento natural más icónico de Gran Canaria. Visto espectacular si no hay niebla. Exposición total en la cima.',
  },
  {
    id: 'tejeda-barranco',
    name: 'Barranco de Tejeda',
    island: 'granCanaria',
    difficulty: 'difícil', exposure: 'barranco',
    altitudeMaxM: 1050, altitudeMinM: 200,
    distanceKm: 16,
    riskFactors: ['barranco', 'sol_directo'],
    description: 'Espectacular barranco del interior. Mucho desnivel. En verano el calor puede ser extremo en el fondo.',
  },
  // ── LANZAROTE ──
  {
    id: 'famara-mirador',
    name: 'Risco de Famara',
    island: 'lanzarote',
    difficulty: 'moderada', exposure: 'costera',
    altitudeMaxM: 671, altitudeMinM: 0,
    distanceKm: 10,
    riskFactors: ['cumbre', 'sol_directo', 'calima'],
    description: 'Acantilados sobre Famara con vistas a La Graciosa. El viento puede ser muy fuerte en el borde del risco.',
  },
  // ── FUERTEVENTURA ──
  {
    id: 'betancuria',
    name: 'Macizo de Betancuria',
    island: 'fuerteventura',
    difficulty: 'moderada', exposure: 'mixta',
    altitudeMaxM: 807, altitudeMinM: 250,
    distanceKm: 12,
    riskFactors: ['sol_directo', 'calima'],
    description: 'Interior montañoso de Fuerteventura. La isla más árida de Canarias — lleva mucha agua. El viento es constante.',
  },
  // ── LA PALMA ──
  {
    id: 'caldera-taburiente',
    name: 'Caldera de Taburiente (GR-131)',
    island: 'laPalma',
    difficulty: 'difícil', exposure: 'forestal',
    altitudeMaxM: 2426, altitudeMinM: 430,
    distanceKm: 20,
    riskFactors: ['barranco', 'niebla', 'cumbre'],
    description: 'Uno de los parques nacionales más espectaculares de España. La lluvia y la niebla son frecuentes. Los barrancos pueden ser peligrosos.',
  },
]
