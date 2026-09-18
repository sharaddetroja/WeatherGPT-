export interface EmergencyHelpline {
  name: string;
  number: string;
}

export interface EmergencyGuidance {
  disasterType: 'cyclone' | 'flood' | 'heatwave' | 'lightning';
  title: string;
  summary: string;
  dos: string[];
  donts: string[];
  helplines: EmergencyHelpline[];
}

export const OFFICIAL_HELPLINES: EmergencyHelpline[] = [
  { name: 'National Emergency Response (NDRF)', number: '112' },
  { name: 'State Disaster Management Authority (SDMA)', number: '1070' },
  { name: 'District Emergency Center', number: '1077' },
  { name: 'Ambulance Medical Support', number: '108' }
];

export const EMERGENCY_PROTOCOLS_EN: Record<string, EmergencyGuidance> = {
  cyclone: {
    disasterType: 'cyclone',
    title: '🌀 Cyclone Emergency Safety Protocols',
    summary: 'Essential emergency safety rules and response protocols during severe cyclonic winds and coastal storm surges.',
    dos: [
      'Keep all doors and windows securely and tightly shut.',
      'Store battery-powered torches, emergency lights, first-aid kits, and sufficient potable drinking water.',
      'Take shelter exclusively in reinforced permanent (pucca) buildings away from window panes.',
      'Keep mobile phones, communication radios, and power banks fully charged.',
      'Turn off the main electrical power breakers and LPG gas cylinders before high-speed wind impact.'
    ],
    donts: [
      'Do not stand under trees, tin sheds, hoardings, or near electric poles and power lines.',
      'Do not stay in makeshift, thatched, or structurally weakened temporary dwellings.',
      'Never attempt to visit sea beaches, riverbanks, or coastal shorelines during cyclonic warnings.',
      'Do not go outside during the lull period (eye of the storm), as extreme winds will suddenly resume from the reverse direction.'
    ],
    helplines: OFFICIAL_HELPLINES
  },
  flood: {
    disasterType: 'flood',
    title: '🌊 Flood Emergency Safety Protocols',
    summary: 'Critical survival instructions and safety rules during heavy torrential downpours and flash flooding.',
    dos: [
      'Move valuable documents, dry food rations, medications, and potable drinking water to upper floors or elevated platforms.',
      'Listen closely to official administrative advisories, disaster alerts, and emergency evacuation broadcasts.',
      'Boil tap water or use water purification tablets before drinking to prevent waterborne contamination.',
      'Keep an emergency grab-bag ready with identification cards, dry clothes, flashlight, and an alert whistle.'
    ],
    donts: [
      'Do not walk, swim, or drive through moving floodwaters (Turn Around, Don\'t Drown).',
      'Never touch submerged electrical switches, fallen utility lines, or waterlogged transformers.',
      'Do not consume food that has been exposed to or touched by contaminated floodwaters.',
      'Do not allow children or senior citizens to venture near open stormwater drains or flooded roads.'
    ],
    helplines: OFFICIAL_HELPLINES
  },
  heatwave: {
    disasterType: 'heatwave',
    title: '☀️ Heatwave Emergency Safety Protocols',
    summary: 'Vital health protection measures and survival actions during extreme heatwave alerts and soaring temperatures.',
    dos: [
      'Drink plenty of water, ORS (Oral Rehydration Solution), coconut water, or buttermilk frequently, even if not thirsty.',
      'Stay indoors during peak sunshine hours (12:00 PM to 4:00 PM) with curtains drawn to maintain cooler indoor temperatures.',
      'Wear lightweight, loose-fitting, light-colored cotton clothing and cover your head with a hat, umbrella, or cloth when outside.',
      'Apply cool damp cloths to neck and forehead if feeling overheated, and maintain good indoor ventilation.'
    ],
    donts: [
      'Never leave children, senior citizens, or pets unattended inside locked or parked vehicles.',
      'Avoid strenuous outdoor manual labor, sports, or heavy physical exertion during peak afternoon heat.',
      'Avoid consuming alcohol, heavily caffeinated coffee/tea, and high-sugar sodas that trigger rapid dehydration.',
      'Do not skip meals or venture outdoors on an empty stomach during severe heat advisories.'
    ],
    helplines: OFFICIAL_HELPLINES
  },
  lightning: {
    disasterType: 'lightning',
    title: '⚡ Lightning & Thunderstorm Safety Protocols',
    summary: 'Immediate life-saving protocols and hazard avoidance during active lightning strikes and severe thunderstorms.',
    dos: [
      'Immediately seek shelter inside an enclosed permanent building or a hardtop vehicle with closed windows.',
      'Unplug sensitive electrical appliances and avoid using corded phones or wired electronic devices.',
      'Stay away from plumbing fixtures, sinks, bathtubs, and metal water pipes during active thunderstorms.',
      'If caught in an open area with no shelter, crouch low in a ball-like stance with feet close together and hands over ears.'
    ],
    donts: [
      'Never seek shelter under isolated tall trees, open tin sheds, metal towers, or wire fences.',
      'Do not stand in wide open fields, hilltops, golf courses, or near open water bodies.',
      'Do not carry, raise, or hold umbrellas with metal tips or frames in open terrain.',
      'Do not lie flat on the ground; minimize your body contact area with the wet surface.'
    ],
    helplines: OFFICIAL_HELPLINES
  }
};

/**
 * Direct Hindi-to-English translation mapping for backend NDMA live engine phrases
 */
const HINDI_TO_ENGLISH_MAP: Record<string, string> = {
  // Cyclone
  'घर के दरवाजे और खिड़कियां कसकर बंद रखें।': 'Keep all doors and windows securely and tightly closed.',
  'टॉर्च, इमरजेंसी लाइट और पीने का पानी स्टोर रखें।': 'Store torches, emergency lights, and sufficient drinking water.',
  'केवल पक्के मकान में ही शरण लें।': 'Seek shelter exclusively in reinforced permanent (pucca) buildings.',
  'पेड़ों या बिजली के खंभों के नीचे खड़े न हों।': 'Do not stand under trees or electric poles.',
  'कच्चे या जर्जर मकान में न रहें।': 'Do not stay in makeshift, thatched, or damaged structures.',
  'समुद्र तट की ओर जाने की भूल न करें।': 'Never venture towards sea beaches or coastal shorelines.',
  // Flood
  'कीमती सामान और पीने का पानी ऊपर शिफ्ट करें।': 'Move valuable belongings, documents, and potable water to higher floors.',
  'प्रशासन की आधिकारिक घोषणाएं सुनें।': 'Listen to official announcements and emergency broadcast advisories.',
  'बाढ़ के बहते पानी में गाड़ी न चलाएं।': 'Do not drive or walk through active flowing floodwaters.',
  'पानी में डूबे बिजली के तारों को न छुएं।': 'Never touch submerged electrical cables or fallen utility poles.',
  // Lightning
  'तुरंत बंद पक्के मकान या कार के अंदर जाएं।': 'Immediately take shelter inside an enclosed building or hardtop car.',
  'बिजली के उपकरणों के प्लग निकाल दें।': 'Unplug sensitive electrical appliances and avoid corded electronics.',
  'पेड़ों या लोहे के खंभों के नीचे शरण न लें।': 'Never take shelter under tall trees or metal poles.',
  'खुले खेत में छाता लेकर खड़े न हों।': 'Do not stand in open fields or hold umbrellas with metal tips.'
};

/**
 * Checks if a string contains Devanagari (Hindi) characters
 */
function containsDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Translates an incoming emergency guidance object into clean, verified English
 */
export function translateEmergencyGuideToEnglish(
  rawGuidance: any,
  disasterType: 'cyclone' | 'flood' | 'heatwave' | 'lightning' | string
): EmergencyGuidance {
  const fallback = EMERGENCY_PROTOCOLS_EN[disasterType] || EMERGENCY_PROTOCOLS_EN.cyclone;

  if (!rawGuidance) {
    return fallback;
  }

  // If disasterType is heatwave and backend returned generic disaster rules, use specific heatwave protocol
  if (disasterType === 'heatwave' && (rawGuidance.disasterType === 'general' || rawGuidance.title?.includes('General'))) {
    return EMERGENCY_PROTOCOLS_EN.heatwave;
  }

  const translateList = (items?: any[], defaultList?: string[]): string[] => {
    if (!Array.isArray(items) || items.length === 0) {
      return defaultList || [];
    }
    return items.map((item) => {
      if (typeof item !== 'string') return String(item);
      const trimmed = item.trim();
      if (HINDI_TO_ENGLISH_MAP[trimmed]) {
        return HINDI_TO_ENGLISH_MAP[trimmed];
      }
      // If contains Hindi script and no direct match, check fallback list
      if (containsDevanagari(trimmed) && defaultList && defaultList.length > 0) {
        return defaultList[0];
      }
      return trimmed;
    });
  };

  const translatedDos = translateList(rawGuidance.dos, fallback.dos);
  const translatedDonts = translateList(rawGuidance.donts, fallback.donts);

  return {
    disasterType: (disasterType as any) || fallback.disasterType,
    title: rawGuidance.title && !containsDevanagari(rawGuidance.title) ? rawGuidance.title : fallback.title,
    summary: rawGuidance.summary && !containsDevanagari(rawGuidance.summary) ? rawGuidance.summary : fallback.summary,
    dos: translatedDos.length > 0 ? translatedDos : fallback.dos,
    donts: translatedDonts.length > 0 ? translatedDonts : fallback.donts,
    helplines: Array.isArray(rawGuidance.helplines) && rawGuidance.helplines.length > 0
      ? rawGuidance.helplines
      : fallback.helplines
  };
}

export function getLocalEmergencyProtocol(disasterType: string): EmergencyGuidance {
  return EMERGENCY_PROTOCOLS_EN[disasterType] || EMERGENCY_PROTOCOLS_EN.cyclone;
}
