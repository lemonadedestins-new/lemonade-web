// Fictional businesses and indicative prices for the in-memory marketplace.
export const samplePlanners = [
  { id: 'demo-partner', name: 'Maya Nair', businessName: 'Green Trail Holidays', city: 'Kochi', specialties: 'Munnar, Alleppey & relaxed Kerala holidays', description: 'Small-group hill escapes and backwater breaks, with a little more time for local experiences.', languages: ['English', 'Malayalam', 'Tamil'], initials: 'GT', color: '#dce6d4' },
  { id: 'sample-pine', name: 'Arjun Menon', businessName: 'Malabar Miles', city: 'Kozhikode', specialties: 'Tea country, estate stays & Kerala food', description: 'Comfortable journeys through tea country and the waterways of Kerala. We build in time to slow down.', languages: ['English', 'Malayalam', 'Hindi'], initials: 'MM', color: '#e9dfc7' },
  { id: 'southern-routes', name: 'Kavya Rao', businessName: 'Southern Routes', city: 'Bengaluru', specialties: 'South India road trips & heritage escapes', description: 'Flexible road trips connecting the hills, coffee country, and heritage landscapes of the south.', languages: ['English', 'Kannada', 'Hindi'], initials: 'SR', color: '#dce4e9' },
  { id: 'nilgiri-days', name: 'Arun Kumar', businessName: 'Nilgiri Days', city: 'Coimbatore', specialties: 'Ooty, Coonoor & hill holidays', description: 'Easy-paced Nilgiri escapes with hillside stays, scenic drives, and thoughtfully planned stops.', languages: ['English', 'Tamil'], initials: 'ND', color: '#e5dfed' },
  { id: 'coastal-stories', name: 'Divya Raman', businessName: 'Coastal Stories', city: 'Puducherry', specialties: 'Pondicherry, heritage walks & coastal breaks', description: 'A local perspective on colorful streets, seaside mornings, and slow coastal travel.', languages: ['English', 'Tamil', 'French'], initials: 'CS', color: '#f0ddcf' },
];
const routes = {
  munnar: [['Welcome to tea country', 'Pickup and a scenic drive into Munnar. Check in and enjoy an easy evening.'], ['Tea gardens and mountain views', 'Visit a tea estate and enjoy viewpoints with time for a relaxed local lunch.'], ['A morning at your own pace', 'Take a gentle walk and explore local shops before the return transfer.'], ['A little further into the hills', 'Spend an additional day exploring scenic roads and quiet hillside stops.'], ['Until next time', 'Breakfast and checkout, followed by the agreed return transfer.']],
  ooty: [['Hello, Nilgiris', 'Arrive in Ooty, check in, and settle into the cooler hill-country pace.'], ['Gardens and Coonoor', 'Explore gardens and tea country with scenic stops around Coonoor.'], ['One last lakeside morning', 'Enjoy a gentle morning walk before checkout and your return transfer.'], ['A quieter corner of the hills', 'An additional day for viewpoints and relaxed local sightseeing.']],
  coorg: [['Into coffee country', 'Arrive at your estate stay and spend an unhurried afternoon in the grounds.'], ['Waterfalls and local flavors', 'A scenic outing to local waterfalls, followed by coffee and a regional lunch.'], ['A slow estate morning', 'A guided estate walk and breakfast before your return transfer.']],
  alleppey: [['Life on the backwaters', 'Board your houseboat and cruise palm-lined canals, with meals served on board.'], ['Canals and village life', 'Breakfast on the water and checkout, with time for a village walk.'], ['A day by the coast', 'Enjoy a relaxed beach morning before the return transfer.']],
  hampi: [['A first look at Hampi', 'Check in and take a guided introduction to the heritage landscape.'], ['Stories in stone', 'Explore temple architecture and ancient streets at an easy pace with a local guide.'], ['Golden light and goodbye', 'Enjoy a quiet morning viewpoint before checkout and your return journey.']],
  pondicherry: [['A seaside welcome', 'Check in and enjoy an evening walk along the promenade.'], ['Colorful lanes and local tables', 'A guided White Town walk with time for cafés and local shopping.'], ['A slower coastal morning', 'Take a morning beach walk, then checkout and return transfer.'], ['Time to explore', 'An additional free day for your own discoveries and optional experiences.']],
};
export function createPackageSeeds() {
  const rows = [
    ['munnar-tea-trails', 'demo-partner', 'munnar', 'Munnar tea trails', 8900, 3, 'Kochi', 'A comfortable three-day escape with tea gardens, a hillside stay, and private transfers.', 'Boutique hillside hotel', 'Breakfast daily'],
    ['munnar-estate-retreat', 'sample-pine', 'munnar', 'The estate retreat', 14900, 4, 'Kochi', 'Stay a little longer in tea country, with an estate bungalow and leisurely local experiences.', 'Heritage estate bungalow', 'Breakfast and dinner'],
    ['munnar-scenic-escape', 'southern-routes', 'munnar', 'Munnar, at your own pace', 11900, 3, 'Coimbatore', 'A road trip into rolling green hills, with a private car and a flexible sightseeing day.', 'Comfortable hill-view hotel', 'Breakfast daily'],
    ['ooty-garden-weekend', 'nilgiri-days', 'ooty', 'Ooty & Coonoor garden weekend', 7900, 3, 'Coimbatore', 'A relaxed introduction to the Nilgiris, from quiet gardens to tea-scented Coonoor.', '3-star hotel in Ooty', 'Breakfast daily'],
    ['ooty-family-break', 'southern-routes', 'ooty', 'Four days in the Nilgiris', 12900, 4, 'Bengaluru', 'A little more time for hillside walks, Coonoor viewpoints, and family-friendly days.', 'Boutique hill-view hotel', 'Breakfast and two dinners'],
    ['coorg-coffee-days', 'southern-routes', 'coorg', 'Coffee country slow days', 9900, 3, 'Bengaluru', 'An estate stay with coffee walks, local food, and a scenic day around Madikeri.', 'Coffee estate homestay', 'Breakfast and dinner'],
    ['coorg-estate-weekend', 'nilgiri-days', 'coorg', 'Coorg estate weekend', 11500, 3, 'Mysuru', 'A comfortable coffee-country break with private transfers and guided estate time.', 'Boutique plantation stay', 'Breakfast daily'],
    ['alleppey-houseboat', 'demo-partner', 'alleppey', 'A houseboat kind of weekend', 7500, 2, 'Kochi', 'Trade busy days for a private houseboat, gentle canals, and meals on the water.', 'One night in a private AC houseboat', 'All meals on the houseboat'],
    ['alleppey-waterways', 'sample-pine', 'alleppey', 'Backwaters & coastal mornings', 10900, 3, 'Kochi', 'Pair a houseboat night with a coastal stay and an easy village walk.', 'Houseboat and boutique coastal hotel', 'Breakfast daily; all houseboat meals'],
    ['hampi-stories', 'southern-routes', 'hampi', 'Hampi: stories in stone', 8500, 3, 'Hosapete', 'Three thoughtful days of heritage walks, temple architecture, and golden landscapes.', 'Heritage-style guesthouse', 'Breakfast daily'],
    ['pondicherry-colors', 'coastal-stories', 'pondicherry', 'Pondicherry in full color', 6900, 3, 'Puducherry', 'A gentle coastal break with a White Town walk, cafés, and seaside evenings.', 'Boutique guesthouse', 'Breakfast daily'],
    ['pondicherry-coastal-days', 'coastal-stories', 'pondicherry', 'Four days by the sea', 11900, 4, 'Chennai', 'Take the scenic route to a longer coastal stay with time to explore on your own.', 'Boutique coastal hotel', 'Breakfast daily'],
  ];
  return rows.map(([id, plannerId, destinationId, title, price, days, pickupCity, summary, accommodation, meals]) => ({
    id, plannerId, destinationId, title, price, days, pickupCity, summary, accommodation, meals, status: 'PUBLISHED',
    transportation: 'Private car from the listed pickup city, including return transfer.',
    inclusions: ['Accommodation on twin-sharing basis', meals, 'Listed transfers and sightseeing', 'Applicable taxes'],
    exclusions: ['Travel to the pickup city', 'Optional activities and entry tickets', 'Personal expenses and travel insurance'],
    terms: 'Indicative sample price per adult, based on two adults sharing a room. Travel dates, availability, final price, and cancellation terms must be confirmed with the planner. No booking or payment is made here.',
    itinerary: routes[destinationId].slice(0, days).map(([dayTitle, description], index) => ({ day: index + 1, title: dayTitle, description })),
    updatedAt: new Date().toISOString(),
  }));
}
