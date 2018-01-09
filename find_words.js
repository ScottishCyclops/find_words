const { readFileSync } = require("fs")

/**
 * Transform une method once en une promesse
 * @param {any} obj objet qui possède une méthode once
 * @param {string} event l'événement à écouter
 */
const once = (obj, event) => new Promise(resolve => obj.once(event, resolve))

/**
 * Retourne une liste contenant tous les mots de `validWords` de longueur
 * `length` écrivables avec les characters de `rawChars`
 * @param {string[]} validWords
 * @param {string} rawChars
 * @param {number} length
 */
const findPossibleWords = (validWords, length, rawChars) =>
{
    // nombre d'occurence des charactères utilisables
    const charsToUse = countChars(rawChars)

    // filtrage restrictif des mots en fonction de leur longueur
    const possibleWords = validWords.filter(word => word.length === length)

    // filtrage final des mots en fonction de leurs charactères
    return possibleWords.filter(word =>
    {
        const wordChars = countChars(word)

        // le mot est gardé si il est composé de lettres
        // disponibles dans `charsToUse`
        for(const char in wordChars) {
            // si la lettre n'est pas disponible
            // la valeur dans l'objet sera undefined
            if(charsToUse[char] === undefined ||
                charsToUse[char] < wordChars[char]) {
                return false
            }
        }

        return true
    })
}

/**
 * Converti une chaîne de character en un objet représentant
 * le nombre d'occurence de chaque charactères
 * @param {string} rawChars
 */
const countChars = rawChars =>
{
    const out = {}

    for(const char of rawChars) {
        if(out[char] === undefined) {
            out[char] = 1
            continue
        }

        out[char] = out[char] + 1
    }

    return out
}

async function main()
{
    const wordFilePath = process.argv[2]

    if(wordFilePath === undefined) {
        console.log("Erreur: veuillez fournir un dictionnaire")
        process.exit(1)
    }

    const maxChars = 12

    try {
        const validWords = readFileSync(wordFilePath, "utf8")
            .split("\r\n")

        while(true) {
            // récupère la liste des charactères osus forme de liste de chars
            console.log("Liste de charactères (ctrl+C pour quitter)")
            let rawChars = (await once(process.stdin, "data"))
                .toString()
                .split("")

            // retire `\r\n`
            rawChars.splice(-2, 2)

            // limite le nombre de chars et les passes en lowercase
            rawChars = rawChars.slice(0, maxChars).join("").toLowerCase()

            // récupère la longueur du mot sous forme de nombre entier
            console.log("Taille du mot recherché (ctrl+C pour quitter)")
            const length = parseInt(await once(process.stdin, "data"))

            console.log("Solutions")
            const solutions = findPossibleWords(validWords, length, rawChars)

            if(solutions.length === 0) {
                console.log("aucune solution trouvée dans le dictionnaire")
            } else {
                solutions.forEach(word => console.log(word))
            }
        }
    } catch(e) {
        if(e.code === "ENOENT") {
            console.log("Erreur: le dictionnaire l'existe pas")
            process.exit(1)
        }
    }
}

main().catch(console.error)
