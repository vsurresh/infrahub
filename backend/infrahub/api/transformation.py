from typing import TYPE_CHECKING, Union

from fastapi import APIRouter, Depends, HTTPException, Path, Request
from graphql import graphql
from neo4j import AsyncSession
from starlette.responses import JSONResponse, PlainTextResponse

from infrahub.api.dependencies import (
    BranchParams,
    get_branch_params,
    get_current_user,
    get_session,
)
from infrahub.core import registry
from infrahub.core.manager import NodeManager
from infrahub.message_bus.events import (
    InfrahubRPCResponse,
    InfrahubTransformRPC,
    RPCStatusCode,
    TransformMessageAction,
)

if TYPE_CHECKING:
    from infrahub.message_bus.rpc import InfrahubRpcClient

router = APIRouter()


@router.get("/transform/{transform_url:path}")
async def transform_python(
    request: Request,
    transform_url: str,
    session: AsyncSession = Depends(get_session),
    branch_params: BranchParams = Depends(get_branch_params),
    _: str = Depends(get_current_user),
) -> JSONResponse:
    params = {key: value for key, value in request.query_params.items() if key not in ["branch", "rebase", "at"]}

    transform_schema = registry.get_node_schema(name="TransformPython", branch=branch_params.branch)
    transforms = await NodeManager.query(
        session=session,
        schema=transform_schema,
        filters={"url__value": transform_url},
        branch=branch_params.branch,
        at=branch_params.at,
    )

    if not transforms:
        raise HTTPException(status_code=404, detail="Item not found")

    transform = transforms[0]

    query = await transform.query.get_peer(session=session)  # type: ignore[attr-defined]
    repository = await transform.repository.get_peer(session=session)  # type: ignore[attr-defined]

    schema = registry.schema.get_schema_branch(name=branch_params.branch.name)
    gql_schema = await schema.get_graphql_schema(session=session)

    result = await graphql(
        gql_schema,
        source=query.query.value,
        context_value={
            "infrahub_branch": branch_params.branch,
            "infrahub_at": branch_params.at,
            "infrahub_database": request.app.state.db,
            "infrahub_session": session,
        },
        root_value=None,
        variable_values=params,
    )

    if result.errors:
        errors = []
        for error in result.errors:
            error_locations = error.locations or []
            errors.append(
                {
                    "message": f"GraphQLQuery {query.name.value}: {error.message}",
                    "path": error.path,
                    "locations": [{"line": location.line, "column": location.column} for location in error_locations],
                }
            )

        return JSONResponse(status_code=500, content={"errors": errors})

    rpc_client: InfrahubRpcClient = request.app.state.rpc_client

    response: InfrahubRPCResponse = await rpc_client.call(
        message=InfrahubTransformRPC(
            action=TransformMessageAction.PYTHON,
            repository=repository,
            data=result.data,  # type: ignore[arg-type]
            branch_name=branch_params.branch.name,
            transform_location=f"{transform.file_path.value}::{transform.class_name.value}",  # type: ignore[attr-defined]
        )
    )

    if not isinstance(response.response, dict):
        return JSONResponse(status_code=500, content={"errors": ["No content received from InfrahubTransformRPC."]})

    if response.status == RPCStatusCode.OK.value:
        return JSONResponse(content=response.response.get("transformed_data"))

    return JSONResponse(status_code=response.status, content={"errors": response.errors})


@router.get("/rfile/{rfile_id}", response_class=PlainTextResponse)
async def generate_rfile(
    request: Request,
    rfile_id: str = Path(description="ID or Name of the RFile to render"),
    session: AsyncSession = Depends(get_session),
    branch_params: BranchParams = Depends(get_branch_params),
    _: str = Depends(get_current_user),
) -> PlainTextResponse:
    params = {key: value for key, value in request.query_params.items() if key not in ["branch", "rebase", "at"]}

    rfile = await NodeManager.get_one(session=session, id=rfile_id, branch=branch_params.branch, at=branch_params.at)

    if not rfile:
        rfile_schema = registry.get_node_schema(name="RFile", branch=branch_params.branch)
        items = await NodeManager.query(
            session=session,
            schema=rfile_schema,
            filters={rfile_schema.default_filter: rfile_id},
            branch=branch_params.branch,
            at=branch_params.at,
        )
        if items:
            rfile = items[0]

    if not rfile:
        raise HTTPException(status_code=404, detail="Item not found")

    query = await rfile.query.get_peer(session=session)  # type: ignore[attr-defined]
    repository = await rfile.template_repository.get_peer(session=session)  # type: ignore[attr-defined]

    schema = registry.schema.get_schema_branch(name=branch_params.branch.name)
    gql_schema = await schema.get_graphql_schema(session=session)

    result = await graphql(
        gql_schema,
        source=query.query.value,
        context_value={
            "infrahub_branch": branch_params.branch,
            "infrahub_at": branch_params.at,
            "infrahub_database": request.app.state.db,
            "infrahub_session": session,
        },
        root_value=None,
        variable_values=params,
    )

    if result.errors:
        errors = []
        for error in result.errors:
            error_locations = error.locations or []
            errors.append(
                {
                    "message": f"GraphQLQuery {query.name.value}: {error.message}",
                    "path": error.path,
                    "locations": [{"line": location.line, "column": location.column} for location in error_locations],
                }
            )

        return JSONResponse(status_code=500, content={"errors": errors})

    rpc_client: InfrahubRpcClient = request.app.state.rpc_client

    response: InfrahubRPCResponse = await rpc_client.call(
        message=InfrahubTransformRPC(
            action=TransformMessageAction.JINJA2,
            repository=repository,
            data=result.data,  # type: ignore[arg-type]
            branch_name=branch_params.branch.name,
            transform_location=rfile.template_path.value,  # type: ignore[attr-defined]
        )
    )

    if not isinstance(response.response, dict):
        return JSONResponse(status_code=500, content={"errors": ["No content received from InfrahubTransformRPC."]})

    if response.status == RPCStatusCode.OK.value:
        return PlainTextResponse(content=response.response.get("rendered_template"))

    return JSONResponse(status_code=response.status, content={"errors": response.errors or []})
