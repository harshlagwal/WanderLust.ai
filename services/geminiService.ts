import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TripFormData, TripItinerary } from "../types";

// Schema for structured JSON output
const itinerarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING, description: "A catchy title for the trip" },
    summary: { type: Type.STRING, description: "A brief enthusiastic summary of the trip" },
    destination: { type: Type.STRING },
    totalCostEstimate: { type: Type.STRING, description: "Estimated total cost range in INR (Indian Rupees)" },
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
              priceRange: { type: Type.STRING, description: "Price in INR (₹)" }
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
                costEstimate: { type: Type.STRING, description: "Cost in INR (₹)" },
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
    Create a detailed travel itinerary for a trip.
    Traveler is going FROM: ${formData.currentLocation} TO: ${formData.destination}.
    Dates: ${formData.startDate} to ${formData.endDate}.
    Travelers: ${formData.travelers}.
    Budget: ₹${formData.budget} INR total.
    Interests: ${formData.interests.join(", ")}.
    Dietary Restrictions: ${formData.dietary}.

    IMPORTANT: All currency values must be in Indian Rupees (INR) and prefixed with the ₹ symbol. 
    IMPORTANT: All currency values must be in Indian Rupees (INR) and prefixed with the ₹ symbol. 
    IMPORTANT: All location names, destination names, and descriptions MUST be in English script only.
    IMPORTANT: For 'destination' and 'location' fields, always use the format "City, State" (e.g., "Manali, Himachal Pradesh" instead of just "Manali") to ensure accurate mapping.
    Please ensure the itinerary is realistic, accounts for travel time, and suggests specific real locations/restaurants where possible.
    The tone should be professional yet exciting.
  `;



  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: itinerarySchema,
        systemInstruction: "You are a world-class luxury travel agent. You plan perfect, logistical trips.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);
    return {
      ...result,
      origin: formData.currentLocation,
      originalBudget: formData.budget
    } as TripItinerary;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};