

/**
 * Stel we hebben een menu met verschillende programmaatjes,
 * waaruit we kunnen kiezen. Bijv.:
 * - Speel muziek af
 * - Speel een game
 * - Verstuur GPS locatie
 * - enz.
 * 
 * We willen dan bijv. muziek afspelen, maar kunnen ondertussen
 * een ander programma tegelijjkertijd uitvoeren.
 * 
 * Hoe zouden we dat op basis van Event-Loop kunnen doen?
 */

/**
 * Ten eerste gaan we ervan uit dat we een vaste aantal
 * programmaatjes hebben.
 * Verder heeft elk programma een reeks statussen.
 * Laten we als voorbeeld nemen, het afspelen van muziek.
 * Wat komt er bij kijken om een muziek van een sd kaart af
 * te spelen?
 * Het hoofdmenu is eigenlijk niks anders dan een lijst/array.
 * Elk element is een object met een pointer naar een functie,
 * die de volgende scherm toont met daarin weer andere functies.
 * Verder bevat het een status van de state waar het programma
 * zicht bevindt in de state diagram.
 * 
 * Laten we kijken hoe dat zou kunnen verlopen:
 * - we klikken op muziek:
 *      - state 1-1: toon muziek menu -> display(music_menu) -> update_state(STATE_1_2, &app)
 *      - state 1-2: open media -> fatfs.open() -> res = SUCCES/ERROR -> update_state(STATE_1_3, &app)
 *      - state 1-3: read media files -> res = SUCCES/ERROR -> update_state(STATE_1_4, &app)
 *      - state 1-4: show media files -> res = SUCCES/ERROR -> update_state(STATE_1_5, &app)
 *      - state 1-5: handle selection -> res = SUCCES/ERROR -> update_state(STATE_1_6, &app)
 *      - state 1-6: read media file -> res = SUCCES/ERROR -> update_state(STATE_1_7, &app)
 * 
 * Het programma verloopt dus via states en niet sequentieel.
 * Dus we moeten ons programma zien als een reeks van states!
 * Dit is dus wennen, als je gewend bent om sequentieel te denken.
 */
