/**
 * RRB ALP CBT-2 Result Data
 * Centralized database of RRB Zones and qualified roll numbers
 */

const RRB_ZONES = {
  "jammu": {
    name: "RRB Jammu - Srinagar",
    code: "JAMMU",
    region: "Northern Region",
    status: "available", // 'available' | 'coming_soon'
    totalShortlisted: 45,
    pdfName: "RRB Jammu.pdf",
    lastUpdated: "October 1, 2026",
    officialWebsite: "https://www.rrbjammu.nic.in",
    rolls: [
      "2112512100001143",
      "2112512100001199",
      "2112512100001617",
      "2112512100001913",
      "2112512100001951",
      "2112512100013720",
      "2112512200001449",
      "2112521200020153",
      "2112521200020446",
      "2112521300001906",
      "2112521300019941",
      "2112521700001618",
      "2112521700001816",
      "2112521700013683",
      "2112521700019830",
      "2112521700020039",
      "2112521700020227",
      "2112521900001815",
      "2112521900001829",
      "2112522100001336",
      "2112522100001659",
      "2112522100001748",
      "2112522100001780",
      "2112522100020308",
      "2112522600001848",
      "2112523100019774",
      "2112531200001028",
      "2112531200001167",
      "2112531200001491",
      "2112532100001188",
      "2112532100020194",
      "2112532100020534",
      "2112532100020547",
      "2112532800001022",
      "2112532800020415",
      "2112541300019699",
      "2112541400019852",
      "2112541700019630",
      "2112541700019783",
      "2112541700020372",
      "2112541900001920",
      "2112542100001764",
      "2112542700020198",
      "2112552100019934",
      "2112552800001301"
    ]
  },
  "ahmedabad": {
    name: "RRB Ahmedabad",
    code: "ADI",
    region: "Western Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbahmedabad.gov.in",
    rolls: []
  },
  "ajmer": {
    name: "RRB Ajmer",
    code: "AII",
    region: "North Western Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbajmer.gov.in",
    rolls: []
  },
  "prayagraj": {
    name: "RRB Prayagraj (Allahabad)",
    code: "ALD",
    region: "North Central Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbald.gov.in",
    rolls: []
  },
  "bangalore": {
    name: "RRB Bangalore",
    code: "SBC",
    region: "South Western Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbbnc.gov.in",
    rolls: []
  },
  "bhopal": {
    name: "RRB Bhopal",
    code: "BPL",
    region: "West Central Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbbhopal.gov.in",
    rolls: []
  },
  "bhubaneswar": {
    name: "RRB Bhubaneswar",
    code: "BBS",
    region: "East Coast Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbbbs.gov.in",
    rolls: []
  },
  "bilaspur": {
    name: "RRB Bilaspur",
    code: "BSP",
    region: "South East Central Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbbilaspur.gov.in",
    rolls: []
  },
  "chandigarh": {
    name: "RRB Chandigarh",
    code: "CDG",
    region: "Northern Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbcdg.gov.in",
    rolls: []
  },
  "chennai": {
    name: "RRB Chennai",
    code: "MAS",
    region: "Southern Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbchennai.gov.in",
    rolls: []
  },
  "gorakhpur": {
    name: "RRB Gorakhpur",
    code: "GKP",
    region: "North Eastern Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbgkp.gov.in",
    rolls: []
  },
  "guwahati": {
    name: "RRB Guwahati",
    code: "GHY",
    region: "Northeast Frontier Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbguwahati.gov.in",
    rolls: []
  },
  "kolkata": {
    name: "RRB Kolkata",
    code: "KOAA",
    region: "Eastern Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbkolkata.gov.in",
    rolls: []
  },
  "malda": {
    name: "RRB Malda",
    code: "MLDT",
    region: "Eastern Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbmalda.gov.in",
    rolls: []
  },
  "mumbai": {
    name: "RRB Mumbai",
    code: "BCT",
    region: "Western Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbmumbai.gov.in",
    rolls: []
  },
  "muzaffarpur": {
    name: "RRB Muzaffarpur",
    code: "MFP",
    region: "East Central Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbmuzaffarpur.gov.in",
    rolls: []
  },
  "patna": {
    name: "RRB Patna",
    code: "PNBE",
    region: "East Central Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbpatna.gov.in",
    rolls: []
  },
  "ranchi": {
    name: "RRB Ranchi",
    code: "RNC",
    region: "South Eastern Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbranchi.gov.in",
    rolls: []
  },
  "secunderabad": {
    name: "RRB Secunderabad",
    code: "SC",
    region: "South Central Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbsecunderabad.nic.in",
    rolls: []
  },
  "siliguri": {
    name: "RRB Siliguri",
    code: "SGUJ",
    region: "Northeast Frontier Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbsiliguri.gov.in",
    rolls: []
  },
  "thiruvananthapuram": {
    name: "RRB Thiruvananthapuram",
    code: "TVC",
    region: "Southern Region",
    status: "coming_soon",
    totalShortlisted: 0,
    pdfName: "",
    lastUpdated: "Awaiting Release",
    officialWebsite: "https://www.rrbthiruvananthapuram.gov.in",
    rolls: []
  }
};

// Quick helper to search roll number in zone or across all zones
function checkRollNumber(zoneKey, rollNumber) {
  const cleanRoll = String(rollNumber).trim();
  const zone = RRB_ZONES[zoneKey];
  
  if (!zone) {
    return { error: "Invalid zone selected" };
  }
  
  if (zone.status !== "available") {
    return {
      status: "pending_zone",
      zoneName: zone.name,
      message: `Results for ${zone.name} have not been uploaded yet.`
    };
  }
  
  const isQualified = zone.rolls.includes(cleanRoll);
  return {
    status: isQualified ? "qualified" : "not_qualified",
    zoneName: zone.name,
    zoneCode: zone.code,
    rollNumber: cleanRoll,
    totalShortlistedInZone: zone.rolls.length
  };
}
