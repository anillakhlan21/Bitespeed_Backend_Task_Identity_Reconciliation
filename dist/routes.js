"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyContact = void 0;
const models_1 = require("./models");
const sequelize_1 = require("sequelize");
const identifyContact = async (req, res) => {
    var _a;
    const { email, phoneNumber } = req.body;
    try {
        //find existingContacts by email and phoneNumber
        let existingContacts = await models_1.Contact.findAll({ where: { [sequelize_1.Op.or]: [{ email }, { phoneNumber }] } });
        let newContact, primaryContact;
        let resContact;
        if (existingContacts.length == 0) {
            newContact = await models_1.Contact.create({ email, phoneNumber });
        }
        else {
            primaryContact = (_a = existingContacts.filter((c) => c.linkedId == null)[0]) !== null && _a !== void 0 ? _a : await models_1.Contact.findByPk(existingContacts[0].linkedId);
            existingContacts = existingContacts.concat(primaryContact);
            if (existingContacts.some((c) => { return c.email === email && c.phoneNumber === phoneNumber; })) {
                resContact = {
                    primaryContactId: primaryContact.id,
                    emails: [...new Set(existingContacts.map((c) => c.email))],
                    phoneNumbers: [...new Set(existingContacts.map((c) => c.phoneNumber))],
                    secondaryContactIds: [...new Set(existingContacts.filter((c) => c.linkPrecedence == 'secondary').map((c) => c.id))]
                };
                return res.status(200).json(resContact);
            }
            else {
                newContact = await models_1.Contact.create({ email, phoneNumber, linkPrecedence: 'secondary', linkedId: primaryContact.id });
            }
        }
        let afterSaveExistingContacts = await models_1.Contact.findAll({ where: { [sequelize_1.Op.or]: [{ email }, { phoneNumber }] } });
        primaryContact = afterSaveExistingContacts[afterSaveExistingContacts.findIndex((c) => c.linkPrecedence, 'primary')];
        afterSaveExistingContacts = afterSaveExistingContacts.concat(primaryContact);
        resContact = {
            emails: [...new Set(afterSaveExistingContacts.map((c) => c.email))],
            phoneNumbers: [...new Set(afterSaveExistingContacts.map((c) => c.phoneNumber))],
            primaryContactId: primaryContact.id,
            secondaryContactIds: [...new Set(afterSaveExistingContacts.filter((c) => c.linkPrecedence == 'secondary').map((c) => c.id))]
        };
        res.status(200).json(resContact);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.identifyContact = identifyContact;
//# sourceMappingURL=routes.js.map