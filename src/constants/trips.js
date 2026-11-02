export const TRIP_STATUS = Object.freeze({
  DRAFT: 'DRAFT', SUBMITTED: 'SUBMITTED', MATCHING: 'MATCHING',
  PLANNERS_ASSIGNED: 'PLANNERS_ASSIGNED', QUOTES_RECEIVED: 'QUOTES_RECEIVED',
  PLANNER_SELECTED: 'PLANNER_SELECTED', CLOSED: 'CLOSED', CANCELLED: 'CANCELLED',
});
export const STATUS_META = {
  DRAFT: { label: 'Draft', tone: 'neutral', description: 'A little more dreaming. Finish your request whenever you’re ready.' },
  SUBMITTED: { label: 'Submitted', tone: 'blue', description: 'Your request is in. The next step is finding planners for your trip.' },
  MATCHING: { label: 'Finding planners', tone: 'blue', description: 'We’re finding travel planners who fit your plans.' },
  PLANNERS_ASSIGNED: { label: 'With planners', tone: 'blue', description: 'Your travel brief is with planners. Their ideas will appear here.' },
  QUOTES_RECEIVED: { label: 'Quotes received', tone: 'gold', description: 'Fresh possibilities await. Take a look at your personalized proposals.' },
  PLANNER_SELECTED: { label: 'Planner selected', tone: 'green', description: 'You’ve found your planner. Refer to your proposal for the next steps.' },
  CLOSED: { label: 'Closed', tone: 'neutral', description: 'This request is closed. There’s always another journey ahead.' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral', description: 'This trip request has been cancelled.' },
};
export const TRIP_TYPES = ['Honeymoon', 'Family', 'Friends', 'Solo', 'Adventure', 'Pilgrimage', 'Business', 'Other'];
export const ACCOMMODATIONS = ['Boutique stay', '3-star hotel', '4-star hotel', '5-star resort', 'Homestay', 'Open to suggestions'];
export const TRANSPORT = ['Flights + local transfers', 'Train + local transfers', 'Private car', 'Local transfers only', 'I’ll arrange my own', 'Open to suggestions'];
export const INTERESTS = ['Nature & outdoors', 'Food & culture', 'Beaches', 'Adventure', 'Wellness', 'Wildlife', 'History & heritage', 'Shopping'];
export const FORM_STEPS = [
  { title: 'The essentials', description: 'Where, when, and who’s coming.', fields: ['destination', 'departureCity', 'startDate', 'endDate', 'adults', 'children'] },
  { title: 'Your travel style', description: 'Let’s make this feel like you.', fields: ['budget', 'tripType', 'accommodation', 'transportation', 'interests', 'specialRequirements', 'notes'] },
  { title: 'Review your trip', description: 'One last look before the journey begins.', fields: [] },
];
export const DEFAULT_TRIP = { destination: '', departureCity: '', startDate: '', endDate: '', adults: 2, children: 0, budget: '', tripType: '', accommodation: 'Open to suggestions', transportation: 'Open to suggestions', interests: [], specialRequirements: '', notes: '' };
export const ACTIVE_STATUSES = [TRIP_STATUS.SUBMITTED, TRIP_STATUS.MATCHING, TRIP_STATUS.PLANNERS_ASSIGNED, TRIP_STATUS.QUOTES_RECEIVED];
