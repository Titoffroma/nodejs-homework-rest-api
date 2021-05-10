const express = require("express");
const router = express.Router();

const contacts = require("../../model/index");

router.get("/", async (req, res, next) => {
  contacts.listContacts().then((data) => res.json(data));
});

router.get("/:contactId", async (req, res, next) => {
  contacts.getContactById(req.params.contactId).then((data) => res.json(data));
});

router.post("/", async (req, res, next) => {
  contacts.addContact(req.body).then((data) => res.json(data));
});

router.delete("/:contactId", async (req, res, next) => {
  contacts.removeContact(req.params.contactId).then((data) => res.json(data));
});

router.patch("/:contactId", async (req, res, next) => {
  contacts
    .updateContact(req.params.contactId, req.body)
    .then((data) => res.json(data));
});

module.exports = router;
