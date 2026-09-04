const fs = require('fs');
let c = fs.readFileSync('src/components/sections/TonyStarkHudProfile.tsx', 'utf8');
c = c.replace(/exitRange=\{\[0\.2(\d+),\s*0\.2(\d+)\]\}/g, (m, g1, g2) => {
    return `exitRange={[0.3${g1}, 0.3${g2}]}`;
});
fs.writeFileSync('src/components/sections/TonyStarkHudProfile.tsx', c);
