import { DEFAULT_TRIP, TRIP_STATUS } from '../../constants/trips.js';
import { dateInput } from '../../features/trips/tripModel.js';
export function createPartnerSeeds(now = new Date()) {
  const day = offset => { const date = new Date(now); date.setDate(date.getDate() + offset); return dateInput(date); };
  return [
    { id: 'munnar-honeymoon', destination: 'Munnar', departureCity: 'Bengaluru', budget: 45000, tripType: 'Honeymoon', adults: 2, children: 0, interests: ['Nature & outdoors', 'Wellness'], accommodation: 'Boutique stay', notes: 'A peaceful hillside stay and one special dinner. We would love a relaxed pace.', offset: 45 },
    { id: 'munnar-friends', destination: 'Munnar', departureCity: 'Chennai', budget: 60000, tripType: 'Friends', adults: 4, children: 0, interests: ['Food & culture', 'Adventure'], accommodation: '3-star hotel', notes: 'Tea estate walks and scenic drives. Include time to explore local food.', offset: 32 },
    { id: 'alleppey-family', destination: 'Alleppey', departureCity: 'Hyderabad', budget: 55000, tripType: 'Family', adults: 2, children: 2, interests: ['Nature & outdoors', 'Food & culture'], accommodation: 'Boutique stay', notes: 'Family-friendly stays, short drives, and a houseboat experience. Vegetarian meals.', offset: 26 },
  ].map((item, index) => ({ ...DEFAULT_TRIP, ...item, customerId: 'sample-enquiries', assignedPartnerIds: ['demo-partner'], startDate: day(item.offset), endDate: day(item.offset + 4), status: TRIP_STATUS.PLANNERS_ASSIGNED, createdAt: `${day(-index)}T07:00:00.000Z`, updatedAt: `${day(-index)}T07:00:00.000Z`, isSample: true, quotes: [], timeline: [] }));
}
