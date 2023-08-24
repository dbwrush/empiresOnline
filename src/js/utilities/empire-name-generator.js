export default class EmpireNameGenerator {
    static LEFT_NAMES = ["Socialist", "Soviet", "People's", "Democratic", "Workers'", "Communist", "Collective"];
    static RIGHT_NAMES = ["Capitalist", "Free", "Liberal", "Market", "Democratic", "Individual"];
    static AUTH_NAMES = ["Empire", "Dominion", "State", "Union", "Federation", "Kingdom"];
    static LIB_NAMES = ["Republic", "Commonwealth", "Alliance", "Federation", "League", "Union"];
    static ISO_NAMES = ["Isolationist", "Solitary", "Secluded", "Reclusive", "Hermit", "Independent"];
    static COOP_NAMES = ["Cooperative", "Allied", "United", "Collaborative", "Concordant", "Joint"];

    static GOVT_NAMES = ["Nation", "Realm", "Republic", "Country", "Territory", "Land"];
    static PLACE_NAMES = [
        "France", "Germany", "Britain", "America", "Russia", "China", "Brazil", "India", "Canada",
        "Australia", "Japan", "Italy", "Spain", "Mexico", "Egypt", "Argentina", "Netherlands",
        "Sweden", "Greece", "Turkey", "Thailand", "Antarctica", "Chile", "Iceland", "Austria", "Kenya", "Indonesia",
        "Denmark", "England", "Scotland", "Wales", "Ireland", "Norway", "Finland", "Belgium", "Portugal", "Singapore", "Korea",
        "Czechia", "Israel", "Switzerland", "Colombia", "Peru", "Cuba", "Ukraine", "Vietnam", "Jamaica",
        "Hawaii"
    ];

    static generateEmpireName(isoCoop, authLib, leftRight, placeName) {
        let name = '';

        if (isoCoop < 96 || isoCoop > 160) {
            if (isoCoop < 96) {
                const index = Math.floor(Math.random() * EmpireNameGenerator.ISO_NAMES.length);
                name += EmpireNameGenerator.ISO_NAMES[index] + ' ';
            } else {
                const index = Math.floor(Math.random() * EmpireNameGenerator.COOP_NAMES.length);
                name += EmpireNameGenerator.COOP_NAMES[index] + ' ';
            }
        }

        if (leftRight < 96 || leftRight > 160) {
            if (leftRight < 96) {
                const index = Math.floor(Math.random() * EmpireNameGenerator.LEFT_NAMES.length);
                name += EmpireNameGenerator.LEFT_NAMES[index] + ' ';
            } else {
                const index = Math.floor(Math.random() * EmpireNameGenerator.RIGHT_NAMES.length);
                name += EmpireNameGenerator.RIGHT_NAMES[index] + ' ';
            }
        }

        if (authLib < 96 || authLib > 160) {
            if (authLib < 96) {
                const index = Math.floor(Math.random() * EmpireNameGenerator.AUTH_NAMES.length);
                name += EmpireNameGenerator.AUTH_NAMES[index] + ' ';
            } else {
                const index = Math.floor(Math.random() * EmpireNameGenerator.LIB_NAMES.length);
                name += EmpireNameGenerator.LIB_NAMES[index] + ' ';
            }
        } else {
            const index = Math.floor(Math.random() * EmpireNameGenerator.GOVT_NAMES.length);
            name += EmpireNameGenerator.GOVT_NAMES[index] + ' ';
        }

        if (!placeName) {
            const placeIndex = Math.floor(Math.random() * EmpireNameGenerator.PLACE_NAMES.length);
            name += 'of ' + EmpireNameGenerator.PLACE_NAMES[placeIndex];
        } else {
            name += 'of ' + placeName;
        }

        return name.trim();
    }
}