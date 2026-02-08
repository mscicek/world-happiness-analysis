let root, polygonSeries;
let allData = [];
let currentMetric = "happiness";

const config = {
    'happiness': { id: 'btn-happiness', color: 0xd32f2f, label: 'Mutluluk', badge: 'bg-danger' },
    'economy': { id: 'btn-economy', color: 0x2e7d32, label: 'Ekonomi', badge: 'bg-success' },
    'health': { id: 'btn-health', color: 0x1565c0, label: 'Sağlık', badge: 'bg-primary' },
    'freedom': { id: 'btn-freedom', color: 0xff8f00, label: 'Özgürlük', badge: 'bg-warning text-dark' }
};

document.addEventListener("DOMContentLoaded", () => {
    init();
});

async function init() {
    try {
        const res = await fetch('/api/data');
        const rawData = await res.json();

        allData = rawData.map(d => ({
            ...d,
            happiness: parseFloat(d.happiness),
            economy: parseFloat(d.economy),
            health: parseFloat(d.health),
            freedom: parseFloat(d.freedom)
        }));

        if (allData.length > 0) {
            createMap();
            updateDashboard('happiness');
        }
    } catch (err) {
        console.error("Hata:", err);
    }
}

function createMap() {
    if (root) root.dispose();
    root = am5.Root.new("chartdiv");
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "rotateY",
        projection: am5map.geoOrthographic(),
        homeGeoPoint: { latitude: 39, longitude: 35 }
    }));

    chart.children.unshift(am5.Rectangle.new(root, {
        width: am5.percent(100), height: am5.percent(100), fill: am5.color(0xe3f2fd)
    }));

    polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow, exclude: ["AQ"]
    }));

    polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}", interactive: true,
        fill: am5.color(0xd3d3d3), stroke: am5.color(0xffffff), strokeWidth: 0.5
    });

    polygonSeries.mapPolygons.template.adapters.add("tooltipText", (text, target) => {
        if (target.dataItem?.dataContext?.customData) {
            let d = target.dataItem.dataContext.customData;
            return `[bold]${d.country}[/]\n${config[currentMetric].label}: [bold]${d[currentMetric]}[/]`;
        }
        return "{name}: Veri Yok";
    });
}

function updateDashboard(metric) {
    currentMetric = metric;
    let cfg = config[metric];

    document.querySelectorAll('.btn-group button').forEach(btn => {
        btn.className = "btn btn-outline-secondary fw-bold";
    });
    document.getElementById(cfg.id).className = `btn btn-outline-${cfg.badge.split('-')[1]} active fw-bold shadow`;

    let mapData = [];
    allData.forEach(item => {
        let code = getCountryCode(item.country);
        if (code) mapData.push({ id: code, value: item[metric], customData: item });
    });
    polygonSeries.data.setAll(mapData);

    polygonSeries.heatRules.clear();
    polygonSeries.set("heatRules", [{
        target: polygonSeries.mapPolygons.template,
        dataField: "value",
        min: am5.color(0xffffff), max: am5.color(cfg.color),
        key: "fill"
    }]);
}

function getCountryCode(name) {
    const codes = { "Afghanistan": "AF", "Albania": "AL", "Algeria": "DZ", "Argentina": "AR", "Armenia": "AM", "Australia": "AU", "Austria": "AT", "Azerbaijan": "AZ", "Bahrain": "BH", "Bangladesh": "BD", "Belarus": "BY", "Belgium": "BE", "Benin": "BJ", "Bolivia": "BO", "Bosnia and Herzegovina": "BA", "Botswana": "BW", "Brazil": "BR", "Bulgaria": "BG", "Burkina Faso": "BF", "Burundi": "BI", "Cambodia": "KH", "Cameroon": "CM", "Canada": "CA", "Chad": "TD", "Chile": "CL", "China": "CN", "Colombia": "CO", "Comoros": "KM", "Congo (Brazzaville)": "CG", "Congo (Kinshasa)": "CD", "Costa Rica": "CR", "Croatia": "HR", "Cyprus": "CY", "Czech Republic": "CZ", "Denmark": "DK", "Dominican Republic": "DO", "Ecuador": "EC", "Egypt": "EG", "El Salvador": "SV", "Estonia": "EE", "Ethiopia": "ET", "Finland": "FI", "France": "FR", "Gabon": "GA", "Gambia": "GM", "Georgia": "GE", "Germany": "DE", "Ghana": "GH", "Greece": "GR", "Guatemala": "GT", "Guinea": "GN", "Haiti": "HT", "Honduras": "HN", "Hong Kong": "HK", "Hungary": "HU", "Iceland": "IS", "India": "IN", "Indonesia": "ID", "Iran": "IR", "Iraq": "IQ", "Ireland": "IE", "Israel": "IL", "Italy": "IT", "Ivory Coast": "CI", "Jamaica": "JM", "Japan": "JP", "Jordan": "JO", "Kazakhstan": "KZ", "Kenya": "KE", "Kosovo": "XK", "Kuwait": "KW", "Kyrgyzstan": "KG", "Laos": "LA", "Latvia": "LV", "Lebanon": "LB", "Lesotho": "LS", "Liberia": "LR", "Libya": "LY", "Lithuania": "LT", "Luxembourg": "LU", "Madagascar": "MG", "Malawi": "MW", "Malaysia": "MY", "Mali": "ML", "Malta": "MT", "Mauritania": "MR", "Mauritius": "MU", "Mexico": "MX", "Moldova": "MD", "Mongolia": "MN", "Montenegro": "ME", "Morocco": "MA", "Mozambique": "MZ", "Myanmar": "MM", "Namibia": "NA", "Nepal": "NP", "Netherlands": "NL", "New Zealand": "NZ", "Nicaragua": "NI", "Niger": "NE", "Nigeria": "NG", "North Macedonia": "MK", "Norway": "NO", "Pakistan": "PK", "Palestinian Territories": "PS", "Panama": "PA", "Paraguay": "PY", "Peru": "PE", "Philippines": "PH", "Poland": "PL", "Portugal": "PT", "Romania": "RO", "Russia": "RU", "Rwanda": "RW", "Saudi Arabia": "SA", "Senegal": "SN", "Serbia": "RS", "Sierra Leone": "SL", "Singapore": "SG", "Slovakia": "SK", "Slovenia": "SI", "South Africa": "ZA", "South Korea": "KR", "Spain": "ES", "Sri Lanka": "LK", "Sweden": "SE", "Switzerland": "CH", "Syria": "SY", "Taiwan": "TW", "Tajikistan": "TJ", "Tanzania": "TZ", "Thailand": "TH", "Togo": "TG", "Tunisia": "TN", "Turkey": "TR", "Turkmenistan": "TM", "Uganda": "UG", "Ukraine": "UA", "United Arab Emirates": "AE", "United Kingdom": "GB", "United States": "US", "Uruguay": "UY", "Uzbekistan": "UZ", "Venezuela": "VE", "Vietnam": "VN", "Yemen": "YE", "Zambia": "ZM", "Zimbabwe": "ZW" };
    return codes[name] || null;
}