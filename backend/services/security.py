import ipaddress
import socket
from urllib.parse import urlparse


def validate_safe_url(url: str) -> str:
    """Validates that a URL uses http/https and does not point to localhost, private,

    or reserved IP addresses (SSRF prevention). Returns the cleaned URL string.
    Raises ValueError with a user-friendly error message if validation fails.
    """
    if not url or not isinstance(url, str):
        raise ValueError("URL must be a non-empty string.")

    url = url.strip()
    parsed = urlparse(url)

    # 1. Scheme validation
    if parsed.scheme.lower() not in ("http", "https"):
        raise ValueError(f"Invalid URL scheme '{parsed.scheme}'. Only http and https are allowed.")

    hostname = parsed.hostname
    if not hostname:
        raise ValueError("URL must contain a valid hostname.")

    hostname_lower = hostname.lower().strip()

    # 2. Reject obvious localhost / special names
    forbidden_hosts = {
        "localhost",
        "127.0.0.1",
        "::1",
        "0.0.0.0",
        "host.docker.internal",
        "metadata.google.internal",
    }
    if hostname_lower in forbidden_hosts or hostname_lower.endswith(".local") or hostname_lower.endswith(".internal"):
        raise ValueError(f"Access to private or local host '{hostname}' is prohibited.")

    # 3. Resolve DNS and inspect resolved IP addresses
    try:
        addr_info = socket.getaddrinfo(hostname, None, proto=socket.IPPROTO_TCP)
    except socket.gaierror as e:
        raise ValueError(f"Could not resolve hostname '{hostname}': {e}")

    for entry in addr_info:
        ip_str = entry[4][0]
        try:
            ip = ipaddress.ip_address(ip_str)
            if (
                ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_multicast
                or ip.is_reserved
                or ip.is_unspecified
            ):
                raise ValueError(f"Access to private or loopback IP range ({ip}) is prohibited.")
        except ValueError as ip_err:
            if "prohibited" in str(ip_err):
                raise
            # If parsing fails for unexpected reasons, reject for safety
            raise ValueError(f"Invalid IP address encountered during resolution: {ip_str}")

    return url
