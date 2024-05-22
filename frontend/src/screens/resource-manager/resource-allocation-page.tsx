import { Link, useParams } from "react-router-dom";
import useQuery from "../../hooks/useQuery";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Table } from "../../components/table/table";
import { GET_RESOURCE_POOL_ALLOCATED } from "./graphql/resource-pool";
import { RESOURCE_POOL_ALLOCATED_KIND } from "./constants";
import { Icon } from "@iconify-icon/react";
import { Button } from "../../components/buttons/button-primitive";
import { constructPath } from "../../utils/fetch";
import { getObjectDetailsUrl2 } from "../../utils/objects";
import { Skeleton } from "../../components/skeleton";
import { QSP } from "../../config/qsp";

const ResourceAllocationPage = () => {
  const { resourcePoolId, resourceId } = useParams();
  const { data, loading } = useQuery(GET_RESOURCE_POOL_ALLOCATED, {
    variables: { poolId: resourcePoolId, resourceId: resourceId },
  });

  if (loading) return <ResourceAllocationPageSkeleton />;

  const getResourcePoolAllocatedData = data[RESOURCE_POOL_ALLOCATED_KIND];
  const resourcesAllocated = getResourcePoolAllocatedData.edges.map(({ node }: any) => ({
    values: { ...node },
    link: constructPath(getObjectDetailsUrl2(node.kind, node.id), [
      { name: QSP.BRANCH, value: node.branch },
    ]),
  }));
  const totalOfResourcesAllocated = getResourcePoolAllocatedData.count;

  const columns = [
    {
      name: "display_label",
      label: "Display label",
    },
    {
      name: "branch",
      label: "Branch",
    },
    {
      name: "identifier",
      label: "Identifier",
    },
    {
      name: "kind",
      label: "Kind",
    },
    {
      name: "id",
      label: "ID",
    },
  ];
  return (
    <Card>
      <div className="pb-2 flex bg-custom-white items-center gap-1">
        <h3 className="font-semibold">Allocated resources</h3>
        <Badge>{totalOfResourcesAllocated}</Badge>

        <Link to={constructPath(`/resource-manager/${resourcePoolId}`)} className="ml-auto">
          <Button size="icon" variant="ghost">
            <Icon icon="mdi:close" className="text-xl" />
          </Button>
        </Link>
      </div>

      <Table columns={columns} rows={resourcesAllocated} />
    </Card>
  );
};

const ResourceAllocationPageSkeleton = () => {
  const { resourcePoolId } = useParams();

  return (
    <Card className="w-full max-w-[606px]">
      <div className="pb-2 flex bg-custom-white items-center gap-1">
        <h3 className="font-semibold">Allocated resources</h3>
        <Badge>...</Badge>

        <Link to={constructPath(`/resource-manager/${resourcePoolId}`)} className="ml-auto">
          <Button size="icon" variant="ghost">
            <Icon icon="mdi:close" className="text-xl" />
          </Button>
        </Link>
      </div>

      <div className="space-y-1">
        <Skeleton className="h-7" />
        <Skeleton className="h-7" />
        <Skeleton className="h-7" />
        <Skeleton className="h-7" />
        <Skeleton className="h-7" />
      </div>
    </Card>
  );
};
export default ResourceAllocationPage;