import { graphql } from "graphql";

export const executeGraphql = (schema, source) => {
  return graphql({
    schema,
    source,
    contextValue: {
      user: "user",
      db: "example db"
    }
  });
};
