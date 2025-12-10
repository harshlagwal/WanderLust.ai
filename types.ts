export interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  interests: string[];
  dietary: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  coordinates?: GeoPoint; // Added for mapping
  costEstimate: string;
  duration: string;
}

export interface DayPlan {
  day: number;
  date?: string;
  theme: string;
  hotelSuggestion: {
    name: string;
    description: string;
    priceRange: string;
    coordinates?: GeoPoint; // Added for mapping
  };
  activities: Activity[];
  meals: {
    lunch: string;
    dinner: string;
  };
}

export interface TripItinerary {
  tripTitle: string;
  summary: string;
  destination: string;
  totalCostEstimate: string;
  weatherForecast: string;
  packingList: string[];
  days: DayPlan[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}