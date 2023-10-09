import { gql } from "@apollo/client";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { StringParam, useQueryParam } from "use-query-params";
import { QSP } from "../../../config/qsp";
import { getValidatorDetails } from "../../../graphql/queries/diff/getValidatorDetails";
import useQuery from "../../../hooks/useQuery";
import { iNodeSchema, schemaState } from "../../../state/atoms/schema.atom";
import { getObjectItemDisplayValue } from "../../../utils/getObjectItemDisplayValue";
import ErrorScreen from "../../error-screen/error-screen";
import LoadingScreen from "../../loading-screen/loading-screen";
import { Check } from "./check";

const getValidatorAttributes = (typename: string, schemaList: iNodeSchema[]) => {
  const schema = schemaList.find((schema: iNodeSchema) => schema.kind === typename);

  if (!schema) return [];

  return schema.attributes;
};

export const ValidatorDetails = () => {
  const [schemaList] = useAtom(schemaState);
  const [qspTab, setQsp] = useQueryParam(QSP.VALIDATOR_DETAILS, StringParam);

  const queryString = getValidatorDetails({
    id: qspTab,
  });

  const query = gql`
    ${queryString}
  `;

  const { loading, error, data } = useQuery(query);
  console.log("data: ", data);

  useEffect(() => {
    return () => {
      // When unmounting, remove validator details view QSP
      setQsp(undefined);
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message="Something went wrong when fetching the validator details." />;
  }

  const validator = data?.CoreValidator?.edges[0]?.node;

  const attributes = getValidatorAttributes(validator?.__typename, schemaList);

  return (
    <div className="flex-1 overflow-auto flex flex-col">
      <div className="flex flex-col">
        <div className="bg-custom-white overflow-auto">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-3 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{validator.id} </dd>
            </div>

            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-3 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {validator?.display_label}
              </dd>
            </div>

            {attributes?.map((attribute) => {
              return (
                <div
                  className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-3 sm:px-6"
                  key={attribute.name}>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    {attribute.label}
                  </dt>

                  <div className="flex items-center">
                    <dd className={"mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0"}>
                      {getObjectItemDisplayValue(validator, attribute)}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-2 3xl:grid-cols-3 gap-4 p-4">
        {validator?.checks?.edges?.map((check: any, index: number) => (
          <Check key={index} check={check?.node} />
        ))}
      </div>
    </div>
  );
};