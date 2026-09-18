from schemas.brand import BrandProfile
from services.query_generator import generate_kol_search_queries


def test_generate_kol_search_queries_deduplication_and_limit():
    brand = BrandProfile(
        brand_name="Khaokho Talaypu",
        industry="Herbal Haircare",
        products_services=["แชมพูมะกรูด", "ทรีทเม้นท์"],
        content_themes=["Haircare Tips", "Organic Living"],
        keywords=["แชมพูสมุนไพร", "ลดผมร่วง", "ออร์แกนิก"],
        summary="Herbal brand",
    )

    queries = generate_kol_search_queries(brand, max_queries=5)
    assert len(queries) <= 5
    assert len(queries) == len(set(q.lower() for q in queries))
    assert "แชมพูสมุนไพร" in queries or "แชมพูมะกรูด" in queries
