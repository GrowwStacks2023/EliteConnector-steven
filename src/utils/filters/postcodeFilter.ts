export interface LeadWithPostcode {
  id: string;
  zipcode: string;
  [key: string]: any;
}

export interface UserPostcodeAreas {
  postcode_areas?: string[];
}

// Extract postcode area from full postcode
// Examples: "SW1A 1AA" -> "SW", "M1 1AA" -> "M", "B1 1AA" -> "B"
export const extractPostcodeArea = (fullPostcode: string): string => {
  if (!fullPostcode) return '';
  
  // Remove spaces and convert to uppercase
  const cleaned = fullPostcode.trim().toUpperCase().replace(/\s+/g, '');
  
  // Extract letters before first digit
  const match = cleaned.match(/^([A-Z]+)/);
  return match ? match[1] : '';
};

// Filter leads by postcode areas
export const filterByPostcodeAreas = (
  leads: LeadWithPostcode[],
  user: UserPostcodeAreas
): LeadWithPostcode[] => {
  const userPostcodeAreas = user.postcode_areas || [];
  
  // If no postcode areas selected, show no leads
  if (userPostcodeAreas.length === 0) {
    console.warn('⚠️ No postcode areas selected');
    return [];
  }

  return leads.filter(lead => {
    const leadPostcodeArea = extractPostcodeArea(lead.zipcode);
    
    if (!leadPostcodeArea) {
      console.warn('⚠️ Invalid postcode for lead:', lead.id, lead.zipcode);
      return false;
    }
    
    // Check if lead's postcode area matches any of user's selected areas
    return userPostcodeAreas.includes(leadPostcodeArea);
  });
};