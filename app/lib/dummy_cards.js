'use strict';
const serviceLocator = require("../lib/service_locator");
const mongoose = serviceLocator.get('mongoose');

//insert some dummy cards in case we don't have any
async function insert_dummy_cards() {
    const BlackCards = mongoose.model('BlackCards');
    const WhiteCards = mongoose.model('WhiteCards');
    const Sets = mongoose.model('Sets');

    console.log("Inserting dummy cards (maybe)");

    let newSet = await Sets.findOne({set_id: "ag_testcards"});
    if (!newSet) {
        console.log("No set found...");
        newSet = new Sets({
            name: "Silver's Discount Test Cards",
            set_id: "ag_testcards"
        });
        newSet = await newSet.save();
    }
    const setid = newSet._id;
    const black_count = await BlackCards.countDocuments();
    console.log("Found black cards: " + black_count);
    if (black_count < 50) {
        console.log("Less than 50 black cards...");
        for (let i = 0; i < 50; ++i) {
            const text = "Test Black Card " + i;
            const exists = await BlackCards.findOne({set: setid, text: text});
            if (!exists) {
                let blackCard = new BlackCards({
                    set: setid._id,
                    text: text,
                    pick: 1
                });
                blackCard = await blackCard.save();
            }
        }
    }

    const white_count = await WhiteCards.countDocuments();
    console.log("Found white cards: " + white_count);
    if (white_count < 200) {
        console.log("Less than 200 white cards...");
        for (let i = 0; i < 200; ++i) {
            const text = "Test White Card " + i;
            const exists = await WhiteCards.findOne({set: setid, text: text});
            if (!exists) {
                let whiteCard = new WhiteCards({
                    _id: new mongoose.Types.ObjectId(),
                    set: setid._id,
                    text: text
                });
                whiteCard = await whiteCard.save();
            }
        }
    }
}

module.exports = insert_dummy_cards;