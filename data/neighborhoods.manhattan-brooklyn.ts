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
          {
            key: "Midtown East – Sutton Place",
            label: "Midtown East – Sutton Place",
          },
          { key: "Midtown-Times Square", label: "Midtown-Times Square" },
          { key: "Midtown South", label: "Midtown South" },
          { key: "East Midtown-Turtle Bay", label: "East Midtown-Turtle Bay" },
          { key: "Hell's Kitchen", label: "Hell's Kitchen" },
          { key: "Murray Hill-Kips Bay", label: "Murray Hill-Kips Bay" },
          { key: "United Nations", label: "United Nations" },
          { key: "Central Park", label: "Central Park" },
        ],
      },

      {
        title: "Downtown Manhattan",
        items: [
          { key: "Chelsea-Hudson Yards", label: "Chelsea-Hudson Yards" },
          { key: "West Village", label: "West Village" },
          { key: "Greenwich Village", label: "Greenwich Village" },
          { key: "SoHo-Hudson Square", label: "SoHo-Hudson Square" },
          {
            key: "Midtown South-Flatiron-Union Square",
            label: "Midtown South-Flatiron-Union Square",
          },
          { key: "Gramercy", label: "Gramercy" },
          {
            key: "Stuyvesant Town-Peter Cooper Village",
            label: "Stuyvesant Town-Peter Cooper Village",
          },
          { key: "Lower East Side", label: "Lower East Side" },
          { key: "East Village", label: "East Village" },
          { key: "Chinatown-Two Bridges", label: "Chinatown-Two Bridges" },
          { key: "Two Bridges", label: "Two Bridges" },
          { key: "Little Italy", label: "Little Italy" },
          { key: "Civic Center", label: "Civic Center" },
          { key: "Tribeca-Civic Center", label: "Tribeca-Civic Center" },
          {
            key: "Financial District-Battery Park City",
            label: "Financial District-Battery Park City",
          },
          { key: "Battery Park City", label: "Battery Park City" },
        ],
      },

      {
        title: "Islands & Parks",
        items: [
          { key: "Roosevelt Island", label: "Roosevelt Island" },
          {
            key: "Governors Island-Ellis Island-Liberty Island",
            label: "Governors Island-Ellis Island-Liberty Island",
          },
          { key: "Randall's Island", label: "Randall's Island" },
          { key: "Highbridge Park", label: "Highbridge Park" },
          { key: "Inwood Hill Park", label: "Inwood Hill Park" },
        ],
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
          { key: "Brooklyn Navy Yard", label: "Brooklyn Navy Yard" },
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
        ],
      },

      {
        title: "South Brooklyn",
        items: [
          { key: "Park Slope", label: "Park Slope" },
          { key: "Sunset Park (West)", label: "Sunset Park (West)" },
          { key: "Sunset Park (Central)", label: "Sunset Park (Central)" },
          { key: "Borough Park", label: "Borough Park" },
          { key: "Bay Ridge", label: "Bay Ridge" },
          { key: "Bensonhurst", label: "Bensonhurst" },
          { key: "Coney Island-Sea Gate", label: "Coney Island-Sea Gate" },
          { key: "Brighton Beach", label: "Brighton Beach" },
        ],
      },
    ],
  },
};

export default boroughNeighborhoods;
