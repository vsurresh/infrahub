import { gql } from "@apollo/client";
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ALERT_TYPES, Alert } from "../../../components/alert";
import { Badge } from "../../../components/badge";
import { Retry } from "../../../components/retry";
import {
  PROPOSED_CHANGES_VALIDATOR_OBJECT,
  VALIDATIONS_ENUM_MAP,
  VALIDATION_STATES,
} from "../../../config/constants";
import graphqlClient from "../../../graphql/graphqlClientApollo";
import { runCheck } from "../../../graphql/mutations/diff/runCheck";
import { genericsState } from "../../../state/atoms/schema.atom";
import { schemaKindNameState } from "../../../state/atoms/schemaKindName.atom";
import { getValidatorsStats } from "../../../utils/checks";

type tChecksSummaryProps = {
  validators: any[];
  refetch: Function;
};

export const ChecksSummary = (props: tChecksSummaryProps) => {
  const { validators, refetch } = props;

  const { proposedchange } = useParams();
  const [schemaKindName] = useAtom(schemaKindNameState);
  const [schemaList] = useAtom(genericsState);

  const schemaData = schemaList.find((s) => s.kind === PROPOSED_CHANGES_VALIDATOR_OBJECT);

  const validatorKinds = schemaData?.used_by ?? [];

  const validatorsCount = validatorKinds.reduce((acc, kind) => {
    const relatedValidators = validators.filter((validator: any) => validator.__typename === kind);

    return { ...acc, [kind]: getValidatorsStats(relatedValidators) };
  }, {});

  const validatorsInProgress = validators.filter(
    (validator: any) => validator?.state?.value === VALIDATION_STATES.IN_PROGRESS
  );

  const handleRetry = async (validator: string) => {
    const runParams = {
      id: proposedchange,
      check_type: VALIDATIONS_ENUM_MAP[validator],
    };

    const mustationString = runCheck(runParams);

    const mutation = gql`
      ${mustationString}
    `;

    const result = await graphqlClient.mutate({ mutation });

    refetch();

    if (result?.data?.CoreProposedChangeRunCheck?.ok) {
      toast(<Alert type={ALERT_TYPES.SUCCESS} message="Checks are running" />);
    } else {
      toast(
        <Alert type={ALERT_TYPES.ERROR} message="Something went wrong while running the checks" />
      );
    }
  };

  return (
    <div className="flex p-4 pb-0">
      <div className="flex items-center justify-between p-2 mr-2 rounded-md bg-custom-white">
        Retry all:{" "}
        <Retry onClick={() => handleRetry("all")} isInProgress={!!validatorsInProgress.length} />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-2 items-center justify-between">
        {Object.entries(validatorsCount).map(([kind, stats]: [string, any]) => (
          <div
            key={kind}
            className="flex flex-1 items-center justify-between p-2 rounded-md bg-custom-white">
            <Badge>{schemaKindName[kind]}</Badge>

            <div className="flex items-center mr-2">
              <div className="flex items-center mr-2">
                {!!stats.failure && <ExclamationCircleIcon className="mr-2 h-4 w-4 text-red-500" />}

                {!!stats.inProgress && (
                  <ArrowPathIcon className="mr-2 h-4 w-4 text-orange-500 animate-spin" />
                )}

                {!stats.failure && !stats.inProgress && (
                  <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
                )}

                <span>
                  {JSON.stringify(stats.success)}/{JSON.stringify(stats.total)}
                </span>
              </div>
            </div>

            <Retry onClick={() => handleRetry(kind)} isInProgress={!!stats.inProgress} />
          </div>
        ))}
      </div>
    </div>
  );
};