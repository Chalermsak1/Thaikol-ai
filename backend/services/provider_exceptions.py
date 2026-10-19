from typing import Optional


class ProviderError(Exception):
    """Base exception for all external data provider operations."""

    def __init__(
        self,
        message: str,
        provider: str = "unknown",
        status_code: Optional[int] = None,
    ):
        super().__init__(message)
        self.message = message
        self.provider = provider
        self.status_code = status_code


class ProviderConfigurationError(ProviderError):
    """Raised when an external live provider is invoked without required credentials/tokens."""

    pass


class ProviderRateLimitError(ProviderError):
    """Raised when an external provider rate limit (HTTP 429) is encountered."""

    pass


class ProviderTimeoutError(ProviderError):
    """Raised when external provider operations exceed the configured timeout."""

    pass


class ProviderAuthenticationError(ProviderError):
    """Raised when provider authentication fails (e.g. invalid API token, 401/403)."""

    pass
