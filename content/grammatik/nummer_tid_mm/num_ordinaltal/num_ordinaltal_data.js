// file:///Users/bentoblitzz/Documents/Playground/svenska_ovning/content/en/grammatik/nummer_tid_mm/num_ordinaltal/num_ordinaltal_data.js

// Here's the table header: | Subject [hint] | Object [input] | Possessiv (en) [input] | Possessiv (ett) [input] | Possessiv (plural) [input] | Translation [translation] |


/* Ordinaltal Practice - A1/A2 Level
   Format: Digit in brackets (n) serves as the primary hint.
*/

const ordinalExercises = [
    // 1:a - första
    { id: 1, sentence: "Januari är årets  ___ månad.", hint: "Ledtråd (hint): 1", answer: "första" },
    { id: 2, sentence: "Det här är min  ___ dag på jobbet.", hint: "Ledtråd (hint): 1", answer: "första" },
    { id: 3, sentence: "Hon bor på  ___ våningen.", hint: "Ledtråd (hint): 1", answer: "första" },
    { id: 4, sentence: "Vem kom på  ___ plats i tävlingen?", hint: "Ledtråd (hint): 1", answer: "första" },
    { id: 5, sentence: "Det är den  ___ gången jag äter surströmming.", hint: "Ledtråd (hint): 1", answer: "första" },

    // 2:a - andra
    { id: 6, sentence: "Februari är årets  ___ månad.", hint: "Ledtråd (hint): 2", answer: "andra" },
    { id: 7, sentence: "Kan du skicka mig det  ___ dokumentet i listan?", hint: "Ledtråd (hint): 2", answer: "andra" },
    { id: 8, sentence: "Vi bor i  ___ huset på vänster sida.", hint: "Ledtråd (hint): 2", answer: "andra" },
    { id: 9, sentence: "Det här är min  ___ kopp kaffe idag.", hint: "Ledtråd (hint): 2", answer: "andra" },
    { id: 10, sentence: "Måndag är den  ___ dagen i arbetsveckan.", hint: "Ledtråd (hint): 2", answer: "andra" },

    // 3:e - tredje
    { id: 11, sentence: "Mars är den  ___ månaden.", hint: "Ledtråd (hint): 3", answer: "tredje" },
    { id: 12, sentence: "Min son går i  ___ klass.", hint: "Ledtråd (hint): 3", answer: "tredje" },
    { id: 13, sentence: "Det här är  ___ gången jag ringer dig idag!", hint: "Ledtråd (hint): 3", answer: "tredje" },
    { id: 14, sentence: "Vi bor på  ___ våningen utan hiss.", hint: "Ledtråd (hint): 3", answer: "tredje" },
    { id: 15, sentence: "Boken ligger på den  ___ hyllan.", hint: "Ledtråd (hint): 3", answer: "tredje" },

    // 4:e - fjärde
    { id: 16, sentence: "April är den  ___ månaden.", hint: "Ledtråd (hint): 4", answer: "fjärde" },
    { id: 17, sentence: "Vi tänder det  ___ ljuset i advent.", hint: "Ledtråd (hint): 4", answer: "fjärde" },
    { id: 18, sentence: "Det är den  ___ dörren till höger.", hint: "Ledtråd (hint): 4", answer: "fjärde" },
    { id: 19, sentence: "Han kom på  ___ plats i maratonet.", hint: "Ledtråd (hint): 4", answer: "fjärde" },
    { id: 20, sentence: "Det här är det  ___ kapitlet i boken.", hint: "Ledtråd (hint): 4", answer: "fjärde" },

    // 6:e - sjätte (New Addition!)
    { id: 21, sentence: "Juni är årets ___ månad.", hint: "Ledtråd (hint): 6", answer: "sjätte" },
    { id: 22, sentence: "Lördag är veckans ___ dag.", hint: "Ledtråd (hint): 6", answer: "sjätte" },
    { id: 23, sentence: "Min dotter fyller ___ år imorgon.", hint: "Ledtråd (hint): 6", answer: "sjätte" }, // Note: This uses ordinal because of the anniversary context
    { id: 24, sentence: "Bussen stannar vid den ___ hållplatsen.", hint: "Ledtråd (hint): 6", answer: "sjätte" },
    { id: 25, sentence: "Han bor på ___ våningen.", hint: "Ledtråd (hint): 6", answer: "sjätte" },

    // 7:e - sjunde
    { id: 21, sentence: "Söndag är veckans  ___ dag.", hint: "Ledtråd (hint): 7" , answer: "sjunde" },
    { id: 22, sentence: "Min dotter fyller år den  ___ juli.", hint: "Ledtråd (hint): 7" , answer: "sjunde" },
    { id: 23, sentence: "Harry Potter och den  ___ boken är bra.", hint: "Ledtråd (hint): 7" , answer: "sjunde" },
    { id: 24, sentence: "Hon kom på  ___ plats i tävlingen.", hint: "Ledtråd (hint): 7" , answer: "sjunde" },
    { id: 25, sentence: "Vi ses den  ___ i nästa månad.", hint: "Ledtråd (hint): 7" , answer: "sjunde" },

    // 12:e - tolfte
    { id: 26, sentence: "December är årets  ___ månad.", hint: "Ledtråd (hint): 12" , answer: "tolfte" },
    { id: 27, sentence: "Klockan slår sitt  ___ slag vid midnatt.", hint: "Ledtråd (hint): 12" , answer: "tolfte" },
    { id: 28, sentence: "Den  ___ december är dagen före Lucia.", hint: "Ledtråd (hint): 12" , answer: "tolfte" },
    { id: 29, sentence: "Vi sitter på  ___ raden i biosalongen.", hint: "Ledtråd (hint): 12" , answer: "tolfte" },
    { id: 30, sentence: "Det är den  ___ gången de vinner.", hint: "Ledtråd (hint): 12" , answer: "tolfte" },

    // 20:e - tjugonde
    { id: 31, sentence: "Vi firar vår  ___ bröllopsdag.", hint: "Ledtråd (hint): 20" , answer: "tjugonde" },
    { id: 32, sentence: "Han slutade på  ___ plats.", hint: "Ledtråd (hint): 20" , answer: "tjugonde" },
    { id: 33, sentence: "Det är den  ___ maj idag.", hint: "Ledtråd (hint): 20" , answer: "tjugonde" },
    { id: 34, sentence: "Affären ligger på  ___ gatan.", hint: "Ledtråd (hint): 20" , answer: "tjugonde" },
    { id: 35, sentence: "Det här är min  ___ lektion i svenska.", hint: "Ledtråd (hint): 20" , answer: "tjugonde" },

    // 31:a - trettioförsta
    { id: 36, sentence: "Nyårsafton är den  ___ december.", hint: "Ledtråd (hint): 31" , answer: "trettioförsta" },
    { id: 37, sentence: "Idag är det den  ___ oktober och Halloween.", hint: "Ledtråd (hint): 31" , answer: "trettioförsta" },
    { id: 38, sentence: "Det här är den  ___ gången jag ringer.", hint: "Ledtråd (hint): 31" , answer: "trettioförsta" },
    { id: 39, sentence: "Sidan  ___ i boken saknas.", hint: "Ledtråd (hint): 31" , answer: "trettioförsta" },
    { id: 40, sentence: "Han fyller år den  ___ augusti.", answer: "trettioförsta", hint: "Ledtråd (hint): 31" }
];