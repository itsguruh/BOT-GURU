const { malvin } = require("../malvin");

// Country time zones with flags and GMT offsets
const countryTimes = [
    { country: "Kenya", flag: "🇰🇪", timeZone: "Africa/Nairobi", gmt: "GMT+3" },
    { country: "India", flag: "🇮🇳", timeZone: "Asia/Kolkata", gmt: "GMT+5:30" },
    { country: "USA (NY)", flag: "🇺🇸", timeZone: "America/New_York", gmt: "GMT-5" },
    { country: "UK", flag: "🇬🇧", timeZone: "Europe/London", gmt: "GMT+0" },
    { country: "UAE", flag: "🇦🇪", timeZone: "Asia/Dubai", gmt: "GMT+4" },
    { country: "Japan", flag: "🇯🇵", timeZone: "Asia/Tokyo", gmt: "GMT+9" },
    { country: "Australia", flag: "🇦🇺", timeZone: "Australia/Sydney", gmt: "GMT+11" },
    { country: "Brazil", flag: "🇧🇷", timeZone: "America/Sao_Paulo", gmt: "GMT-3" },
    { country: "China", flag: "🇨🇳", timeZone: "Asia/Shanghai", gmt: "GMT+8" },
    { country: "Germany", flag: "🇩🇪", timeZone: "Europe/Berlin", gmt: "GMT+1" },
    { country: "Russia", flag: "🇷🇺", timeZone: "Europe/Moscow", gmt: "GMT+3" },
    { country: "Egypt", flag: "🇪🇬", timeZone: "Africa/Cairo", gmt: "GMT+2" },
    { country: "South Africa", flag: "🇿🇦", timeZone: "Africa/Johannesburg", gmt: "GMT+2" },
    { country: "Canada (TO)", flag: "🇨🇦", timeZone: "America/Toronto", gmt: "GMT-5" },
    { country: "France", flag: "🇫🇷", timeZone: "Europe/Paris", gmt: "GMT+1" },
    { country: "Singapore", flag: "🇸🇬", timeZone: "Asia/Singapore", gmt: "GMT+8" },
    { country: "Pakistan", flag: "🇵🇰", timeZone: "Asia/Karachi", gmt: "GMT+5" },
    { country: "Nigeria", flag: "🇳🇬", timeZone: "Africa/Lagos", gmt: "GMT+1" },
    { country: "Mexico", flag: "🇲🇽", timeZone: "America/Mexico_City", gmt: "GMT-6" },
    { country: "Turkey", flag: "🇹🇷", timeZone: "Europe/Istanbul", gmt: "GMT+3" }
];

// Function to get formatted time for a country
function getFormattedTime(timeZone, format = "full") {
    const now = new Date();
    
    if (format === "full") {
        const options = {
            timeZone: timeZone,
            hour12: true,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };
        return now.toLocaleString('en-US', options);
    } else {
        const options = {
            timeZone: timeZone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return now.toLocaleString('en-US', options);
    }
}

malvin({
    pattern: 'time',
    alias: ['worldtime', 'timezone', 'clock'],
    desc: 'Show current times in various countries around the world',
    category: 'utility',
    filename: __filename,
    usage: '.time [country] or .time all'
}, async (malvin, mek, m, { args, reply }) => {
    try {
        const query = args.join(' ').toLowerCase();
        
        if (query === 'all') {
            // Show all countries (paginated)
            let timeMessage = "🕒 *World Time - All Countries*\n\n";
            
            countryTimes.forEach((country, index) => {
                const time = getFormattedTime(country.timeZone, "full");
                timeMessage += `${country.flag} *${country.country}* (${country.gmt})\n   ⏰ ${time}\n\n`;
                
                // Add page break after every 5 countries for readability
                if ((index + 1) % 5 === 0) {
                    timeMessage += "━━━━━━━━━━━━━━━━━━━━\n\n";
                }
            });
            
            return reply(timeMessage);
        }
        
        if (query) {
            // Search for specific country
            const foundCountries = countryTimes.filter(country => 
                country.country.toLowerCase().includes(query) || 
                country.timeZone.toLowerCase().includes(query) ||
                country.gmt.toLowerCase().includes(query)
            );
            
            if (foundCountries.length === 0) {
                return reply(`❌ No country found matching "${query}". Use *.time all* to see all available countries.`);
            }
            
            let timeMessage = `🔍 *Time Results for "${query}"*\n\n`;
            
            foundCountries.forEach(country => {
                const time = getFormattedTime(country.timeZone, "full");
                timeMessage += `${country.flag} *${country.country}* (${country.gmt})\n   ⏰ ${time}\n\n`;
            });
            
            return reply(timeMessage);
        }
        
        // Default: show popular time zones
        const popularCountries = [
            "Kenya", "India", "USA (NY)", "UK", "UAE", 
            "Japan", "Australia", "Germany", "China"
        ];
        
        let timeMessage = "🕒 *Current World Times*\n\n";
        
        countryTimes
            .filter(country => popularCountries.includes(country.country))
            .forEach(country => {
                const time = getFormattedTime(country.timeZone);
                timeMessage += `${country.flag} *${country.country}:* ${time} (${country.gmt})\n`;
            });
        
        timeMessage += "\n💡 Use *.time all* to see all countries or *.time [country]* to search specific timezone.";
        
        return reply(timeMessage);
        
    } catch (error) {
        console.error('❌ Time command error:', error.message);
        return reply("❌ Failed to fetch time information. Please try again.");
    }
});

// Additional command for quick time check
malvin({
    pattern: 'mytime',
    alias: ['localtime', 'now'],
    desc: 'Show your local time based on your phone settings',
    category: 'utility',
    filename: __filename,
    usage: '.mytime'
}, async (malvin, mek, m, { reply }) => {
    try {
        const now = new Date();
        const options = {
            hour12: true,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZoneName: 'short'
        };
        
        const localTime = now.toLocaleString('en-US', options);
        
        return reply(`📱 *Your Local Time*\n\n⏰ ${localTime}`);
        
    } catch (error) {
        console.error('❌ Mytime command error:', error.message);
        return reply("❌ Failed to get your local time. Please try again.");
    }
});

// Command to show GMT/UTC time
malvin({
    pattern: 'gmt',
    alias: ['utc', 'zulu'],
    desc: 'Show current GMT/UTC time',
    category: 'utility',
    filename: __filename,
    usage: '.gmt'
}, async (malvin, mek, m, { reply }) => {
    try {
        const now = new Date();
        const options = {
            timeZone: 'UTC',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };
        
        const gmtTime = now.toLocaleString('en-US', options);
        const unixTimestamp = Math.floor(now.getTime() / 1000);
        
        return reply(
            `🌐 *GMT/UTC Time*\n\n` +
            `⏰ ${gmtTime} GMT\n` +
            `📅 Unix Timestamp: ${unixTimestamp}\n\n` +
            `*GMT Time Zones:*\n` +
            `• GMT+0: London, Dublin\n` +
            `• GMT+1: Paris, Berlin\n` +
            `• GMT+2: Cairo, Johannesburg\n` +
            `• GMT+3: Nairobi, Moscow\n` +
            `• GMT+5:30: Mumbai, Delhi`
        );
        
    } catch (error) {
        console.error('❌ GMT command error:', error.message);
        return reply("❌ Failed to get GMT time. Please try again.");
    }
});
