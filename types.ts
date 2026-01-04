export interface TripFormData {
  currentLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  interests: string[];
  dietary: string;
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
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
  origin?: string; // Metadata for saving
  originalBudget?: number; // Metadata for saving
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