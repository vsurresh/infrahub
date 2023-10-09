from pydantic import Field

from infrahub.message_bus import InfrahubBaseMessage


class FinalizeValidatorExecution(InfrahubBaseMessage):
    """Update the status of a validator after all checks have been completed."""

    validator_id: str = Field(..., description="The id of the validator associated with this check")
    validator_execution_id: str = Field(..., description="The id of current execution of the associated validator")
    start_time: str = Field(..., description="Start time when the message was first created")