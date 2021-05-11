const fs = require("fs/promises");
const path = require("path");

const contactsPath = path.join(__dirname, "./contacts.json");

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return err.message;
  }
};

const getContactById = async (contactId) => {
  try {
    const data = await listContacts();
    return data.find((el) => el.id == contactId);
  } catch (err) {
    return err.message;
  }
};

const removeContact = async (contactId) => {
  try {
    const data = await listContacts();
    const index = data.findIndex((el) => el.id == contactId);
    if (index < 0) return false;
    const result = data.splice(index, 1);
    await fs.writeFile(contactsPath, JSON.stringify(data), "utf-8");
    return result;
  } catch (err) {
    return err.message;
  }
};

const addContact = async (body) => {
  try {
    const data = await listContacts();
    const index =
      data.sort((a, b) => a.id - b.id).findIndex((el, i) => el.id !== i + 1) +
      1;
    id = index === 0 ? data.length + 1 : index;
    const newContact = { id, ...body };
    data.splice(id - 1, 0, newContact);
    await fs.writeFile(contactsPath, JSON.stringify(data), "utf-8");
    return data[id - 1];
  } catch (err) {
    return err.message;
  }
};

const updateContact = async (contactId, body) => {
  try {
    const data = await listContacts();
    const { index, contact } = data.reduce((acc, el, i) => {
      if (el.id == contactId) {
        acc.index = i;
        acc.contact = el;
      }
      return acc;
    }, {});
    if (contact) {
      newContact = { ...contact, ...body };
      data.splice(index, 1, newContact);
      await fs.writeFile(contactsPath, JSON.stringify(data), "utf-8");
      return newContact;
    }
    return false;
  } catch (err) {
    return err.message;
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
