const validateFields = (body, errors) => {
  for (let key of Object.keys(body)) {
    if (key !== "name" && key !== "email" && key !== "phone")
      errors.push(`${key} field is not allowed`);
    else if (typeof body[key] !== "string" || !body[key].length)
      errors.push(`${key} field error`);
  }
};

const validatePostBody = (body) => {
  const errors = [];
  if (typeof body === "object") {
    validateFields(body, errors);
    ["name", "email", "phone"].map((key) => {
      if (!body[key]) errors.push(`${key} field is missing`);
    });
  } else errors.push("Invalid body");
  return errors;
};

const validatePatchBody = (body) => {
  const errors = [];
  if (typeof body === "object") {
    validateFields(body, errors);
    if (!["name", "email", "phone"].some((key) => body[key]))
      errors.push("fields are missing");
  } else errors.push("Invalid body");
  return errors;
};

module.exports = {
  validatePostBody,
  validatePatchBody,
};
