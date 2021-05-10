const express = require("express");
const router = express.Router();

const contacts = require("../../model/index");

const { validatePostBody, validatePatchBody } = require("./validators");

router.get("/", async (req, res, next) => {
  contacts.listContacts().then((data) =>
    res.json({
      status: "success",
      code: 200,
      data,
    })
  );
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  if (isNaN(contactId))
    res.json({
      status: "failure",
      code: 404,
      message: "Not found",
    });
  else
    contacts.getContactById(req.params.contactId).then((data) => {
      if (data)
        res.json({
          status: "success",
          code: 200,
          data,
        });
      else
        res.json({
          status: "failure",
          code: 404,
          message: "Not found",
        });
    });
});

router.post("/", async (req, res, next) => {
  const { body } = req;
  const errors = validatePostBody(body);
  if (errors.length)
    res.json({
      status: "failure",
      code: 400,
      message: errors.join(", "),
    });
  else
    contacts.addContact(req.body).then((data) =>
      res.json({
        status: "success",
        code: 201,
        data,
      })
    );
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  if (isNaN(contactId))
    res.json({
      status: "failure",
      code: 404,
      message: "Not found",
    });
  else
    contacts.removeContact(contactId).then((data) => {
      if (data)
        res.json({
          status: "success",
          code: 200,
          message: "Contact deleted",
        });
      else
        res.json({
          status: "failure",
          code: 404,
          message: "Not found",
        });
    });
});

router.patch("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const { body } = req;
  const errors = validatePatchBody(body);
  if (isNaN(contactId)) errors.push("ID field error");
  if (errors.length)
    res.json({
      status: "failure",
      code: 400,
      message: errors.join(", "),
    });
  else
    contacts.updateContact(contactId, body).then((data) => {
      if (data)
        res.json({
          status: "success",
          code: 200,
          data,
        });
      else
        res.json({
          status: "failure",
          code: 404,
          message: "Not found",
        });
    });
});

module.exports = router;
