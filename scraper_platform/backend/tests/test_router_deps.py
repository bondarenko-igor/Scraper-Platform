from scraper_platform.backend.app.api import api_v1
from scraper_platform.backend.app.routers.utils import service_dep


def test_service_dep_uses_resolved_session() -> None:
    session = object()

    service = service_dep(session)  # type: ignore[arg-type]

    assert service.session is session
    assert service.jobs.session is session
    assert service.proxies.session is session


def test_proxy_routes_match_documented_api() -> None:
    route_methods = {(route.path, tuple(sorted(route.methods))) for route in api_v1.routes}

    assert ("/v1/proxies", ("GET",)) in route_methods
    assert ("/v1/proxies", ("POST",)) in route_methods
    assert ("/v1/jobs/proxies", ("GET",)) not in route_methods
    assert ("/v1/jobs/proxies", ("POST",)) not in route_methods
