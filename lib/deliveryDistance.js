// Estimate delivery distance & band from the customer's pincode.
// Store location: B39, Jagdamba Colony, Naya Khera, Ambabari, Jaipur - 302039
//
// NOTE: These are approximate pincode-area centroids (not exact addresses),
// so the distance is an estimate. The checkout still lets the customer/owner
// override the auto-selected band manually.

export const STORE = {
  pincode: '302039',
  lat: 26.9450,
  lng: 75.7880,
}

// Approximate centroids for Jaipur-area pincodes [lat, lng]
export const PINCODE_COORDS = {
  '302001': [26.9250, 75.8260], // Kishanpole / GPO (walled city)
  '302002': [26.9180, 75.8080], // Jaipur City
  '302003': [26.9010, 75.7930], // Bais Godam
  '302004': [26.8880, 75.8010], // Lal Kothi / Tonk Road
  '302005': [26.9080, 75.8380], // Sethi Colony
  '302006': [26.9330, 75.7960], // Bani Park
  '302011': [26.9040, 75.7690], // Sodala
  '302012': [26.9560, 75.7460], // Jhotwara
  '302013': [26.9620, 75.7790], // Vidhyadhar Nagar
  '302015': [26.8540, 75.8130], // Malviya Nagar
  '302016': [26.8470, 75.7620], // Mansarovar
  '302017': [26.8760, 75.7970], // Mahesh Nagar
  '302018': [26.8520, 75.7890], // Durgapura
  '302019': [26.9110, 75.7360], // Vaishali Nagar
  '302020': [26.9330, 75.7220], // Bindayaka
  '302021': [26.8230, 75.7880], // Sanganer
  '302022': [26.9000, 75.7950],
  '302023': [26.8500, 75.8300],
  '302026': [26.9000, 75.7200],
  '302028': [26.8800, 75.7050],
  '302029': [26.8000, 75.7830], // Sanganer / Muhana
  '302031': [26.8600, 75.8300],
  '302033': [26.8340, 75.8500], // Jagatpura
  '302034': [26.8720, 75.7830], // Gopalpura
  '302036': [26.8300, 75.7500],
  '302037': [26.9000, 75.8600],
  '302038': [26.9200, 75.8600],
  '302039': [26.9450, 75.7880], // Ambabari / Naya Khera (store)
  '302040': [26.9700, 75.8000], // near Vidhyadhar Nagar / VKI
}

function toRad(d) { return (d * Math.PI) / 180 }

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Returns { methodId, distanceKm, known }
// methodId is one of: within5 | r5to8 | beyond8
export function estimateDeliveryByPincode(pincode) {
  if (!pincode || !/^\d{6}$/.test(pincode)) return null

  const coords = PINCODE_COORDS[pincode]
  if (!coords) {
    // Unknown pincode (likely outside our local Jaipur delivery zone)
    return { methodId: 'beyond8', distanceKm: null, known: false }
  }

  const distanceKm = haversineKm(STORE.lat, STORE.lng, coords[0], coords[1])
  const rounded = Math.round(distanceKm * 10) / 10

  let methodId = 'beyond8'
  if (distanceKm <= 5) methodId = 'within5'
  else if (distanceKm <= 8) methodId = 'r5to8'

  return { methodId, distanceKm: rounded, known: true }
}
