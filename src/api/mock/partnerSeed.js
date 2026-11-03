import { DEFAULT_TRIP, TRIP_STATUS } from '../../constants/trips.js';
import { dateInput } from '../../features/trips/tripModel.js';

export function createPartnerSeeds(now = new Date()) {
  const day = offset => { const date = new Date(now); date.setDate(date.getDate() + offset); return dateInput(date); };
  return [
    { id: 'island-honeymoon', destination: 'Maldives', departureCity: 'Bengaluru', budget: 180000, tripType: 'Honeymoon', adults: 2, children: 0, interests: ['Beaches', 'Wellness'], accommodation: '5-star resort', notes: 'A peaceful water villa and one special dinner by the sea. We’d love a relaxed pace.', offset: 45 },
    { id: 'thailand-friends', destination: 'Thailand', departureCity: 'Mumbai', budget: 220000, tripType: 'Friends', adults: 4, children: 0, interests: ['Food & culture', 'Adventure'], accommodation: '4-star hotel', notes: 'A mix of Bangkok street food and a few days on the coast. Include an island day trip.', offset: 32 },
    { id: 'kerala-family', destination: 'Kerala', departureCity: 'Hyderabad', budget: 85000, tripType: 'Family', adults: 2, children: 2, interests: ['Nature & outdoors', 'Wildlife'], accommodation: 'Boutique stay', notes: 'Family-friendly stays, short drives, and a houseboat experience. Vegetarian meals.', offset: 26 },
  ].map((item, index) => ({ ...DEFAULT_TRIP, ...item, customerId: 'sample-enquiries', assignedPartnerIds: ['demo-partner'], startDate: day(item.offset), endDate: day(item.offset + 4), status: TRIP_STATUS.PLANNERS_ASSIGNED, createdAt: `${day(-index)}T07:00:00.000Z`, updatedAt: `${day(-index)}T07:00:00.000Z`, isSample: true, quotes: [], timeline: [] }));
}
