## How to prompt user with suggestion

### 1. Add key-value into database (server-side)

There are multiple ways to do this, and you will do this through _inputText.js_. The first
way is by matching the Intent name, and the second way is by matching the response text
by DialogFlow.

#### By matching Intent name:

In _inputText.js_, look for `switch (intentName)`. Here, you can add `case <Intent Name>` statements
and perform database uploads based on the user's answers. For example:

    switch (intentName) {
        case "Know-Class-Of-Medical-Device - No":
            // user does not know class of MD
            try {
                await db.collection("userData").updateOne(
                    { _id: new ObjectId(userID) },
                    {
                        $set: {
                            knowClassOfMD:
                                false
                        }
                    },
                    { upsert: true }
                );
            } catch (err) {
                console.log(err);
            }
            break;

#### By matching response text:

Here, response text is the text sent back by Dialogflow. For example if a user responds _"yes"_ to 
_"Does the MD not touch patient or contact only intact skin?"_, the response text will be _"Your MD belongs to Class I. Now..."_. We can match these response texts to trigger a database upload.  
For example, in _inputText.js_,  

    // regex to match. Here, we are matching a space followed by "Class I" followed by any character that is not a letter or a number
    const regex = RegExp(`\\sClass I[^a-zA-Z0-9]`);
        if (regex.test(resultMessage)) {
            // if user's MD is of Class I, update convHistory and mhraClass
            try {
                db.collection("userData").updateOne(
                    { _id: new ObjectId(userID) },
                    {
                        $set: { mhraClass: Class I },
                        $push: {
                            conversationHistory: {
                                $each: [
                                    new Date().toISOString(),
                                    message,
                                    resultMessage
                                ]
                            }
                        }
                    },
                    { upsert: true }
                );
                // allows code to know to not reupload conversation history
                updatedConvHistory = true;
            } catch (err) {
                console.log(err);
            }
            break;
        }

### 2. Build suggestions.json (server side)
Look for _suggestions.json_ under the _resources_ folder. Continue building this json following the existing format. For example to add to the object regarding whether or not a user knows their Tier of Digital Healthcare Device (DHT), it might look like this:  

    {
        "mhra": {
            "mhraClass": [
                {
                    "value": "Class I",
                    "situation": "Your Medical Device belongs to Class I under MHRA rules",
                    "actionNeeded": [
                        "check that your products meet the relevant essential requirements of Annex I of the MDD",
                        "carry out a clinical evaluation as described in Annex X of the MDD",
                        "notify MHRA of any proposals to carry out a clinical investigation to demonstrate safety and performance"
                    ],
                    "source": [
                        "https://www.gov.uk/government/collections/guidance-on-class-1-medical-devices",
                        "https://www.gov.uk/government/collections/guidance-on-class-1-medical-devices",
                        "https://www.gov.uk/government/collections/guidance-on-class-1-medical-devices"
                    ],
                    "resource": [
                        {
                            "value": "MDD",
                            "link": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:01993L0042-20071011"
                        },
                        {
                            "value": null,
                            "link": null
                        },
                        {
                            "value": "Notify MHRA",
                            "link": "https://www.gov.uk/guidance/notify-mhra-about-a-clinical-investigation-for-a-medical-device"
                        }                  

                    ]
                }
            ]
        },
        "nice": {
            "knowTierOfDHT": [
                {
                    "value": true,
                    "situation": "You already know the Tier of your DHT",
                    "actionNeeded": ["No action needed"],
                    "source": ["https://www.nice.com/dht-tier"],
                    "resource": [
                        {
                            "value": null,
                            "link": null
                        }
                    ]
                },
                {
                    "value": false,
                    "situation": "You do not already know the Tier of your DHT",
                    "actionNeeded": ["Consult the chatbot to find out your Tier"],
                    "source": ["https://www.nice.com/dht-tier"],
                    "resource": [
                        {
                            "value": null,
                            "link": null
                        }
                    ]
                }
            ]
        }
    }


Taking the **mhra** object as an example and looking at it's keys,  
**mhra** is used to seperate MHRA, NICE, and NHSD for readability  
**class** is the key stored in the database  
**value** is the value corresponding to the key in the database  
**situation** is the explanation given to the user about why we are suggesting that they take a certain action  
**actionNeeded** is an array of actions that we suggest that the user take  
**source** is an array of sources. source[0] will correspond to the source of information of actionNeeded[0]. Eg source[0] = http://mhra/what-to-do-if-you-are-class-i  
**resource** is an array of resources. Resources are helpful links that users can follow to achieve a certain task. For example, if the **actionNeeded** is to register with MHRA, a helpful resource is a link to the registration page. The **value** key is the text that the user will see, and the **link** key is the page that a user will be redirected to when the user clicks on the text.

### 3. Build /userData/suggestionData route (server side)
In _userData.js_ and under the `router.get("/suggestionData", async (req, res) => {...}` function, look for the line `{ projection: { _id: 0, mhraClass: 1 } }`. Here, `mhraClass` is the key stored in the database (this key has the same name as in _suggestions.json_). Update the `projection` object to include all the keys that you have added in _suggestions.json_. For example, since we added _knowTierOfDHT_ in our example above, the projection will now look like this `{ projection: { _id: 0, mhraClass: 1, knowTierOfDHT: 1 } }`