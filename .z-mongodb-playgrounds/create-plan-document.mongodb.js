// "creator-USD-monthly"
const planData1 = {
    paystackPlanCode: "PLN_yof707bqvujtvop",
    name: "creator-USD-monthly",
    interval: "monthly",
    price: 3000,
    currency: "USD",
    isTrial: false,
    updatedAt: new Date(),
    createdAt: new Date()
}

// "creator-USD-yearly"
const planData2 = {
    paystackPlanCode: "PLN_1csubqcy5yhd2uj",
    name: "creator-USD-yearly",
    interval: "yearly",
    price: 30000,
    currency: "USD",
    isTrial: false,
    updatedAt: new Date(),
    createdAt: new Date()
}

// "creator-KES-monthly"
const planData3 = {
    paystackPlanCode: "PLN_9rqtwji12wv818e",
    name: "creator-KES-monthly",
    interval: "monthly",
    price: 350000,
    currency: "KES",
    isTrial: false,
    updatedAt: new Date(),
    createdAt: new Date()
}

// "creator-KES-yearly"
const planData4 = {
    paystackPlanCode: "PLN_bm0y7crgs7daw9o",
    name: "creator-KES-yearly",
    interval: "yearly",
    price: 3500000,
    currency: "KES",
    isTrial: false,
    updatedAt: new Date(),
    createdAt: new Date()
}

// Select the database to use.
use('wufwuf-automations-test');

const planData = planData4
const filter = { 
    paystackPlanCode: planData.paystackPlanCode
};
const update = {
    $set: {
        paystackPlanCode: planData.paystackPlanCode,
        name: planData.name,
        interval: planData.interval,
        price: planData.price,
        currency: planData.currency,
        isTrial: planData.isTrial,
        updatedAt: planData.updatedAt,
        createdAt: planData.createdAt
    }
};
const options = {
    new: true, // Return the modified document rather than the original
    upsert: true, // Create a new document if no document matches the filter
    runValidators: true, // Run schema validators on update
    setDefaultsOnInsert: true // Set default values on insert
};

// insert a few documents into the sales collection
db.getCollection('plans').findOneAndUpdate(
    filter, update, options
);


