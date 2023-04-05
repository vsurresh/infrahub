import Handlebars from "handlebars";
import { graphQLClient } from "../graphqlClient";
import { iNodeSchema } from "../state/atoms/schema.atom";
import { getStringJSONWithoutQuotes } from "./getStringJSONWithoutQuotes";

const mutationTemplate = Handlebars.compile(`mutation {{kind.value}}Create {
  {{name}}_create (data: {{{data}}}) {
      ok
  }
}
`);

const createObject = async (schema: iNodeSchema, updateObject: any[]) => {
  const mutation = mutationTemplate({
    name: schema.name,
    data: getStringJSONWithoutQuotes(updateObject),
  });
  return graphQLClient.request(mutation);
};

export default createObject;