import { Request, Response } from 'express';
import { Contact } from './models';
import { Op } from 'sequelize';

export const identifyContact = async (req: Request, res: Response) => {
    const { email, phoneNumber } = req.body;

    try {
      //find existingContacts by email and phoneNumber
      let existingContacts = await Contact.findAll({where: { [Op.or]: [{email},{phoneNumber} ] }})
      let newContact,primaryContact ;
      let resContact: {primaryContactId: number, emails: string[], phoneNumbers: string[], secondaryContactIds: number[]};
      if(existingContacts.length==0){
        newContact  = await Contact.create({email,phoneNumber});
      }else{
         primaryContact = existingContacts.filter((c)=>c.linkedId==null)[0] ?? await Contact.findByPk(existingContacts[0].linkedId)
         existingContacts =existingContacts.concat(primaryContact)

        if(existingContacts.some((c)=> {return c.email===email && c.phoneNumber=== phoneNumber})){
            resContact = {
                primaryContactId: primaryContact.id,
                emails: [...new Set(existingContacts.map((c)=> c.email))],
                phoneNumbers: [...new Set(existingContacts.map((c)=> c.phoneNumber))],
            secondaryContactIds: [...new Set(existingContacts.filter((c)=>c.linkPrecedence=='secondary').map((c)=>c.id))]
            }
          return res.status(200).json(resContact) 
        }else{
        newContact  = await Contact.create({email,phoneNumber, linkPrecedence: 'secondary', linkedId: primaryContact.id});
        }
      }
      let afterSaveExistingContacts = await Contact.findAll({where: { [Op.or]: [{email},{phoneNumber} ] }})
      primaryContact = afterSaveExistingContacts[afterSaveExistingContacts.findIndex((c)=> c.linkPrecedence: 'primary')]
      afterSaveExistingContacts =afterSaveExistingContacts.concat(primaryContact)
      resContact = {
        emails: [...new Set(afterSaveExistingContacts.map((c)=>c.email)],
        phoneNumbers: [...new Set(afterSaveExistingContacts.map((c)=> c.phoneNumber)],
        primaryContactId: primaryContact.id,
        secondaryContactIds: [...new Set(afterSaveExistingContacts.filter((c)=>c.linkPrecedence=='secondary').map((c)=>c.id))]
      }
      
      res.status(200).json(resContact)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
