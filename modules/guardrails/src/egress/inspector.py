from dataclasses import dataclass

from modules.guardrails.contracts.verdicts import EgressDecision
from modules.guardrails.src.dlp.screening import sensitivity_gate


_ALLOWED_ORIGINS = {"PROMPT_TEMPLATE", "SANITIZED_QUERY", "EVIDENCE_CAPSULE", "TOOL_DEFINITION"}


@dataclass(frozen=True)
class EgressSegment:
    origin: str
    content: str
    reference: str


class EgressSpy:
    def __init__(self):
        self.calls = ()

    def __call__(self, segments):
        self.calls += (tuple(segments),)


def inspect_egress(segments):
    if not segments:
        return EgressDecision(False, "UNATTRIBUTED_SEGMENT")
    if any(segment.origin not in _ALLOWED_ORIGINS or not segment.reference for segment in segments):
        return EgressDecision(False, "UNATTRIBUTED_SEGMENT")
    return EgressDecision(True, "ALLOWED")


def dispatch_if_allowed(user_query, segments, send):
    if not sensitivity_gate(user_query).egress_allowed:
        return EgressDecision(False, "SENSITIVITY_DENIED")
    decision = inspect_egress(segments)
    if not decision.allowed:
        return decision
    send(segments)
    return decision
