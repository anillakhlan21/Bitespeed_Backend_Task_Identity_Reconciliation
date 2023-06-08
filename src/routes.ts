import { Request, Response } from 'express';
import { Contact } from './models';
import { Op } from 'sequelize';

export const identifyContact = async (req: Request, res: Response) => {
    const { email = null, phoneNumber = null } = req.body;
    let contact, newContactDetail, primaryContact;
    try {
        if (!email && !phoneNumber) {
            return res.status(400).json({ message: "Email or phone number should be provided" })
        } else if (email && phoneNumber) {

            const rowsToUpdate = await Contact.findAll({
                where: {
                    [Op.or]: [{ email }, { phoneNumber }],
                    linkPrecedence: 'primary'
                },
                order: [['createdAt', 'ASC']] // Sort by createdAt in ascending order
            });
            if (rowsToUpdate.length > 1) {
                // Find the oldest row among the selected rows
                const oldestRow = rowsToUpdate.length > 0 ? rowsToUpdate[0] : null;

                // Update linkPrecedence for selected rows
                for (const row of rowsToUpdate) {
                    if (row != oldestRow) {
                        // Mark other rows with the same email and phoneNumber as 'secondary'
                        await row.update({ linkPrecedence: 'secondary', linkedId: oldestRow.id });
                    }
                }

            } else if (rowsToUpdate.length == 0) {
                await Contact.create({ email, phoneNumber });
            }

            contact = await Contact.findOne({ where: { email } });
            if(!contact){
                contact =await Contact.findOne({where: {phoneNumber}});
            }
            primaryContact = contact.linkPrecedence == 'primary' ? contact : await Contact.findByPk(contact.linkedId)
            const contactWithSameDetails = await Contact.findOne({ where: { email, phoneNumber } });
            if (!contactWithSameDetails && rowsToUpdate.length<=1) {
                await Contact.create({ email, phoneNumber, linkPrecedence: 'secondary', linkedId: primaryContact.id })
            }

        } else if (email) {
            contact = await Contact.findOne({ where: { email } });
            
            if (!contact) {
                await Contact.create({ email })
            }
            primaryContact = contact.linkPrecedence == 'primary' ? contact : await Contact.findByPk(contact.linkedId)
        } else if (phoneNumber) {
            contact = await Contact.findOne({ where: { phoneNumber } })
            if (!contact) {
                await Contact.create({ phoneNumber })
            }
            primaryContact = contact.linkPrecedence == 'primary' ? contact : await Contact.findByPk(contact.linkedId)

        }
        const secondaryContacts = await Contact.findAll({ where: { linkedId: primaryContact.id } })
        const emails = [...new Set([primaryContact].concat(secondaryContacts.filter(c => c.email != null)).map((c) => c.email))]
        const phoneNumbers = [...new Set([primaryContact].concat(secondaryContacts.filter(c => c.phoneNumber != null)).map((c) => c.phoneNumber))]
        const secondaryContactIds = [...new Set(secondaryContacts.map((c) => c.id))]
        const result = {
            contact: { primaryContatctId: primaryContact.id, emails, phoneNumbers, secondaryContactIds }
        }


        res.status(200).json(result)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

