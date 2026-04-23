/* NexEV product catalogue — loaded via <script src> to avoid CORS on file:// */
window.NEXEV_PRODUCTS = {
  "version": "2.0.0",
  "currency": "INR",
  "updated": "2026-04-08",
  "categories": [
    { "id": "kit",        "label": "Complete Kits"        },
    { "id": "bms",        "label": "BMS / PCM Boards"     },
    { "id": "conductor",  "label": "Conductors & Wire"    },
    { "id": "insulation", "label": "Insulation Materials" },
    { "id": "connector",  "label": "Connectors"           },
    { "id": "holder",     "label": "Cell Holders"         }
  ],
  "products": [

    {
      "id": "kit-1s-micro",
      "name": "Kit A \u2014 1S 3.7V Micro",
      "tagline": "TP4057-based single-cell charge board kit",
      "category": "kit",
      "status": "active",
      "featured": true,
      "price": 249,
      "compare_price": 299,
      "unit": "kit",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 5,  "price": 219, "label": "5+ kits" },
        { "qty": 10, "price": 189, "label": "10+ kits" }
      ],
      "stock": "in_stock",
      "sku": "NE-KIT-1S-001",
      "hsn_code": "8542",
      "gst_rate": 18,
      "images": ["assets/products/kit-1s-micro.jpg","assets/products/kit-1s-micro-2.jpg","assets/products/kit-1s-micro-3.jpg"],
      "image_fallback": "kit",
      "tags": ["kit","1S","3.7V","TP4057","single-cell","micro"],
      "short_description": "1S 3.7V micro battery kit built around the TP4057 charge management PCB. Ideal for coin cell replacements and small Li-Ion projects.",
      "description": "Kit A is NexEV's entry-level single-cell assembly kit. Centred on a TP4057-based charge PCB, it includes everything to build, protect, and charge a single 18650 or Li-Ion pouch cell. Perfect for IoT sensors, torches, and DIY gadgets.",
      "contents": [
        "TP4057 PCB charge board",
        "1S PCM protection module",
        "Nickel strip (spot-weld grade)",
        "18650 insulation rings (10 pcs)",
        "18650 cell holder (\u00d71)",
        "Kapton tape strip",
        "Silicone wire leads (red + black)"
      ],
      "specs": {
        "Configuration":  "1S (3.7V nominal)",
        "Charge IC":      "TP4057",
        "Charge current": "Up to 1A (adjustable)",
        "Protection":     "Over-charge, over-discharge, short-circuit",
        "Cell format":    "18650 / Li-Ion pouch",
        "Use case":       "IoT, sensors, torches, micro packs"
      },
      "shipping": {
        "weight_grams": 80,
        "fulfillment": "Ships within 2 business days from Bengaluru, Karnataka",
        "courier": "Speed Post / Delhivery / Shiprocket"
      },
      "amazon_url": "",
      "meta": {
        "title": "Kit A \u2014 1S 3.7V Micro Battery Kit | NexEV",
        "description": "TP4057-based 1S micro Li-Ion assembly kit. Charge board, protection PCB, nickel strip, cell holder. Ships from Karnataka."
      }
    },

    {
      "id": "kit-1s-fast-charge",
      "name": "Kit B \u2014 1S Fast Charge",
      "tagline": "3A PCM BMS for rapid single-cell charging",
      "category": "kit",
      "status": "active",
      "featured": false,
      "price": 349,
      "compare_price": 419,
      "unit": "kit",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 5,  "price": 309, "label": "5+ kits" },
        { "qty": 10, "price": 279, "label": "10+ kits" }
      ],
      "stock": "in_stock",
      "sku": "NE-KIT-1S-FC-001",
      "hsn_code": "8542",
      "gst_rate": 18,
      "images": ["assets/products/kit-1s-fast-charge.jpg","assets/products/kit-1s-fast-charge-2.jpg","assets/products/kit-1s-fast-charge-3.jpg"],
      "image_fallback": "kit",
      "tags": ["kit","1S","fast-charge","3A","PCM","BMS"],
      "short_description": "1S fast-charge kit with a 3A PCM BMS \u2014 charges a single 18650 cell three times faster than standard 1A boards.",
      "description": "Kit B upgrades single-cell builds with a high-current 3A PCM BMS. Suitable for power banks, high-drain tools, and projects where charge time matters. All components included for a complete, safe build.",
      "contents": [
        "3A PCM BMS protection module",
        "Nickel strip (spot-weld grade)",
        "18650 insulation rings (10 pcs)",
        "18650 cell holder (\u00d71)",
        "14 AWG silicone wire leads (red + black)",
        "Kapton tape strip",
        "XT60H connector pair"
      ],
      "specs": {
        "Configuration":  "1S (3.7V nominal)",
        "BMS current":    "3A continuous",
        "Protection":     "Over-charge, over-discharge, over-current, short-circuit",
        "Cell format":    "18650",
        "Connector":      "XT60H gold-plated",
        "Use case":       "Power banks, high-drain tools"
      },
      "shipping": {
        "weight_grams": 110,
        "fulfillment": "Ships within 2 business days from Bengaluru, Karnataka",
        "courier": "Speed Post / Delhivery / Shiprocket"
      },
      "amazon_url": "",
      "meta": {
        "title": "Kit B \u2014 1S Fast Charge Battery Kit | NexEV",
        "description": "1S 3A PCM BMS fast-charge kit. All components for a single-cell 18650 pack. Ships from Karnataka."
      }
    },

    {
      "id": "kit-2s-boost",
      "name": "Kit C \u2014 2S Boost",
      "tagline": "IP2326 boost module for 2S Li-Ion packs",
      "category": "kit",
      "status": "active",
      "featured": false,
      "price": 449,
      "compare_price": 549,
      "unit": "kit",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 5,  "price": 399, "label": "5+ kits" },
        { "qty": 10, "price": 369, "label": "10+ kits" }
      ],
      "stock": "in_stock",
      "sku": "NE-KIT-2S-BST-001",
      "hsn_code": "8542",
      "gst_rate": 18,
      "images": ["assets/products/kit-2s-boost.jpg","assets/products/kit-2s-boost-2.jpg","assets/products/kit-2s-boost-3.jpg"],
      "image_fallback": "kit",
      "tags": ["kit","2S","7.4V","boost","IP2326","power-bank"],
      "short_description": "2S 7.4V pack kit with IP2326/boost module \u2014 suitable for 5V USB power banks, drone packs, and portable devices.",
      "description": "Kit C bundles a 2S BMS with an IP2326-based boost converter module that outputs regulated 5V USB from a 2S Li-Ion pack. Ideal for power banks, GPS trackers, and small RC/drone applications.",
      "contents": [
        "IP2326 boost/charge module",
        "2S BMS protection board",
        "Pure nickel strip",
        "18650 insulation rings (20 pcs)",
        "2\u00d7 18650 cell holders",
        "14 AWG silicone wire leads",
        "Kapton tape strip",
        "PVC heat shrink tube (small)"
      ],
      "specs": {
        "Configuration":  "2S (7.4V nominal)",
        "Boost module":   "IP2326",
        "USB output":     "5V regulated",
        "BMS current":    "5A continuous",
        "Protection":     "Over-charge, over-discharge, short-circuit",
        "Use case":       "USB power banks, drones, GPS"
      },
      "shipping": {
        "weight_grams": 150,
        "fulfillment": "Ships within 2 business days from Bengaluru, Karnataka",
        "courier": "Speed Post / Delhivery / Shiprocket"
      },
      "amazon_url": "",
      "meta": {
        "title": "Kit C \u2014 2S Boost Battery Kit | NexEV",
        "description": "2S Li-Ion boost kit with IP2326 module. 5V USB output. All components included. Ships from Karnataka."
      }
    },

    {
      "id": "kit-3s-12v-backup",
      "name": "Kit D \u2014 3S 12V Backup",
      "tagline": "3S BMS board \u2014 12V backup and UPS packs",
      "category": "kit",
      "status": "active",
      "featured": false,
      "price": 599,
      "compare_price": 749,
      "unit": "kit",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 5,  "price": 549, "label": "5+ kits" },
        { "qty": 10, "price": 499, "label": "10+ kits" }
      ],
      "stock": "in_stock",
      "sku": "NE-KIT-3S-BST-001",
      "hsn_code": "8537",
      "gst_rate": 18,
      "images": ["assets/products/kit-3s-12v.jpg","assets/products/kit-3s-12v-2.jpg","assets/products/kit-3s-12v-3.jpg"],
      "image_fallback": "bms",
      "tags": ["kit","3S","12V","BMS","backup","UPS"],
      "short_description": "3S 12V pack kit with a quality BMS board. Ideal for 12V backup, mini-UPS systems, and lighting packs.",
      "description": "Kit D is designed for 12V applications \u2014 router backups, LED systems, and small UPS builds. The 3S BMS board provides full cell-level protection and passive balancing.",
      "contents": [
        "3S BMS protection board",
        "Pure nickel strip (1m)",
        "18650 insulation rings (30 pcs)",
        "3\u00d7 18650 cell holders",
        "14 AWG silicone wire leads (red + black)",
        "Kapton tape strip",
        "PVC heat shrink tube",
        "XT60H connector pair"
      ],
      "specs": {
        "Configuration":  "3S (11.1V nominal / 12.6V full charge)",
        "Continuous":     "20A BMS",
        "Protection":     "Over-charge, over-discharge, over-current, short-circuit, balance",
        "Cell format":    "18650",
        "Use case":       "12V backup, UPS, LED packs, CCTV"
      },
      "shipping": {
        "weight_grams": 220,
        "fulfillment": "Ships within 2 business days from Bengaluru, Karnataka",
        "courier": "Speed Post / Delhivery / Shiprocket"
      },
      "amazon_url": "",
      "meta": {
        "title": "Kit D \u2014 3S 12V Backup Battery Kit | NexEV",
        "description": "3S 12V Li-Ion pack kit with BMS board. All components for backup and UPS builds. Ships from Karnataka."
      }
    },

    {
      "id": "kit-7s-24v-solar-ev",
      "name": "Kit E \u2014 7S 24V Solar & EV",
      "tagline": "Daly 7S BMS \u2014 24V solar storage and light EV",
      "category": "kit",
      "status": "active",
      "featured": true,
      "price": 1299,
      "compare_price": 1599,
      "unit": "kit",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 3,  "price": 1199, "label": "3+ kits" },
        { "qty": 5,  "price": 1099, "label": "5+ kits" },
        { "qty": 10, "price": 999,  "label": "10+ kits (workshop)" }
      ],
      "stock": "in_stock",
      "sku": "NE-KIT-7S-30A-001",
      "hsn_code": "8537",
      "gst_rate": 18,
      "images": ["assets/products/kit-7s-24v.jpg","assets/products/kit-7s-24v-2.jpg","assets/products/kit-7s-24v-3.jpg"],
      "image_fallback": "bms",
      "tags": ["kit","7S","24V","Daly","BMS","solar","EV","e-bike"],
      "short_description": "7S 24V kit with Daly BMS \u2014 suited for solar storage, light EVs, and 24V e-bike battery packs.",
      "description": "Kit E pairs a reliable Daly 7S 30A BMS with quality assembly components for 24V battery pack builds. Used widely in solar home systems, 24V e-bikes, and robotics platforms. Daly BMSs are field-proven and widely supported.",
      "contents": [
        "Daly 7S 30A BMS board",
        "Pure nickel strip (2m)",
        "18650 insulation rings (70 pcs)",
        "14 AWG silicone wire leads (red + black, 1.5m each)",
        "PVC heat shrink tube 170mm (1m)",
        "Kapton polyimide tape strip",
        "Insulation paper (0.5m)",
        "XT60H connector pair"
      ],
      "specs": {
        "Configuration":  "7S (25.9V nominal / 29.4V full charge)",
        "BMS":            "Daly 7S 30A",
        "Continuous":     "30A discharge",
        "Protection":     "Over-charge, over-discharge, over-current, short-circuit, balance",
        "Cell format":    "18650",
        "Use case":       "24V solar storage, e-bike, robotics"
      },
      "shipping": {
        "weight_grams": 450,
        "fulfillment": "Ships within 2 business days from Bengaluru, Karnataka",
        "courier": "Speed Post / Delhivery / Shiprocket"
      },
      "amazon_url": "",
      "meta": {
        "title": "Kit E \u2014 7S 24V Solar & EV Battery Kit | NexEV",
        "description": "7S 24V Daly BMS kit for solar and EV applications. All assembly components included. Ships from Karnataka."
      }
    },

    {
      "id": "kit-10s-36v-ev-robotics",
      "name": "Kit F \u2014 10S 36V EV Robotics",
      "tagline": "10S 30A BMS PCB \u2014 36V e-bike and robotics packs",
      "category": "kit",
      "status": "active",
      "featured": true,
      "price": 1799,
      "compare_price": 2199,
      "unit": "kit",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 3,  "price": 1649, "label": "3+ kits" },
        { "qty": 5,  "price": 1499, "label": "5+ kits" },
        { "qty": 10, "price": 1349, "label": "10+ kits (workshop)" }
      ],
      "stock": "in_stock",
      "sku": "NE-KIT-10S-001",
      "hsn_code": "8537",
      "gst_rate": 18,
      "images": ["assets/products/kit-10s-36v.jpg","assets/products/kit-10s-36v-2.jpg","assets/products/kit-10s-36v-3.jpg"],
      "image_fallback": "bms",
      "tags": ["kit","10S","36V","BMS","EV","e-bike","robotics"],
      "short_description": "10S 36V kit with a 30A BMS PCB \u2014 for 36V e-bike packs, robotics platforms, and EV conversion builds.",
      "description": "Kit F is NexEV's flagship pack kit for serious 36V builds. The 10S 30A BMS PCB offers full protection, passive cell balancing, and can handle continuous 30A \u2014 suitable for most mid-drive and hub-motor e-bikes. All assembly materials included.",
      "contents": [
        "10S 30A BMS PCB board",
        "Pure nickel strip (3m)",
        "18650 insulation rings (100 pcs)",
        "14 AWG silicone wire leads (red + black, 2m each)",
        "PVC heat shrink tube 170mm (1m)",
        "Kapton polyimide tape (25mm, 200m roll)",
        "Insulation paper roll (10m)",
        "XT60H connector pair",
        "18650 cell holders (10 pack)"
      ],
      "specs": {
        "Configuration":  "10S (37V nominal / 42V full charge)",
        "BMS current":    "30A continuous",
        "Protection":     "Over-charge, over-discharge, over-current, short-circuit, passive balance",
        "Cell format":    "18650",
        "Connector":      "Amass XT60H gold-plated",
        "Use case":       "36V e-bike, EV conversion, robotics"
      },
      "shipping": {
        "weight_grams": 600,
        "fulfillment": "Ships within 2 business days from Bengaluru, Karnataka",
        "courier": "Speed Post / Delhivery / Shiprocket"
      },
      "amazon_url": "",
      "meta": {
        "title": "Kit F \u2014 10S 36V EV Robotics Battery Kit | NexEV",
        "description": "10S 36V 30A BMS kit for e-bike and robotics. Complete assembly components. Ships from Karnataka."
      }
    },

    {
      "id": "bms-pcm-1s-3s",
      "name": "BMS / PCM Board (1S\u20133S)",
      "tagline": "Protection circuit modules for 1S, 2S, and 3S Li-Ion packs",
      "category": "bms",
      "status": "active",
      "featured": false,
      "price": 149,
      "compare_price": null,
      "unit": "unit",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 5,  "price": 129, "label": "5+ units" },
        { "qty": 10, "price": 109, "label": "10+ units" },
        { "qty": 25, "price": 89,  "label": "25+ units (workshop)" }
      ],
      "stock": "in_stock",
      "sku": "NE-BMS-1S3S-001",
      "hsn_code": "8542",
      "gst_rate": 18,
      "images": ["assets/products/bms-pcm-1s-3s.jpg","assets/products/bms-pcm-1s-3s-2.jpg","assets/products/bms-pcm-1s-3s-3.jpg"],
      "image_fallback": "bms",
      "tags": ["BMS","PCM","1S","2S","3S","protection","Li-Ion"],
      "short_description": "BMS / PCM protection boards for 1S, 2S, and 3S Li-Ion configurations. Select variant at checkout.",
      "description": "Electronic integrated circuit protection boards for small Li-Ion packs. Available in 1S (3.7V), 2S (7.4V), and 3S (11.1V) configurations. Provides over-charge, over-discharge, over-current, and short-circuit protection.",
      "specs": {
        "Variants":       "1S / 2S / 3S (specify in order notes)",
        "Chemistry":      "Li-Ion / LiPo",
        "Protection":     "Over-charge, over-discharge, over-current, short-circuit",
        "Typical rating": "3A\u201310A depending on variant",
        "Form factor":    "Compact PCB module",
        "HSN code":       "8542"
      },
      "shipping": { "weight_grams": 15, "fulfillment": "Ships within 2 business days", "courier": "Speed Post / Delhivery" },
      "amazon_url": "",
      "meta": {
        "title": "BMS / PCM Board 1S\u20133S Li-Ion Protection | NexEV",
        "description": "Li-Ion protection PCM / BMS boards for 1S, 2S, 3S packs. Over-charge, over-discharge, short-circuit protection. Ships from Karnataka."
      }
    },

    {
      "id": "bms-7s-10s",
      "name": "BMS Board (7S / 10S)",
      "tagline": "Electric control boards for 24V and 36V Li-Ion packs",
      "category": "bms",
      "status": "active",
      "featured": false,
      "price": 599,
      "compare_price": null,
      "unit": "unit",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 3,  "price": 549, "label": "3+ units" },
        { "qty": 5,  "price": 499, "label": "5+ units" },
        { "qty": 10, "price": 449, "label": "10+ units (workshop)" }
      ],
      "stock": "in_stock",
      "sku": "NE-BMS-7S10S-001",
      "hsn_code": "8537",
      "gst_rate": 18,
      "images": ["assets/products/bms-7s-10s.jpg","assets/products/bms-7s-10s-2.jpg","assets/products/bms-7s-10s-3.jpg"],
      "image_fallback": "bms",
      "tags": ["BMS","7S","10S","24V","36V","EV","e-bike","electric-control"],
      "short_description": "High-current BMS boards for 7S (24V) and 10S (36V) Li-Ion packs. Specify variant when ordering.",
      "description": "Electric control boards for medium-voltage Li-Ion battery packs. 7S variant for 24V solar and light-EV applications; 10S variant for 36V e-bikes and robotics. Both feature passive balancing and full protection suite.",
      "specs": {
        "Variants":       "7S (25.9V) / 10S (37V) \u2014 specify in order",
        "Max voltage":    "\u22641000V rail (board rated per variant)",
        "Continuous":     "20A\u201330A depending on variant",
        "Protection":     "Over-charge, over-discharge, over-current, short-circuit, passive balance",
        "Chemistry":      "Li-Ion 18650",
        "HSN code":       "8537"
      },
      "shipping": { "weight_grams": 80, "fulfillment": "Ships within 2 business days", "courier": "Speed Post / Delhivery" },
      "amazon_url": "",
      "meta": {
        "title": "BMS Board 7S / 10S \u2014 24V 36V Li-Ion | NexEV",
        "description": "7S and 10S BMS boards for 24V and 36V Li-Ion battery packs. EV and solar grade. Ships from Karnataka."
      }
    },

    {
      "id": "nickel-strip-1m",
      "name": "Pure Nickel Strip \u2014 1m Roll",
      "tagline": "High-purity, spot-weld grade, 8mm \u00d7 0.15mm",
      "category": "conductor",
      "status": "active",
      "featured": false,
      "price": 129,
      "compare_price": null,
      "unit": "roll",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 5,  "price": 115, "label": "5+ rolls" },
        { "qty": 10, "price": 99,  "label": "10+ rolls" }
      ],
      "stock": "in_stock",
      "sku": "NE-NS-001",
      "hsn_code": "7506",
      "gst_rate": 18,
      "images": ["assets/products/nickel-strip.jpg","assets/products/nickel-strip-2.jpg","assets/products/nickel-strip-3.jpg"],
      "image_fallback": "nickel-strip",
      "tags": ["nickel","strip","spot-weld","conductor","7506"],
      "short_description": "High-purity nickel strip for cell-to-cell spot welding. Correct width and thickness for 18650 series/parallel connections.",
      "description": "Pure nickel strip for battery pack assembly. Correct formulation for low-resistance, high-current cell interconnects. Compatible with standard spot welders used in 18650 pack building.",
      "specs": {
        "Material":   "Pure nickel (99%+)",
        "Width":      "8mm",
        "Thickness":  "0.15mm",
        "Length":     "1 metre per roll",
        "HSN code":   "7506",
        "Use":        "18650 / 21700 cell interconnects"
      },
      "shipping": { "weight_grams": 60, "fulfillment": "Ships within 2 business days", "courier": "Speed Post / Delhivery" },
      "amazon_url": "",
      "meta": {
        "title": "Pure Nickel Strip 1m \u2014 Battery Pack Spot Welding | NexEV",
        "description": "High-purity 8mm nickel strip for 18650 battery pack spot welding. 1 metre roll. Ships from Karnataka."
      }
    },

    {
      "id": "wire-14awg-1m-pair",
      "name": "14 AWG Silicone Wire \u2014 1m Pair",
      "tagline": "Red + black, heat-resistant, flexible",
      "category": "conductor",
      "status": "active",
      "featured": false,
      "price": 149,
      "compare_price": null,
      "unit": "pair",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 5,  "price": 129, "label": "5+ pairs" },
        { "qty": 10, "price": 109, "label": "10+ pairs" }
      ],
      "stock": "in_stock",
      "sku": "NE-WR-001",
      "hsn_code": "8544",
      "gst_rate": 28,
      "images": ["assets/products/wire-14awg.jpg","assets/products/wire-14awg-2.jpg","assets/products/wire-14awg-3.jpg"],
      "image_fallback": "wire",
      "tags": ["wire","14awg","silicone","cable","8544"],
      "short_description": "Flexible silicone-jacketed 14 AWG wire \u2014 rated for battery pack current, heat-resistant. Red + black, 1m each.",
      "description": "High-strand-count flexible silicone wire for battery pack lead wires and interconnects. Silicone jacket resists heat, cold, and flex fatigue \u2014 far superior to PVC for battery applications.",
      "specs": {
        "Gauge":          "14 AWG",
        "Jacket":         "Silicone (heat-resistant)",
        "Colour":         "Red and black (1m each)",
        "Current rating": "~15A continuous",
        "Temperature":    "-60\u00b0C to +200\u00b0C",
        "HSN code":       "8544",
        "Strands":        "High-strand-count flexible"
      },
      "shipping": { "weight_grams": 90, "fulfillment": "Ships within 2 business days", "courier": "Speed Post / Delhivery" },
      "amazon_url": "",
      "meta": {
        "title": "14 AWG Silicone Wire 1m Pair \u2014 Battery Pack | NexEV",
        "description": "Flexible 14 AWG silicone wire, red and black, 1m each. Heat-resistant. HSN 8544. Ships from Karnataka."
      }
    },

    {
      "id": "kapton-tape-25mm",
      "name": "Kapton / Polyimide Tape \u2014 25mm",
      "tagline": "Self-adhesive polyimide, 200m per roll",
      "category": "insulation",
      "status": "active",
      "featured": false,
      "price": 199,
      "compare_price": null,
      "unit": "roll",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 3,  "price": 179, "label": "3+ rolls" },
        { "qty": 10, "price": 159, "label": "10+ rolls" }
      ],
      "stock": "in_stock",
      "sku": "NE-KT-001",
      "hsn_code": "3919",
      "gst_rate": 18,
      "images": ["assets/products/kapton-tape.jpg","assets/products/kapton-tape-2.jpg","assets/products/kapton-tape-3.jpg"],
      "image_fallback": "kapton",
      "tags": ["kapton","polyimide","tape","insulation","thermal","3919"],
      "short_description": "High-temperature Kapton polyimide tape, 25mm width, 200m roll. Cell insulation, tab coverage, thermal protection.",
      "description": "Genuine polyimide tape for battery pack insulation. Used on positive cell terminals, between cell groups, and anywhere electrical isolation is needed near heat.",
      "specs": {
        "Material":    "Polyimide (Kapton-type)",
        "Width":       "25mm",
        "Length":      "200 metres per roll",
        "Adhesive":    "Silicone-based (self-adhesive)",
        "Temperature": "Up to 260\u00b0C continuous",
        "HSN code":    "3919",
        "Colour":      "Amber/yellow"
      },
      "shipping": { "weight_grams": 120, "fulfillment": "Ships within 2 business days", "courier": "Speed Post / Delhivery" },
      "amazon_url": "",
      "meta": {
        "title": "Kapton Polyimide Tape 25mm 200m \u2014 Battery Pack | NexEV",
        "description": "High-temperature Kapton / polyimide self-adhesive tape, 25mm, 200m roll. HSN 3919. Ships from Karnataka."
      }
    },

    {
      "id": "pvc-heat-shrink-170mm",
      "name": "PVC Heat Shrink Tube \u2014 170mm",
      "tagline": "Blue PVC battery pack wrap, 1 metre",
      "category": "insulation",
      "status": "active",
      "featured": false,
      "price": 89,
      "compare_price": null,
      "unit": "metre",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 5,  "price": 75, "label": "5+ metres" },
        { "qty": 10, "price": 65, "label": "10+ metres" }
      ],
      "stock": "in_stock",
      "sku": "NE-HS-001",
      "hsn_code": "3917",
      "gst_rate": 18,
      "images": ["assets/products/pvc-heat-shrink.jpg","assets/products/pvc-heat-shrink-2.jpg","assets/products/pvc-heat-shrink-3.jpg"],
      "image_fallback": "heat-shrink",
      "tags": ["heat-shrink","PVC","insulation","pack-wrap","3917"],
      "short_description": "Blue PVC heat shrink tube, 170mm flat width. Wraps a completed 18650 battery pack for insulation and clean finish.",
      "description": "Large-diameter PVC heat shrink tubing for wrapping completed battery packs. 170mm flat width. Shrinks evenly with a heat gun at ~80\u00b0C.",
      "specs": {
        "Material":     "PVC",
        "Colour":       "Blue",
        "Flat width":   "170mm",
        "Length":       "1 metre",
        "Shrink ratio": "2:1",
        "HSN code":     "3917",
        "Temperature":  "Shrinks at ~80\u00b0C"
      },
      "shipping": { "weight_grams": 80, "fulfillment": "Ships within 2 business days", "courier": "Speed Post / Delhivery" },
      "amazon_url": "",
      "meta": {
        "title": "PVC Heat Shrink 170mm \u2014 Battery Pack Wrap | NexEV",
        "description": "Blue PVC heat shrink tube 170mm flat width, 1 metre. HSN 3917. For battery pack finishing. Ships from Karnataka."
      }
    },

    {
      "id": "insulation-paper-barley-rings",
      "name": "Insulation Paper & Barley Rings",
      "tagline": "Cell-end insulation rings + between-group barrier paper",
      "category": "insulation",
      "status": "active",
      "featured": false,
      "price": 149,
      "compare_price": null,
      "unit": "pack",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 5,  "price": 129, "label": "5+ packs" },
        { "qty": 10, "price": 109, "label": "10+ packs" }
      ],
      "stock": "in_stock",
      "sku": "NE-INS-001",
      "hsn_code": "4823",
      "gst_rate": 12,
      "images": ["assets/products/insulation-paper-rings.jpg","assets/products/insulation-paper-rings-2.jpg","assets/products/insulation-paper-rings-3.jpg"],
      "image_fallback": "insulation-paper",
      "tags": ["insulation","paper","barley","rings","4823","cell"],
      "short_description": "Combo pack: 18650 barley/mika insulation rings (100 pcs) + electrical insulation paper roll (10m). Essential for any pack build.",
      "description": "Combined insulation consumables pack. Barley rings sit on the positive 18650 cell terminal to prevent shorts during spot welding. Insulation paper goes between cell groups and between the pack and housing. Both are essential for a safe build.",
      "contents": [
        "18650 barley / mika insulation rings \u2014 100 pcs",
        "Electrical insulation paper roll \u2014 10m \u00d7 100mm"
      ],
      "specs": {
        "Rings material":    "Mika / barley paper",
        "Rings quantity":    "100 per pack",
        "Paper material":    "Electrical insulation / kraft paper",
        "Paper dimensions":  "100mm wide \u00d7 10m roll",
        "Paper thickness":   "0.2mm",
        "HSN code":          "4823",
        "Application":       "18650 cell positive terminals, cell group separation"
      },
      "shipping": { "weight_grams": 100, "fulfillment": "Ships within 2 business days", "courier": "Speed Post / Delhivery" },
      "amazon_url": "",
      "meta": {
        "title": "Insulation Paper & Barley Rings \u2014 18650 Battery Pack | NexEV",
        "description": "100-pack 18650 insulation rings + 10m insulation paper roll. HSN 4823. Ships from Karnataka."
      }
    },

    {
      "id": "xt60h-jst-connector",
      "name": "XT60H / JST Connectors",
      "tagline": "Genuine Amass XT60H and JST pairs \u2014 gold-plated",
      "category": "connector",
      "status": "active",
      "featured": false,
      "price": 119,
      "compare_price": null,
      "unit": "pair",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 5,  "price": 99,  "label": "5+ pairs" },
        { "qty": 10, "price": 85,  "label": "10+ pairs" },
        { "qty": 25, "price": 75,  "label": "25+ pairs (workshop)" }
      ],
      "stock": "in_stock",
      "sku": "NE-XT-001",
      "hsn_code": "8536",
      "gst_rate": 18,
      "images": ["assets/products/xt60h-connector.jpg","assets/products/xt60h-connector-2.jpg","assets/products/xt60h-connector-3.jpg"],
      "image_fallback": "xt60h",
      "tags": ["connector","XT60H","JST","amass","gold-plated","8536"],
      "short_description": "Genuine Amass XT60H male + female pair. Also available: JST-XH and JST-SM variants. Specify type at checkout.",
      "description": "Gold-plated electrical connectors for battery pack applications. XT60H (industry standard for e-bikes and RC) and JST variants available. All connectors are rated \u22641000V and handle high continuous currents.",
      "specs": {
        "Variants":     "XT60H / JST-XH / JST-SM (specify in order)",
        "XT60H rating": "60A continuous, 90A burst",
        "Contact":      "Gold-plated copper",
        "Housing":      "High-temp nylon",
        "Wire gauge":   "12\u201316 AWG compatible",
        "HSN code":     "8536"
      },
      "shipping": { "weight_grams": 25, "fulfillment": "Ships within 2 business days", "courier": "Speed Post / Delhivery" },
      "amazon_url": "",
      "meta": {
        "title": "XT60H / JST Connector Pair \u2014 Battery Pack | NexEV",
        "description": "Amass XT60H and JST gold-plated connector pairs. HSN 8536. Ships from Karnataka."
      }
    },

    {
      "id": "cell-holder-18650-abs",
      "name": "18650 Cell Holders (ABS)",
      "tagline": "Rigid ABS plastic holders for spot-weld alignment",
      "category": "holder",
      "status": "active",
      "featured": false,
      "price": 149,
      "compare_price": null,
      "unit": "pack",
      "min_qty": 1,
      "bulk_tiers": [
        { "qty": 3,  "price": 135, "label": "3+ packs" },
        { "qty": 10, "price": 119, "label": "10+ packs" }
      ],
      "stock": "in_stock",
      "sku": "NE-BH-001",
      "hsn_code": "3926",
      "gst_rate": 18,
      "images": ["assets/products/battery-holder.jpg","assets/products/battery-holder-2.jpg","assets/products/battery-holder-3.jpg"],
      "image_fallback": "holder",
      "tags": ["holder","cell-holder","18650","ABS","alignment","3926"],
      "short_description": "ABS plastic 18650 cell holders. Keeps cells in precise series/parallel alignment during spot welding. 10 per pack.",
      "description": "Rigid ABS plastic cell holders sized for 18650 cells. Keeps cells in precise series/parallel alignment during spot welding. Essential for neat, consistent pack builds. 10 per pack.",
      "specs": {
        "Cell size":  "18650 compatible",
        "Material":   "ABS plastic",
        "Quantity":   "10 per pack",
        "Type":       "Single cell (combine for S/P configs)",
        "HSN code":   "3926",
        "Colour":     "Black"
      },
      "shipping": { "weight_grams": 80, "fulfillment": "Ships within 2 business days", "courier": "Speed Post / Delhivery" },
      "amazon_url": "",
      "meta": {
        "title": "18650 Cell Holders ABS \u2014 10 Pack | NexEV",
        "description": "ABS plastic 18650 cell holders for spot-weld alignment. 10 per pack. HSN 3926. Ships from Karnataka."
      }
    }

  ]
};
