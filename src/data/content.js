import villaSerein from '../assets/properties/villa-serein.jpg'
import casaTierra from '../assets/properties/casa-tierra.jpg'
import casaRoca from '../assets/properties/casa-roca.jpg'
import villaLumen from '../assets/properties/villa-lumen.jpg'
import villaAzur from '../assets/properties/villa-azur.jpg'
import glassHouse from '../assets/properties/glass-house.jpg'
import residenceAurel from '../assets/properties/residence-aurel.jpg'
import casaAlbedo from '../assets/properties/casa-albedo.jpg'
import patio from '../assets/properties/patio.jpg'

// All imagery: Unsplash (free licence, https://unsplash.com/license).
// To use your own photography, drop files in /public/images and replace `img()` calls
// with '/images/your-file.jpg'. Every image is graded the same way (see lib/grade.js).

// Local images (imported files) are returned as-is; anything else is an Unsplash photo id.
export const isLocal = (id) => typeof id === 'string' && (id.includes('/') || id.startsWith('data:'))
export const img = (id, w = 1600, h, extra = '') =>
  isLocal(id) ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}${h ? `&h=${h}` : ''}${extra}`

export const BRAND = {
  name: 'ESTAVÉ',
  tagline: 'Architecture Beyond Expectations.',
  intro:
    'An architectural real estate house in Lisbon since 2011. We represent villas, retreats and homes that were designed, not just built.',
  address: ['ESTAVÉ', 'Avenida da Liberdade 110', '1250-146 Lisbon'],
  email: 'viewings@estave.com',
  phone: '+351 213 000 110',
  hours: 'Monday to Saturday',
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
    { label: 'Pinterest', href: 'https://www.pinterest.com/' },
    { label: 'X', href: 'https://x.com/' },
  ],
}

export const NAV = [
  { label: 'Gallery', target: '#gallery' },
  { label: 'Architecture', target: '#featured' },
  { label: 'Interiors', target: '#interiors' },
  { label: 'Locations', target: '#locations' },
  { label: 'About', target: '#about' },
  { label: 'Contact', target: '#contact' },
]

// The eight works hung in the 3D gallery. `slot` maps to a placement in GalleryScene.
export const PROPERTIES = [
  {
    slug: 'villa-serein', name: 'Villa Serein', location: 'Cap Ferrat, France', type: 'Villa', year: 2024,
    image: villaSerein, ratio: 3 / 2, beds: 5, area: '640 m²', plot: '3,200 m²', price: 'On request',
    line: 'Two travertine-clad floors and a pool terrace that runs out to the horizon.',
    text: 'Deep cantilevered slabs shade every room from the midday sun. The ground floor opens completely onto a stone terrace and a 22-metre pool, with the bay of Villefranche beyond.',
  },
  {
    slug: 'casa-tierra', name: 'Casa Tierra', location: 'Mallorca, Spain', type: 'Villa', year: 2023,
    image: casaTierra, ratio: 4 / 3, beds: 4, area: '410 m²', plot: '1,900 m²', price: '€ 4.6M',
    line: 'Local stone walls, a floating white roof and a plunge pool in the garden.',
    text: 'The walls are built from stone quarried in the Tramuntana, laid by hand. A thin white roof floats above them and reaches out to shade the terrace and the carport.',
  },
  {
    slug: 'casa-roca', name: 'Casa Roca', location: 'Lanzarote, Spain', type: 'Retreat', year: 2025,
    image: casaRoca, ratio: 4 / 3, beds: 3, area: '290 m²', plot: '1.4 ha', price: '€ 3.2M',
    line: 'Sculpted white shells in the sand, glowing from inside at dusk.',
    text: 'Three hand-plastered shells hold the living room, the kitchen and the master suite. Round openings frame the volcanic landscape like paintings, and stay cool all summer.',
  },
  {
    slug: 'villa-lumen', name: 'Villa Lumen', location: 'Lake Como, Italy', type: 'Villa', year: 2024,
    image: villaLumen, ratio: 4 / 3, beds: 6, area: '720 m²', plot: '5,100 m²', price: 'On request',
    line: 'A single-storey glass pavilion behind a long reflecting pool.',
    text: 'Floor-to-ceiling glass on three sides, a flat roof that overhangs by four metres, and a 25-metre pool that doubles the house in its reflection every morning.',
  },
  {
    slug: 'villa-azur', name: 'Villa Azur', location: 'Ibiza, Spain', type: 'Villa', year: 2023,
    image: villaAzur, ratio: 4 / 3, beds: 7, area: '880 m²', plot: '1.1 ha', price: '€ 11.5M',
    line: 'An infinity pool that drops straight into the Mediterranean.',
    text: 'The pool edge disappears into the sea. Beside it, an oak pergola with linen curtains makes an outdoor living room for long summer evenings.',
  },
  {
    slug: 'the-glass-house', name: 'The Glass House', location: 'Sintra, Portugal', type: 'Villa', year: 2025,
    image: glassHouse, ratio: 4 / 3, beds: 5, area: '560 m²', plot: '2,300 m²', price: '€ 5.4M',
    line: 'White volumes, glass corners and a pool terrace in the Sintra hills.',
    text: 'Two white volumes slide over each other, opening glass corners to the garden. The dining room steps straight out onto the pool deck.',
  },
  {
    slug: 'residence-aurel', name: 'Residence Aurel', location: 'Porto, Portugal', type: 'Townhouse', year: 2024,
    image: residenceAurel, ratio: 3 / 4, beds: 4, area: '380 m²', plot: '620 m²', price: '€ 2.9M',
    line: 'Dark zinc, warm cedar and tall glass on a quiet tree-lined street.',
    text: 'A contemporary family house with a double-height living room, cedar soffits and a glazed corner that catches the evening light.',
  },
  {
    slug: 'casa-albedo-field', name: 'Casa Albedo', location: 'Comporta, Portugal', type: 'Villa', year: 2026,
    image: casaAlbedo, ratio: 4 / 3, beds: 6, area: '820 m²', plot: '2.1 ha', price: 'On request',
    line: 'Interlocking white volumes above a travertine terrace.',
    text: 'Our featured residence. A travertine plinth, a glass pavilion and white volumes cantilevered towards the dunes. Explore it in 3D in the Architecture section.',
    featured: true,
  },
]

export const FEATURED = {
  name: 'Casa Albedo',
  meta: [
    ['Villa', 'for'],
    ['Private sale', 'in'],
    ['Comporta', ''],
    ['2026', ''],
  ],
  intro:
    'A travertine plinth, a glass pavilion and a board-formed concrete volume cantilevered five metres towards the dunes. Designed for a family that wanted to see the pine forest from the bath.',
  specs: [
    ['Bedrooms', '6 suites'],
    ['Interior', '820 m²'],
    ['Terraces', '410 m²'],
    ['Plot', '2.1 ha'],
    ['Pool', '16 × 4 m infinity'],
    ['Price', 'On request'],
  ],
  chapters: [
    {
      id: 'plinth',
      title: 'The plinth came first',
      text: 'Before any wall, the architects laid a 34-metre travertine plinth to lift the house half a metre above the sand. Everything else stands on it: the pool, the pavilion, the terraces.',
      quote: '“We wanted the house to sit on the land like a tray on a table.”',
      by: 'Inês Moura, architect',
    },
    {
      id: 'pavilion',
      title: 'A pavilion of glass',
      text: 'The ground floor is one room, twenty metres long and glazed on three sides. Low-iron glass in slim black frames means the pines read true green from the sofa.',
    },
    {
      id: 'volume',
      title: 'Concrete, cantilevered',
      text: 'The sleeping floor is a board-formed concrete box that reaches five metres past the pavilion. Oak louvres filter the west light and close completely for privacy.',
    },
    {
      id: 'site',
      title: 'Two hectares of pine',
      text: 'A stone garden wall runs out into the forest and frames the approach. No fences, no lawn — only cork oaks, umbrella pines and the sound of the Atlantic three kilometres away.',
    },
  ],
}

export const INTERIOR_FILTERS = ['All', 'Living', 'Kitchen & Dining', 'Bedrooms', 'Bathrooms', 'Materials']

export const INTERIORS = [
  { id: 'i1', title: 'The long room', where: 'Villa Lumen', cat: ['Living'], image: '1792571076572-9e4e3971bae6', ratio: 4 / 5, line: 'A stone wall, a low sofa and twenty metres of oak floor.' },
  { id: 'i2', title: 'Dining in the glow', where: 'Casa Albedo', cat: ['Kitchen & Dining'], image: '1768836180164-070b4c1a8f94', ratio: 4 / 3, line: 'A table for twelve, lit by a cove of warm light.' },
  { id: 'i3', title: 'Fireside', where: 'Casa Tierra', cat: ['Living'], image: '1762545112336-646c69e4888b', ratio: 3 / 4, line: 'A wood fire, tan leather and the forest beyond.' },
  { id: 'i4', title: 'Smoked oak kitchen', where: 'Casa Roca', cat: ['Kitchen & Dining', 'Materials'], image: '1755288556498-0aa1eb1f16f3', ratio: 4 / 3, line: 'Smoked oak, bronze and a four-metre island in honed limestone.' },
  { id: 'i5', title: 'Master suite', where: 'Villa Serein', cat: ['Bedrooms'], image: '1757344454333-cc666252e596', ratio: 3 / 4, line: 'Walnut panelling, linen and a terrace on the bay.' },
  { id: 'i6', title: 'Concrete basin', where: 'The Glass House', cat: ['Bathrooms', 'Materials'], image: '1763485956070-431fca7bc030', ratio: 4 / 5, line: 'Cast in place, sanded by hand, sealed with wax.' },
  { id: 'i7', title: 'The quiet room', where: 'Villa Lumen', cat: ['Bedrooms'], image: '1781433924229-16c42cfbd644', ratio: 4 / 3, line: 'Walnut, linen curtains and one warm lamp. Nothing else.' },
  { id: 'i8', title: 'Black kitchen', where: 'Villa Azur', cat: ['Kitchen & Dining'], image: '1778272618522-665a8af7382e', ratio: 3 / 4, line: 'Smoked oak and black steel, nothing on show.' },
  { id: 'i9', title: 'The stone bath', where: 'Casa Oliva', cat: ['Bathrooms'], image: '1763978485095-1cd13f4d3cb3', ratio: 4 / 3, line: 'Two carved basins from a single block of limestone.' },
  { id: 'i10', title: 'Guest lounge', where: 'Casa Albedo', cat: ['Living'], image: '1768144092684-c1a5dd6c7aad', ratio: 4 / 5, line: 'Oak panelling, bouclé and evening light from the west.' },
  { id: 'i11', title: 'Travertine shower', where: 'Casa Tierra', cat: ['Bathrooms', 'Materials'], image: '1763485956293-873ea83bf095', ratio: 3 / 4, line: 'Honed travertine floor to ceiling, one skylight, no grout lines.' },
  { id: 'i12', title: 'Travertine at four o’clock', where: 'Villa Serein', cat: ['Materials'], image: '1784652587224-062bd5f231bf', ratio: 4 / 3, line: 'The stone used in every room, in the light it was chosen for.' },
  { id: 'i14', title: 'The shaded patio', where: 'Casa Tierra', cat: ['Living', 'Materials'], image: patio, ratio: 3 / 2, line: 'Board-formed concrete, teak and one orange chair in the shade.' },
  { id: 'i13', title: 'The reading corner', where: 'Villa Serein', cat: ['Living'], image: '1772208392358-19e96bee3a73', ratio: 4 / 3, line: 'Bouclé, stone and one good lamp.' },
]

export const LOCATIONS = [
  {
    id: 'comporta', code: '38°23′N', name: 'Comporta', region: 'Portugal', kind: 'Coast',
    image: '1616893104628-09bfe9725962',
    text: 'Rice fields, umbrella pines and sixty kilometres of empty Atlantic beach, golden every evening, an hour south of Lisbon.',
    facts: [['Lisbon airport', '75 min'], ['Beach', '3 km'], ['Golf', 'Comporta Dunes, 10 min'], ['Listings', '6']],
  },
  {
    id: 'alentejo', code: '38°34′N', name: 'Alentejo', region: 'Portugal', kind: 'Countryside',
    image: '1695470393142-4c14422ffb9a',
    text: 'Olive groves, cork oaks and whitewashed villages. Estates measured in hectares, not square metres.',
    facts: [['Lisbon airport', '90 min'], ['Évora', '20 min'], ['Vineyards', 'On estate'], ['Listings', '4']],
  },
  {
    id: 'mallorca', code: '39°47′N', name: 'Serra de Tramuntana', region: 'Mallorca', kind: 'Mountains & sea',
    image: '1687276447977-d2c0be3e6e06',
    text: 'A UNESCO mountain range that drops straight into the sea, with stone terraces and hidden coves.',
    facts: [['Palma airport', '40 min'], ['Port de Sóller', '10 min'], ['Marina', '15 min'], ['Listings', '5']],
  },
  {
    id: 'sintra', code: '38°48′N', name: 'Sintra Hills', region: 'Portugal', kind: 'Forest',
    image: '1642687791249-86d868e17746',
    text: 'Fog-wrapped forest, palaces and quintas, twenty-five minutes from central Lisbon.',
    facts: [['Lisbon centre', '25 min'], ['International schools', '3 within 15 min'], ['Beach', 'Praia Grande, 12 min'], ['Listings', '3']],
  },
  {
    id: 'riviera', code: '43°41′N', name: 'Cap Ferrat', region: 'Côte d’Azur', kind: 'Riviera',
    image: '1688412535441-313fe78e6816',
    text: 'Pine-covered peninsula between Nice and Monaco, white limestone and deep blue water.',
    facts: [['Nice airport', '25 min'], ['Monaco', '15 min'], ['Marina', 'Saint-Jean, 5 min'], ['Listings', '2']],
  },
  {
    id: 'lanzarote', code: '29°02′N', name: 'Lanzarote', region: 'Canary Islands', kind: 'Volcanic',
    image: '1685599789948-58ad6e477df5',
    text: 'Black lava fields, white houses and spring weather all year round.',
    facts: [['Arrecife airport', '20 min'], ['Average winter', '21 °C'], ['Beach', 'Papagayo, 15 min'], ['Listings', '2']],
  },
]

export const ABOUT = {
  words: ['Architecture', 'Beyond', 'Expectations.'],
  intro:
    'ESTAVÉ is an architectural real estate house in Lisbon since 2011. We only represent homes we would have liked to design ourselves.',
  expertise: [
    { n: '01', title: 'Architectural Sales', text: 'Private and discreet sales of villas and retreats by recognised architects.', tags: 'Valuation, positioning, private network' },
    { n: '02', title: 'Acquisition Search', text: 'We find the house before it reaches the market, then we check every wall of it.', tags: 'Search brief, off-market, due diligence' },
    { n: '03', title: 'Editorial Photography', text: 'Every listing is photographed at the same hour of light, so the collection reads as one.', tags: 'Photography, film, 3D tours' },
    { n: '04', title: 'Restoration & Build', text: 'Architects, engineers and craftspeople we have worked with for over a decade.', tags: 'Planning, renovation, interiors' },
    { n: '05', title: 'Lifestyle Management', text: 'Keys, staff, gardens and pools — the house is ready the day you arrive.', tags: 'Concierge, maintenance, rental' },
  ],
  approach: [
    ['Square metres', 'Light and proportion'],
    ['Quick sale', 'Right owner'],
    ['Finished', 'Finished on the back too'],
  ],
  quote:
    '“They knew the name of the architect, the quarry the stone came from and which room gets the sun at four. We bought the house in one visit.”',
  quoteBy: ['Camille & Arnaud Vidal', 'Owners, Villa Serein'],
  stats: [
    ['15', 'years'],
    ['140+', 'homes placed'],
    ['38', 'architects represented'],
  ],
  image: '1672940711883-754b2fdefa1c',
}
