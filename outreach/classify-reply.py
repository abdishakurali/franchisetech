#!/usr/bin/env python3
"""Classify inbound Zoho reply text for outreach compliance."""
from __future__ import annotations

import re

OPT_OUT = re.compile(
    r"\b(stop|unsubscribe|remove|nu mai|dezabon|retrage|spam)\b",
    re.I,
)
INTERESTED = re.compile(
    r"\b(demo|trial|interesat|interes|sun|telefon|whatsapp|program|call|"
    r"meeting|întâlnire|intalnire|prezentare|prezent|detalii|info)\b",
    re.I,
)
AUTO_REPLY = re.compile(
    r"\b(out of office|vacation|concediu|absent|automatic reply|auto.?reply|"
    r"răspuns automat|raspuns automat)\b",
    re.I,
)
BOUNCE_SUBJECT = re.compile(
    r"\b(undelivered|delivery failed|returned to sender|mail delivery)\b",
    re.I,
)
BOUNCE_SENDER = re.compile(r"mailer-daemon|postmaster", re.I)


def classify(from_address: str, subject: str, snippet: str) -> str:
    """Return: opt_out | bounce | interested | auto_reply | other"""
    body = f"{subject}\n{snippet}"
    sender = from_address or ""

    if BOUNCE_SENDER.search(sender) or BOUNCE_SUBJECT.search(subject):
        return "bounce"
    if OPT_OUT.search(body):
        return "opt_out"
    if AUTO_REPLY.search(body):
        return "auto_reply"
    if INTERESTED.search(body):
        return "interested"
    return "other"
