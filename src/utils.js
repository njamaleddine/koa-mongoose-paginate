function removeNonModelFields(queryParams, model) {
  const cleanedQueryParams = {};

  Object.keys(model.schema.obj).forEach((key) => {
    Object.keys(queryParams).forEach((paramKey) => {
      if (key.indexOf(paramKey) === 0) {
        cleanedQueryParams[key] = queryParams[key];
      }
    });
  });

  return cleanedQueryParams;
}

module.exports = {
  removeNonModelFields,
};
