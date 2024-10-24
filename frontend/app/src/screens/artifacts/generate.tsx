import { BUTTON_TYPES, Button } from "@/components/buttons/button";
import { ALERT_TYPES, Alert } from "@/components/ui/alert";
import { CONFIG } from "@/config/config";
import { QSP } from "@/config/qsp";
import { useAuth } from "@/hooks/useAuth";
import { classNames } from "@/utils/common";
import { fetchUrl, getUrlWithQsp } from "@/utils/fetch";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { StringParam, useQueryParam } from "use-query-params";

type tGenerateProps = {
  label?: string;
  artifactid?: string;
  definitionid?: string;
};

export const Generate = (props: tGenerateProps) => {
  const { label, artifactid, definitionid } = props;

  const { objectid } = useParams();
  const auth = useAuth();

  const [branch] = useQueryParam(QSP.BRANCH, StringParam);
  const [at] = useQueryParam(QSP.DATETIME, StringParam);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  const handleGenerate = async () => {
    try {
      setIsLoading(true);

      const url = CONFIG.ARTIFACTS_GENERATE_URL(definitionid || objectid);

      const options: string[][] = [
        ["branch", branch ?? ""],
        ["at", at ?? ""],
      ].filter(([, v]) => v !== undefined && v !== "");

      const urlWithQsp = getUrlWithQsp(url, options);

      await fetchUrl(urlWithQsp, {
        method: "POST",
        headers: {
          authorization: `Bearer ${auth.accessToken}`,
        },
        ...(artifactid ? { body: JSON.stringify({ nodes: [artifactid] }) } : {}),
      });

      if (artifactid) {
        toast(<Alert message="Artifact re-generated" type={ALERT_TYPES.SUCCESS} />);
      } else {
        toast(<Alert message="Artifacts generated" type={ALERT_TYPES.SUCCESS} />);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error when generating artifacts: ", error);

      setIsLoading(false);
    }
  };

  return (
    <Button
      disabled={!isAuthenticated || isLoading}
      onClick={handleGenerate}
      className="mr-4"
      buttonType={BUTTON_TYPES.VALIDATE}
    >
      {label ?? "Generate"}
      <ArrowPathIcon
        className={classNames("ml-2 h-4 w-4", isLoading ? "animate-spin" : "")}
        aria-hidden="true"
      />
    </Button>
  );
};
