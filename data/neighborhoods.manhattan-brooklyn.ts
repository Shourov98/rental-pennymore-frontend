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
        title: "Upper Manhattan",
        items: [
          { key: "Inwood", label: "Inwood" },
          { key: "Marble Hill–Inwood", label: "Marble Hill" },
          {
            key: "Washington Heights (North)",
            label: "Washington Heights (North)",
          },
          {
            key: "Washington Heights (South)",
            label: "Washington Heights (South)",
          },
          { key: "Harlem (North)", label: "Harlem (North)" },
          { key: "Harlem (South)", label: "Harlem (South)" },
          {
            key: "Hamilton Heights-Sugar Hill",
            label: "Hamilton Heights-Sugar Hill",
          },
          {
            key: "Manhattanville-West Harlem",
            label: "Manhattanville-West Harlem",
          },
          { key: "East Harlem (North)", label: "East Harlem (North)" },
          { key: "East Harlem (South)", label: "East Harlem (South)" },
          { key: "Morningside Heights", label: "Morningside Heights" },
        ],
      },

      {
        title: "Uptown Manhattan",
        items: [
          {
            key: "Upper West Side-Manhattan Valley",
            label: "Upper West Side-Manhattan Valley",
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
            key: "Upper East Side-Yorkville",
            label: "Upper East Side-Yorkville",
          },
          {
            key: "Upper East Side-Carnegie Hill",
            label: "Upper East Side-Carnegie Hill",
          },
          {
            key: "Upper East Side – Lenox Hill",
            label: "Upper East Side – Lenox Hill",
          },
        ],
      },

      {
        title: "Midtown Manhattan",
        items: [
          { key: "Midtown", label: "Midtown" },
          { key: "Midtown South", label: "Midtown South" },
          {
            key: "Midtown East – Sutton Place",
            label: "Midtown East – Sutton Place",
          },
          { key: "Midtown East–Turtle Bay", label: "Midtown East–Turtle Bay" },
          {
            key: "Midtown West – Hell’s Kitchen",
            label: "Midtown West – Hell’s Kitchen",
          },
          { key: "Murray Hill", label: "Murray Hill" },
          { key: "Union Square Park", label: "Union Square" },
        ],
      },

      {
        title: "Downtown Manhattan",
        items: [
          { key: "Chelsea-Hudson Yards", label: "Chelsea-Hudson Yards" },
          { key: "Flatiron - Union Square", label: "Flatiron - Union Square" },
          { key: "SoHo-Hudson Square", label: "SoHo-Hudson Square" },
          { key: "Gramercy", label: "Gramercy" },
          { key: "Kips Bay", label: "Kips Bay" },
          { key: "Gramercy Park", label: "Gramercy Park" },
          {
            key: "Stuyvesant Town-Peter Cooper Village",
            label: "Stuyvesant Town-Peter Cooper Village",
          },
          { key: "Greenwich Village", label: "Greenwich Village" },
          { key: "West Village", label: "West Village" },
          { key: "East Village", label: "East Village" },
          { key: "Lower East Side", label: "Lower East Side" },
          { key: "Chinatown", label: "Chinatown" },
          { key: "Two Bridges", label: "Two Bridges" },
          { key: "Little Italy", label: "Little Italy" },
          { key: "Civic Center", label: "Civic Center" },
          { key: "TriBeCa", label: "TriBeCa" },
          { key: "Financial District", label: "Financial District" },
          { key: "Battery Park City", label: "Battery Park City" },
        ],
      },

      {
        title: "Islands & Parks",
        items: [{ key: "Roosevelt Island", label: "Roosevelt Island" }],
      },
    ],
  },

  Brooklyn: {
    title: "Neighborhoods in Brooklyn",
    sections: [
      {
        title: "North Brooklyn",
        items: [
          { key: "Greenpoint", label: "Greenpoint" },
          { key: "Williamsburg", label: "Williamsburg" },
          { key: "South Williamsburg", label: "South Williamsburg" },
          { key: "East Williamsburg", label: "East Williamsburg" },
          { key: "Bushwick (West)", label: "Bushwick (West)" },
          { key: "Bushwick (East)", label: "Bushwick (East)" },
          {
            key: "Carroll Gardens-Cobble Hill-Gowanus-Red Hook",
            label: "Carroll Gardens-Cobble Hill-Gowanus-Red Hook",
          },
          { key: "Brooklyn Navy Yard", label: "Brooklyn Navy Yard" },
        ],
      },

      {
        title: "Central Brooklyn",
        items: [
          { key: "Brooklyn Heights", label: "Brooklyn Heights" },
          {
            key: "Downtown Brooklyn-DUMBO-Boerum Hill",
            label: "Downtown Brooklyn-DUMBO-Boerum Hill",
          },
          { key: "Fort Greene", label: "Fort Greene" },
          { key: "Clinton Hill", label: "Clinton Hill" },
          {
            key: "Bedford-Stuyvesant (West)",
            label: "Bedford-Stuyvesant (West)",
          },
          {
            key: "Bedford-Stuyvesant (East)",
            label: "Bedford-Stuyvesant (East)",
          },
          { key: "Crown Heights (North)", label: "Crown Heights (North)" },
          { key: "Crown Heights (South)", label: "Crown Heights (South)" },
          { key: "Prospect Heights", label: "Prospect Heights" },
          { key: "Ocean Hill", label: "Ocean Hill" },
          { key: "Brownsville", label: "Brownsville" },
          { key: "Kensington", label: "Kensington" },
        ],
      },

      {
        title: "East Flatbush",
        items: [
          {
            key: "Flatbush",
            label: "Flatbush (Central)",
          },
          { key: "East Flatbush-Erasmus", label: "East Flatbush-Erasmus" },
          { key: "East Flatbush-Farragut", label: "East Flatbush-Farragut" },
          { key: "East Flatbush-Rugby", label: "East Flatbush-Rugby" },
          {
            key: "East Flatbush-Remsen Village",
            label: "East Flatbush-Remsen Village",
          },
        ],
      },

      {
        title: "South Brooklyn",
        items: [
          { key: "Park Slope", label: "Park Slope" },
          { key: "Midwood", label: "Midwood" },
          {
            key: "Windsor Terrace-South Slope",
            label: "Windsor Terrace-South Slope",
          },
          { key: "Bay Ridge", label: "Bay Ridge" },
          {
            key: "Sheepshead Bay-Manhattan Beach-Gerritsen Beach",
            label: "Sheepshead Bay-Manhattan Beach-Gerritsen Beach",
          },
          {
            key: "Prospect Lefferts Gardens-Wingate",
            label: "Prospect Lefferts Gardens-Wingate",
          },
          {
            key: "Flatbush (West)-Ditmas Park-Parkville",
            label: "Flatbush (West)-Ditmas Park-Parkville",
          },
          {
            key: "Mapleton-Midwood (West)",
            label: "Mapleton-Midwood (West)",
          },
          {
            key: "Madison",
            label: "Madison",
          },
          { key: "Dyker Heights", label: "Dyker Heights" },
          { key: "Fort Hamilton", label: "Fort Hamilton" },
          { key: "Bensonhurst", label: "Bensonhurst" },
          { key: "Bath Beach", label: "Bath Beach" },
          { key: "Borough Park", label: "Borough Park" },
          { key: "Sunset Park Central", label: "Sunset Park Central" },
          {
            key: "Sunset Park East–Borough Park West",
            label: "Sunset Park East–Borough Park West",
          },
          {
            key: "Sunset Park West (Greenwood Heights)",
            label: "Sunset Park West (Greenwood Heights)",
          },
          { key: "Coney Island-Sea Gate", label: "Coney Island-Sea Gate" },
          { key: "Brighton Beach", label: "Brighton Beach" },
          { key: "Gravesend (West)", label: "Gravesend (West)" },
          { key: "Gravesend (South)", label: "Gravesend (South)" },
          {
            key: "Gravesend (East)-Homecrest",
            label: "Gravesend (East)-Homecrest",
          },
        ],
      },

      {
        title: "East Brooklyn",
        items: [
          { key: "Cypress Hills", label: "Cypress Hills" },
          { key: "Brooklyn Navy Yard", label: "Brooklyn Navy Yard" },
          { key: "East New York (North)", label: "East New York (North)" },
          { key: "East New York-New Lots", label: "East New York-New Lots" },
          { key: "East New York-City Line", label: "East New York-City Line" },
          {
            key: "Spring Creek-Starrett City",
            label: "Spring Creek-Starrett City",
          },
          { key: "Canarsie", label: "Canarsie" },
          { key: "Flatlands", label: "Flatlands" },
          {
            key: "Marine Park-Mill Basin-Bergen Beach",
            label: "Marine Park-Mill Basin-Bergen Beach",
          },
          {
            key: "Marine Park-Plumb Island",
            label: "Marine Park-Plumb Island",
          },
        ],
      },

      // {
      //   title: "Parks & Special Areas",
      //   items: [
      //     { key: "Prospect Park", label: "Prospect Park" },
      //     { key: "Green-Wood Cemetery", label: "Green-Wood Cemetery" },
      //     { key: "The Evergreens Cemetery", label: "The Evergreens Cemetery" },
      //     { key: "Holy Cross Cemetery", label: "Holy Cross Cemetery" },
      //     { key: "Calvert Vaux Park", label: "Calvert Vaux Park" },
      //     { key: "Dyker Beach Park", label: "Dyker Beach Park" },
      //     {
      //       key: "Barren Island-Floyd Bennett Field",
      //       label: "Barren Island-Floyd Bennett Field",
      //     },
      //     { key: "Jamaica Bay (West)", label: "Jamaica Bay (West)" },
      //     {
      //       key: "Shirley Chisholm State Park",
      //       label: "Shirley Chisholm State Park",
      //     },
      //     { key: "McGuire Fields", label: "McGuire Fields" },
      //     { key: "Canarsie Park & Pier", label: "Canarsie Park & Pier" },
      //     {
      //       key: "Highland Park-Cypress Hills Cemeteries (South)",
      //       label: "Highland Park-Cypress Hills Cemeteries (South)",
      //     },
      //     { key: "Lincoln Terrace Park", label: "Lincoln Terrace Park" },
      //   ],
      // },
    ],
  },
} as const;

export default boroughNeighborhoods;
