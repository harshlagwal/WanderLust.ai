import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TripFormData, TripItinerary } from "../types";

// Schema for structured JSON output
const itinerarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING, description: "A catchy title for the trip" },
    summary: { type: Type.STRING, description: "A brief enthusiastic summary of the trip" },
    destination: { type: Type.STRING },
    totalCostEstimate: { type: Type.STRING, description: "Estimated total cost range in USD" },
    weatherForecast: { type: Type.STRING, description: "Predicted weather conditions for this time of year" },
    packingList: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of 5-7 essential items to pack based on activities and weather"
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          theme: { type: Type.STRING, description: "Theme of the day (e.g., Cultural Dive, Adventure)" },
          hotelSuggestion: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              priceRange: { type: Type.STRING },
              coordinates: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER }
                },
                description: "Latitude and Longitude of the hotel"
              }
            },
            required: ["name", "description", "priceRange"]
          },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: "e.g., Morning, Afternoon, 10:00 AM" },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                location: { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  },
                  description: "Approximate Latitude and Longitude of the activity location"
                },
                costEstimate: { type: Type.STRING },
                duration: { type: Type.STRING }
              },
              required: ["time", "title", "description", "location"]
            }
          },
          meals: {
            type: Type.OBJECT,
            properties: {
              lunch: { type: Type.STRING, description: "Restaurant or food suggestion matching dietary needs" },
              dinner: { type: Type.STRING, description: "Restaurant or food suggestion" }
            },
            required: ["lunch", "dinner"]
          }
        },
        required: ["day", "theme", "hotelSuggestion", "activities", "meals"]
      }
    }
  },
  required: ["tripTitle", "summary", "days", "packingList", "totalCostEstimate", "weatherForecast"]
};

export const generateItinerary = async (formData: TripFormData, apiKey: string): Promise<TripItinerary> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Create a detailed travel itinerary for a trip to ${formData.destination}.
    Dates: ${formData.startDate} to ${formData.endDate}.
    Travelers: ${formData.travelers}.
    Budget: ₹${formData.budget} USD equivalent (Output costs in local currency or USD).
    Interests: ${formData.interests.join(", ")}.
    Dietary Restrictions: ${formData.dietary}.

    Please ensure the itinerary is realistic, accounts for travel time, and suggests specific real locations/restaurants where possible.
    CRITICAL: Provide approximate Latitude and Longitude coordinates for the Hotel and every Activity to plot on a map.
    The tone should be professional yet exciting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: itinerarySchema,
        systemInstruction: "You are a world-class luxury travel agent. You plan perfect, logistical trips and know the coordinates of major landmarks.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as TripItinerary;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};