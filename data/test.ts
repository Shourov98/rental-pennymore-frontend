/* =========================
   TYPES (same file)
========================= */

export type NeighborhoodItem = {
  key: string;
  label: string;
};

export type NeighborhoodSection = {
  title: string;
  items: NeighborhoodItem[];
};

export type BoroughNeighborhood = {
  title: string;
  sections: NeighborhoodSection[];
};

export type BoroughNeighborhoods = {
  Manhattan: BoroughNeighborhood;
  Brooklyn: BoroughNeighborhood;
};

/* =========================
    DATA (keys === labels)
========================= */

const boroughNeighborhoods: BoroughNeighborhoods = {
  Manhattan: {
    title: "Neighborhoods in Manhattan",
    sections: [
      {
        title: "All Neighborhoods",
        items: [
          {
            key: "Battery Park City",
            label: "Battery Park City",
          },
          {
            key: "Central Park",
            label: "Central Park",
          },
          {
            key: "Chelsea-Hudson Yards",
            label: "Chelsea-Hudson Yards",
          },
          {
            key: "Chelsea–Hudson Yards",
            label: "Chelsea–Hudson Yards",
          },
          {
            key: "Chinatown",
            label: "Chinatown",
          },
          {
            key: "Civic Center",
            label: "Civic Center",
          },
          {
            key: "East Harlem (North)",
            label: "East Harlem (North)",
          },
          {
            key: "East Harlem (South)",
            label: "East Harlem (South)",
          },
          {
            key: "East Midtown-Turtle Bay",
            label: "East Midtown-Turtle Bay",
          },
          {
            key: "East Village",
            label: "East Village",
          },
          {
            key: "Financial District",
            label: "Financial District",
          },
          {
            key: "Flatiron - Union Square",
            label: "Flatiron - Union Square",
          },
          {
            key: "Governors Island-Ellis Island-Liberty Island",
            label: "Governors Island-Ellis Island-Liberty Island",
          },
          {
            key: "Gramercy Park",
            label: "Gramercy Park",
          },
          {
            key: "Greenwich Village",
            label: "Greenwich Village",
          },
          {
            key: "Hamilton Heights-Sugar Hill",
            label: "Hamilton Heights-Sugar Hill",
          },
          {
            key: "Hamilton Heights–Sugar Hill",
            label: "Hamilton Heights–Sugar Hill",
          },
          {
            key: "Harlem (North)",
            label: "Harlem (North)",
          },
          {
            key: "Harlem (South)",
            label: "Harlem (South)",
          },
          {
            key: "Hell's Kitchen",
            label: "Hell's Kitchen",
          },
          {
            key: "Highbridge Park",
            label: "Highbridge Park",
          },
          {
            key: "Inwood",
            label: "Inwood",
          },
          {
            key: "Inwood Hill Park",
            label: "Inwood Hill Park",
          },
          {
            key: "Kips Bay",
            label: "Kips Bay",
          },
          {
            key: "Little Italy",
            label: "Little Italy",
          },
          {
            key: "Lower East Side",
            label: "Lower East Side",
          },
          {
            key: "Manhattanville-West Harlem",
            label: "Manhattanville-West Harlem",
          },
          {
            key: "Manhattanville–West Harlem",
            label: "Manhattanville–West Harlem",
          },
          {
            key: "Marble Hill",
            label: "Marble Hill",
          },
          {
            key: "Marble Hill–Inwood",
            label: "Marble Hill–Inwood",
          },
          {
            key: "Midtown",
            label: "Midtown",
          },
          {
            key: "Midtown East – Sutton Place",
            label: "Midtown East – Sutton Place",
          },
          {
            key: "Midtown East–Turtle Bay",
            label: "Midtown East–Turtle Bay",
          },
          {
            key: "Midtown South",
            label: "Midtown South",
          },
          {
            key: "Midtown West – Hell’s Kitchen",
            label: "Midtown West – Hell’s Kitchen",
          },
          {
            key: "Morningside Heights",
            label: "Morningside Heights",
          },
          {
            key: "Murray Hill",
            label: "Murray Hill",
          },
          {
            key: "Randall's Island",
            label: "Randall's Island",
          },
          {
            key: "Roosevelt Island",
            label: "Roosevelt Island",
          },
          {
            key: "SoHo-Hudson Square",
            label: "SoHo-Hudson Square",
          },
          {
            key: "SoHo–Hudson Square",
            label: "SoHo–Hudson Square",
          },
          {
            key: "Stuyvesant Town-Peter Cooper Village",
            label: "Stuyvesant Town-Peter Cooper Village",
          },
          {
            key: "Stuyvesant Town–Peter Cooper Village",
            label: "Stuyvesant Town–Peter Cooper Village",
          },
          {
            key: "TriBeCa",
            label: "TriBeCa",
          },
          {
            key: "Two Bridges",
            label: "Two Bridges",
          },
          {
            key: "Union Square Park",
            label: "Union Square Park",
          },
          {
            key: "United Nations",
            label: "United Nations",
          },
          {
            key: "Upper East Side – Lenox Hill",
            label: "Upper East Side – Lenox Hill",
          },
          {
            key: "Upper East Side-Carnegie Hill",
            label: "Upper East Side-Carnegie Hill",
          },
          {
            key: "Upper East Side-Yorkville",
            label: "Upper East Side-Yorkville",
          },
          {
            key: "Upper East Side–Carnegie Hill",
            label: "Upper East Side–Carnegie Hill",
          },
          {
            key: "Upper East Side–Lenox Hill",
            label: "Upper East Side–Lenox Hill",
          },
          {
            key: "Upper East Side–Yorkville",
            label: "Upper East Side–Yorkville",
          },
          {
            key: "Upper West Side (Central)",
            label: "Upper West Side (Central)",
          },
          {
            key: "Upper West Side-Lincoln Square",
            label: "Upper West Side-Lincoln Square",
          },
          {
            key: "Upper West Side-Manhattan Valley",
            label: "Upper West Side-Manhattan Valley",
          },
          {
            key: "Upper West Side–Lincoln Square",
            label: "Upper West Side–Lincoln Square",
          },
          {
            key: "Upper West Side–Manhattan Valley",
            label: "Upper West Side–Manhattan Valley",
          },
          {
            key: "Washington Heights (North)",
            label: "Washington Heights (North)",
          },
          {
            key: "Washington Heights (South)",
            label: "Washington Heights (South)",
          },
          {
            key: "West Village",
            label: "West Village",
          },
        ],
      },
    ],
  },
  Brooklyn: {
    title: "Neighborhoods in Brooklyn",
    sections: [
      {
        title: "All Neighborhoods",
        items: [
          {
            key: "Barren Island-Floyd Bennett Field",
            label: "Barren Island-Floyd Bennett Field",
          },
          {
            key: "Bath Beach",
            label: "Bath Beach",
          },
          {
            key: "Bay Ridge",
            label: "Bay Ridge",
          },
          {
            key: "Bedford-Stuyvesant (East)",
            label: "Bedford-Stuyvesant (East)",
          },
          {
            key: "Bedford-Stuyvesant (West)",
            label: "Bedford-Stuyvesant (West)",
          },
          {
            key: "Bensonhurst",
            label: "Bensonhurst",
          },
          {
            key: "Borough Park",
            label: "Borough Park",
          },
          {
            key: "Brighton Beach",
            label: "Brighton Beach",
          },
          {
            key: "Brooklyn Heights",
            label: "Brooklyn Heights",
          },
          {
            key: "Brooklyn Navy Yard",
            label: "Brooklyn Navy Yard",
          },
          {
            key: "Brownsville",
            label: "Brownsville",
          },
          {
            key: "Bushwick (East)",
            label: "Bushwick (East)",
          },
          {
            key: "Bushwick (West)",
            label: "Bushwick (West)",
          },
          {
            key: "Calvert Vaux Park",
            label: "Calvert Vaux Park",
          },
          {
            key: "Canarsie",
            label: "Canarsie",
          },
          {
            key: "Canarsie Park & Pier",
            label: "Canarsie Park & Pier",
          },
          {
            key: "Carroll Gardens-Cobble Hill-Gowanus-Red Hook",
            label: "Carroll Gardens-Cobble Hill-Gowanus-Red Hook",
          },
          {
            key: "Clinton Hill",
            label: "Clinton Hill",
          },
          {
            key: "Coney Island-Sea Gate",
            label: "Coney Island-Sea Gate",
          },
          {
            key: "Crown Heights (North)",
            label: "Crown Heights (North)",
          },
          {
            key: "Crown Heights (South)",
            label: "Crown Heights (South)",
          },
          {
            key: "Cypress Hills",
            label: "Cypress Hills",
          },
          {
            key: "Downtown Brooklyn-DUMBO-Boerum Hill",
            label: "Downtown Brooklyn-DUMBO-Boerum Hill",
          },
          {
            key: "Dyker Beach Park",
            label: "Dyker Beach Park",
          },
          {
            key: "Dyker Heights",
            label: "Dyker Heights",
          },
          {
            key: "East Flatbush-Erasmus",
            label: "East Flatbush-Erasmus",
          },
          {
            key: "East Flatbush-Farragut",
            label: "East Flatbush-Farragut",
          },
          {
            key: "East Flatbush-Remsen Village",
            label: "East Flatbush-Remsen Village",
          },
          {
            key: "East Flatbush-Rugby",
            label: "East Flatbush-Rugby",
          },
          {
            key: "East New York (North)",
            label: "East New York (North)",
          },
          {
            key: "East New York-City Line",
            label: "East New York-City Line",
          },
          {
            key: "East New York-New Lots",
            label: "East New York-New Lots",
          },
          {
            key: "East Williamsburg",
            label: "East Williamsburg",
          },
          {
            key: "Flatbush",
            label: "Flatbush",
          },
          {
            key: "Flatbush (West)-Ditmas Park-Parkville",
            label: "Flatbush (West)-Ditmas Park-Parkville",
          },
          {
            key: "Flatlands",
            label: "Flatlands",
          },
          {
            key: "Fort Greene",
            label: "Fort Greene",
          },
          {
            key: "Fort Hamilton",
            label: "Fort Hamilton",
          },
          {
            key: "Gravesend (East)-Homecrest",
            label: "Gravesend (East)-Homecrest",
          },
          {
            key: "Gravesend (South)",
            label: "Gravesend (South)",
          },
          {
            key: "Gravesend (West)",
            label: "Gravesend (West)",
          },
          {
            key: "Green-Wood Cemetery",
            label: "Green-Wood Cemetery",
          },
          {
            key: "Greenpoint",
            label: "Greenpoint",
          },
          {
            key: "Highland Park-Cypress Hills Cemeteries (South)",
            label: "Highland Park-Cypress Hills Cemeteries (South)",
          },
          {
            key: "Holy Cross Cemetery",
            label: "Holy Cross Cemetery",
          },
          {
            key: "Jamaica Bay (West)",
            label: "Jamaica Bay (West)",
          },
          {
            key: "Kensington",
            label: "Kensington",
          },
          {
            key: "Lincoln Terrace Park",
            label: "Lincoln Terrace Park",
          },
          {
            key: "Madison",
            label: "Madison",
          },
          {
            key: "Mapleton-Midwood (West)",
            label: "Mapleton-Midwood (West)",
          },
          {
            key: "Marine Park-Mill Basin-Bergen Beach",
            label: "Marine Park-Mill Basin-Bergen Beach",
          },
          {
            key: "Marine Park-Plumb Island",
            label: "Marine Park-Plumb Island",
          },
          {
            key: "McGuire Fields",
            label: "McGuire Fields",
          },
          {
            key: "Midwood",
            label: "Midwood",
          },
          {
            key: "Ocean Hill",
            label: "Ocean Hill",
          },
          {
            key: "Park Slope",
            label: "Park Slope",
          },
          {
            key: "Prospect Heights",
            label: "Prospect Heights",
          },
          {
            key: "Prospect Lefferts Gardens-Wingate",
            label: "Prospect Lefferts Gardens-Wingate",
          },
          {
            key: "Prospect Park",
            label: "Prospect Park",
          },
          {
            key: "Sheepshead Bay-Manhattan Beach-Gerritsen Beach",
            label: "Sheepshead Bay-Manhattan Beach-Gerritsen Beach",
          },
          {
            key: "Shirley Chisholm State Park",
            label: "Shirley Chisholm State Park",
          },
          {
            key: "South Williamsburg",
            label: "South Williamsburg",
          },
          {
            key: "Spring Creek-Starrett City",
            label: "Spring Creek-Starrett City",
          },
          {
            key: "Sunset Park Central",
            label: "Sunset Park Central",
          },
          {
            key: "Sunset Park East–Borough Park West",
            label: "Sunset Park East–Borough Park West",
          },
          {
            key: "Sunset Park West (Greenwood Heights)",
            label: "Sunset Park West (Greenwood Heights)",
          },
          {
            key: "The Evergreens Cemetery",
            label: "The Evergreens Cemetery",
          },
          {
            key: "Williamsburg",
            label: "Williamsburg",
          },
          {
            key: "Windsor Terrace-South Slope",
            label: "Windsor Terrace-South Slope",
          },
        ],
      },
    ],
  },
} as const;

export default boroughNeighborhoods;
